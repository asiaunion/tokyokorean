#!/usr/bin/env python3
"""
TokyoKorean → 네이버/다음 백링크 초안 재료 추출기
====================================================
GSF-Ark naver_blog_gen.py와 동일한 방식: API 호출 없이 원문에서 재료를 추출한다.
최종 초안 문장은 AG(에이전트)가 직접 작성해 backlink-drafts/*.txt 에 저장한다.

사용법:
  python3 scripts/backlink_draft_gen.py --list
  python3 scripts/backlink_draft_gen.py --extract nihonbashi-why-i-live-here

출력(--extract):
  콘솔에 원문 메타 + 핵심 포인트 박스(있으면) + 관련 글 링크를 출력.
  AG는 이를 참고해 backlink-drafts/{slug}-{channel}.txt 를 직접 작성한다.

CTA 순환·slug 검증은 이 스크립트가 담당하고, 문장 생성은 담당하지 않는다.
"""

import re
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime, timezone, timedelta

BASE_DIR    = Path(__file__).parent.parent
BLOG_DIR    = BASE_DIR / "src" / "data" / "blog" / "ko"
OUT_DIR     = BASE_DIR / "backlink-drafts"
LOG_FILE    = OUT_DIR / "backlink-log.json"
SITE_ORIGIN = "https://tokyokorean.net"
JST         = timezone(timedelta(hours=9))

# ── CTA 문구 풀 (§2 조건 2: 최소 5개, 채널별) ──────────────────────────────
CTA_POOL = {
    "naver": [
        "사진과 함께 더 자세히 정리했습니다 👉",
        "실제 경험을 더 길게 기록했습니다 👉",
        "지도와 함께 정리해두었습니다 👉",
        "더 꼼꼼하게 적어둔 내용이 여기 있습니다 👉",
        "이것저것 다 담아서 정리해두었습니다 👉",
        "현장 사진과 함께 올려두었습니다 👉",
    ],
    "daum": [
        "상세 내용은 원문에서 확인하실 수 있습니다 →",
        "더 자세한 정보를 정리해두었습니다 →",
        "관련 내용을 글로 정리해두었습니다 →",
        "현지 경험을 바탕으로 정리한 글입니다 →",
        "사진과 함께 자세히 기록해두었습니다 →",
        "실제 경험담을 상세히 담아두었습니다 →",
    ],
}

HASHTAGS = {
    "naver": "#도쿄생활 #일본생활 #도쿄여행 #해외생활 #일본이주 #tokyokorean",
    "daum":  "#도쿄생활 #일본생활정보 #도쿄여행 #일본이민 #해외거주 #tokyokorean",
}


# ── MD 파싱 ─────────────────────────────────────────────────────────────────
def parse_frontmatter(text: str) -> tuple[dict, str]:
    m = re.match(r'^---\n(.*?)\n---\n(.*)', text, re.DOTALL)
    if not m:
        return {}, text
    yaml_block, body = m.group(1), m.group(2)

    meta = {}
    for key in ('title', 'description'):
        match = re.search(rf'^{key}[:\s]+"?([^"\n]+)"?', yaml_block, re.MULTILINE)
        meta[key] = match.group(1).strip() if match else ''

    draft_m = re.search(r'^draft[:\s]+(\S+)', yaml_block, re.MULTILINE)
    meta['draft'] = draft_m.group(1).strip().lower() == 'true' if draft_m else False

    tags_block = re.search(r'^tags:(.*?)(?=\n\S|\Z)', yaml_block, re.DOTALL | re.MULTILINE)
    meta['tags'] = re.findall(r'^\s+-\s+(.+)$', tags_block.group(1), re.MULTILINE) if tags_block else []

    return meta, body.strip()


def extract_summary_box(body: str) -> str:
    """포스트 하단의 '> ## ...' 핵심 포인트 인용 박스를 그대로 추출"""
    m = re.search(r'\n> #.*', body, re.DOTALL)
    if not m:
        return ''
    box = m.group(0)
    # 관련 글 목록 이전까지만 (관련 글은 별도 처리)
    return box.strip()


def extract_related_posts(body: str) -> list[str]:
    """'관련 글' 목록에서 slug 추출"""
    return re.findall(r'\(/posts/([a-z0-9\-]+)/\)', body)


def extract_lead_paragraph(body: str) -> str:
    """frontmatter 이후 첫 실질 단락(오프닝 훅)"""
    for line in body.split('\n'):
        s = line.strip()
        if not s or s.startswith(('#', '!', '>', '|')):
            continue
        return s
    return ''


# ── slug 검증 (§2 조건 3: published 게시물만) ───────────────────────────────
def validate_slug(slug: str) -> tuple[bool, dict]:
    post_path = BLOG_DIR / f"{slug}.md"
    if not post_path.exists():
        return False, {}
    text = post_path.read_text(encoding='utf-8')
    meta, _ = parse_frontmatter(text)
    if meta.get('draft', False):
        return False, meta
    return True, meta


def list_posts():
    slugs = sorted([f.stem for f in BLOG_DIR.glob('*.md')])
    published, drafts = [], []
    for s in slugs:
        ok, _ = validate_slug(s)
        (published if ok else drafts).append(s)
    print(f"\n✅ Published ({len(published)}개):")
    for s in published:
        print(f"  {s}")
    if drafts:
        print(f"\n⏸ Draft ({len(drafts)}개, 생성 불가):")
        for s in drafts:
            print(f"  {s}")
    print()


# ── CTA 로그 관리 (연속 중복 방지) ──────────────────────────────────────────
def load_log() -> dict:
    if LOG_FILE.exists():
        return json.loads(LOG_FILE.read_text(encoding='utf-8'))
    return {"generated": [], "cta_last_used": {"naver": None, "daum": None}}


def save_log(log: dict):
    OUT_DIR.mkdir(exist_ok=True)
    LOG_FILE.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding='utf-8')


def pick_cta(channel: str, log: dict) -> str:
    pool = CTA_POOL[channel]
    last = log.get("cta_last_used", {}).get(channel)
    for cta in pool:
        if cta != last:
            return cta
    return pool[0]


def record_generated(slug: str, channel: str, cta_phrase: str, output_file: str):
    log = load_log()
    canonical_url = f"{SITE_ORIGIN}/posts/{slug}/"
    log.setdefault("generated", []).append({
        "slug": slug,
        "channel": channel,
        "generated_at": datetime.now(JST).isoformat(),
        "canonical_url": canonical_url,
        "cta_phrase": cta_phrase,
        "output_file": output_file,
        "status": "draft",
    })
    log.setdefault("cta_last_used", {})[channel] = cta_phrase
    save_log(log)


# ── 재료 추출 (AG가 참고할 자료 출력) ───────────────────────────────────────
def extract(slug: str, channel: str):
    ok, meta = validate_slug(slug)
    if not ok:
        post_path = BLOG_DIR / f"{slug}.md"
        if not post_path.exists():
            print(f"❌ 파일 없음: {slug}.md")
        else:
            print(f"❌ draft: true — published 게시물만 가능: {slug}")
        sys.exit(1)

    post_path = BLOG_DIR / f"{slug}.md"
    text = post_path.read_text(encoding='utf-8')
    _, body = parse_frontmatter(text)

    canonical_url = f"{SITE_ORIGIN}/posts/{slug}/"
    log = load_log()
    cta_phrase = pick_cta(channel, log)

    print(f"\n{'='*70}")
    print(f"슬러그: {slug}")
    print(f"채널: {channel}")
    print(f"제목: {meta.get('title', '')}")
    print(f"설명: {meta.get('description', '')}")
    print(f"URL: {canonical_url}")
    print(f"CTA(이번 회차): {cta_phrase}")
    print(f"해시태그: {HASHTAGS[channel]}")
    print(f"\n[오프닝 원문]\n{extract_lead_paragraph(body)}")
    print(f"\n[핵심 포인트 박스]\n{extract_summary_box(body)}")
    print(f"{'='*70}\n")
    print("AG는 위 재료를 참고해 §2 품질 조건(고정 템플릿 금지·구체적 디테일 보존·")
    print("30~40% 재구성·구어체)에 맞춰 backlink-drafts/{}-{}.txt 를 직접 작성할 것.".format(slug, channel))


def main():
    parser = argparse.ArgumentParser(description='TokyoKorean 백링크 초안 재료 추출기 (AG 직접 작성 방식)')
    parser.add_argument('--extract', metavar='SLUG', help='재료 추출 (AG가 참고할 자료 출력)')
    parser.add_argument('--channel', choices=['naver', 'daum'], default='naver')
    parser.add_argument('--list', action='store_true', help='사용 가능한 포스트 목록')
    args = parser.parse_args()

    if args.list:
        list_posts()
        return

    if not args.extract:
        parser.print_help()
        sys.exit(1)

    extract(args.extract, args.channel)


if __name__ == '__main__':
    main()
