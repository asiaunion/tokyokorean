#!/usr/bin/env python3
"""
GSF-Blog SNS Scheduler
- sns-log.json을 읽어 미발행 포스트를 찾음
- 블로그 MD 파일에서 제목/설명 추출
- Buffer API로 customScheduled 예약 전송
- 완료 후 sns-log.json 업데이트 (중복 방지)

사용법:
  python3 scripts/sns_scheduler.py --rounds 3        # 다음 3회차 예약
  python3 scripts/sns_scheduler.py --rounds 1 --dry-run  # 실제 전송 없이 미리보기
  python3 scripts/sns_scheduler.py --status          # 현재 진행 현황 출력
"""

import os, sys, json, re, argparse, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── 경로 설정 ──────────────────────────────────────────────────────────────
BASE_DIR  = Path(__file__).parent.parent
LOG_FILE  = BASE_DIR / "sns-drafts" / "sns-log.json"
BLOG_DIR  = BASE_DIR / "src" / "data" / "blog"
ENV_FILE  = BASE_DIR / ".env"
GQL_URL   = "https://api.buffer.com/graphql"
POST_TIME = "09:00"   # JST 발행 시각
JST       = timezone(timedelta(hours=9))

# ── .env 로딩 ──────────────────────────────────────────────────────────────
def load_env():
    env = {}
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip()
    return env

# ── 블로그 MD 파싱 ─────────────────────────────────────────────────────────
def parse_md(slug, locale):
    """slug + locale(ko/en/ja)의 제목·설명·카테고리·ogImage 추출"""
    path = BLOG_DIR / locale / f"{slug}.md"
    if not path.exists():
        path = BLOG_DIR / locale / f"{slug}.mdx"
    if not path.exists():
        return None
    text = path.read_text(encoding='utf-8')
    title  = re.search(r'^title[:\s]+"?([^"\n]+)"?', text, re.MULTILINE)
    desc   = re.search(r'^description[:\s]+"?([^"\n]+)"?', text, re.MULTILINE)
    cat    = re.search(r'^category[:\s]+(\S+)', text, re.MULTILINE)
    tags   = re.findall(r'^\s+-\s+(.+)$', re.search(r'tags:(.*?)(?=\n\S)', text, re.DOTALL).group(1) if re.search(r'tags:', text) else '', re.MULTILINE)
    og_raw = re.search(r'^ogImage[:\s]+"?([^"\n]+)"?', text, re.MULTILINE)
    og_val = og_raw.group(1).strip() if og_raw else None
    # ogImage가 절대 URL이면 그대로, 상대 경로면 origin 붙이기, 없으면 기본 경로
    if og_val and og_val.startswith('http'):
        og_image_url = og_val
    elif og_val:
        og_image_url = f"https://gsfark.com{og_val if og_val.startswith('/') else '/' + og_val}"
    else:
        og_image_url = f"https://gsfark.com/assets/images/blog/{slug}-hero.webp"
    return {
        "title": title.group(1).strip() if title else slug,
        "description": desc.group(1).strip() if desc else "",
        "category": cat.group(1).strip() if cat else "general",
        "tags": tags[:5],
        "og_image_url": og_image_url,
    }

# ── SNS 초안 생성 ──────────────────────────────────────────────────────────
def generate_drafts(slug, meta_ko, meta_en, scheduled_date):
    """6건 초안 생성 (X-EN/KO, LinkedIn-EN/KO, Threads-EN/KO)"""
    url_base = f"https://gsfark.com/posts/{slug}/"
    is_investment = meta_ko and meta_ko.get('category') in ['investment', 'essay']
    disclaimer_ko = "\n정보 제공 목적." if is_investment else ""
    disclaimer_en = "\nFor information purposes only." if is_investment else ""

    def make_url(platform):
        return f"{url_base}?utm_source={platform}&utm_medium=social&utm_campaign=blog-broadcast"

    # 제목 단축 (X용)
    short_title_ko = (meta_ko['title'][:25] + "...") if meta_ko and len(meta_ko['title']) > 28 else (meta_ko['title'] if meta_ko else slug)
    short_title_en = (meta_en['title'][:35] + "...") if meta_en and len(meta_en['title']) > 38 else (meta_en['title'] if meta_en else slug)
    desc_ko = meta_ko['description'][:60] if meta_ko else ""
    desc_en = meta_en['description'][:70] if meta_en else ""

    drafts = {
        "X-EN": f"{short_title_en}\n\n{desc_en}{disclaimer_en}\n\n→ {url_base}\n\n#JapanRealEstate #Tokyo #GSFInsight",
        "X-KO": f"{short_title_ko}\n\n{desc_ko}{disclaimer_ko}\n\n→ {url_base}\n\n#일본부동산 #도쿄 #GSF인사이트",
        "LinkedIn-EN": f"📌 {meta_en['title'] if meta_en else slug}\n\n{meta_en['description'] if meta_en else ''}{disclaimer_en}\n\nRead the full analysis:\n👉 {make_url('linkedin')}\n\n#JapanRealEstate #Tokyo #AsiaInvesting",
        "LinkedIn-KO": f"📌 {meta_ko['title'] if meta_ko else slug}\n\n{meta_ko['description'] if meta_ko else ''}{disclaimer_ko}\n\n전체 내용 →\n👉 {make_url('linkedin')}\n\n#일본부동산 #도쿄 #해외투자",
        "Threads-EN": f"{meta_en['title'] if meta_en else slug}\n\n{meta_en['description'] if meta_en else ''}{disclaimer_en}\n\n→ {make_url('threads')}\n\n#JapanRealEstate #Tokyo",
        "Threads-KO": f"{meta_ko['title'] if meta_ko else slug}\n\n{meta_ko['description'] if meta_ko else ''}{disclaimer_ko}\n\n→ {make_url('threads')}\n\n#일본부동산 #도쿄",
    }

    # X 280자 강제 단축 (URL 포함 실제 280자 이내)
    for key in ["X-EN", "X-KO"]:
        if len(drafts[key]) > 275:
            url_part = re.search(r'\n\n→ https?://\S+\n', drafts[key])
            if url_part:
                body_part = drafts[key][:url_part.start()]
                url_str = url_part.group(0)
                max_body = 275 - len(url_str)
                drafts[key] = body_part[:max_body-3].rstrip() + "..." + url_str
            else:
                drafts[key] = drafts[key][:272] + "..."

    # Threads 500자 강제 단축 (URL 포함 실제 500자 이내)
    for key in ["Threads-EN", "Threads-KO"]:
        if len(drafts[key]) > 495:
            url_part = re.search(r'\n\n→ https?://\S+\n', drafts[key])
            if url_part:
                body_part = drafts[key][:url_part.start()]
                url_str = url_part.group(0)
                max_body = 495 - len(url_str)
                drafts[key] = body_part[:max_body-3].rstrip() + "..." + url_str
            else:
                drafts[key] = drafts[key][:492] + "..."

    return drafts

# ── Buffer API 전송 ────────────────────────────────────────────────────────
MUTATION = """
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess { post { id status } }
    ... on InvalidInputError { message }
    ... on UnauthorizedError { message }
    ... on LimitReachedError { message }
    ... on UnexpectedError { message }
  }
}
"""

def post_to_buffer(token, channel_id, text, due_at_iso, assets_payload=None, dry_run=False, retry=True, platform_name=""):
    import time
    variables = {
        "input": {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "automatic",
            "mode": "customScheduled",
            "dueAt": due_at_iso,
            "saveToDraft": False,
            "assets": assets_payload if assets_payload else []
        }
    }

    if dry_run:
        print(f"   [DRY-RUN] Payload assets for {platform_name}: {json.dumps(variables['input']['assets'])}")
        return {"id": "DRY-RUN", "status": "preview"}

    payload = json.dumps({"query": MUTATION, "variables": variables}).encode()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    req = urllib.request.Request(GQL_URL, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read())
            data = body.get('data', {}).get('createPost', {})
            if data.get('post'):
                time.sleep(0.5)  # 요청 간 0.5초 딜레이
                return data['post']
            return {"error": data.get('message', str(body))}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        if e.code == 429 and retry:
            print(f"   ⏳ Rate limit 감지 — 65초 대기 후 재시도...")
            time.sleep(65)
            return post_to_buffer(token, channel_id, text, due_at_iso, assets_payload, dry_run, retry=False, platform_name=platform_name)
        return {"error": f"HTTP {e.code}: {err_body[:200]}"}
    except Exception as e:
        return {"error": str(e)}

# ── 현황 출력 ──────────────────────────────────────────────────────────────
def show_status(log):
    done = log.get('published', [])
    pending = log.get('pending', [])
    print(f"\n{'='*55}")
    print(f"  GSF-Blog SNS 발행 현황")
    print(f"{'='*55}")
    print(f"  완료: {len(done)}/40 회차")
    print(f"  잔여: {len(pending)} 회차")
    print()
    if done:
        print("✅ 완료된 회차:")
        for p in done:
            if isinstance(p['round'], int):
                print(f"   {p['round']:02d}회차 | {p['date']} | {p['slug'][:45]}")
            else:
                print(f"   {p['round']} | {p['date']} | {p['slug'][:45]}")
    print()
    if pending:
        print("⏳ 예정된 회차 (다음 5개):")
        for p in pending[:5]:
            if isinstance(p['round'], int):
                print(f"   {p['round']:02d}회차 | {p['scheduled_date']} | {p['slug'][:45]}")
            else:
                print(f"   {p['round']} | {p['scheduled_date']} | {p['slug'][:45]}")
    print(f"{'='*55}\n")

# ── 메인 ───────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="GSF-Blog SNS Scheduler")
    parser.add_argument('--rounds', type=int, default=1, help='예약할 회차 수 (기본값: 1)')
    parser.add_argument('--dry-run', action='store_true', help='실제 전송 없이 미리보기')
    parser.add_argument('--status', action='store_true', help='현재 진행 현황 출력')
    args = parser.parse_args()

    # 로그 로딩
    with open(LOG_FILE) as f:
        log = json.load(f)

    if args.status:
        show_status(log)
        return

    env = load_env()
    TOKEN = env['BUFFER_ACCESS_TOKEN']
    channel_map = {
        "X-EN":        env['BUFFER_X_CHANNEL_ID'],
        "X-KO":        env['BUFFER_X_CHANNEL_ID'],
        "LinkedIn-EN": env['BUFFER_LINKEDIN_CHANNEL_ID'],
        "LinkedIn-KO": env['BUFFER_LINKEDIN_CHANNEL_ID'],
        "Threads-EN":  env['BUFFER_THREADS_CHANNEL_ID'],
        "Threads-KO":  env['BUFFER_THREADS_CHANNEL_ID'],
    }

    pending = log.get('pending', [])
    to_process = pending[:args.rounds]

    if not to_process:
        print("✅ 모든 회차 처리 완료!")
        return

    mode_label = "[DRY-RUN] " if args.dry_run else ""
    print(f"\n{mode_label}{len(to_process)}회차 예약 시작...\n")

    processed = []
    for item in to_process:
        slug = item['slug']
        round_no = item['round']
        sched_date = item['scheduled_date']

        # 중복 체크
        already_done = [p['slug'] for p in log.get('published', [])]
        if slug in already_done:
            print(f"⏭ {round_no:02d}회차 [{slug}] — 이미 처리됨, 건너뜀")
            processed.append(item)
            continue

        # 예약 시각 계산 (JST 09:00)
        dt = datetime.strptime(f"{sched_date} {POST_TIME}", "%Y-%m-%d %H:%M").replace(tzinfo=JST)
        due_at = dt.isoformat()

        # 블로그 MD 파싱
        meta_ko = parse_md(slug, 'ko')
        meta_en = parse_md(slug, 'en')

        print(f"📝 {round_no:02d}회차 [{sched_date}] {slug}")
        if not meta_ko and not meta_en:
            print(f"   ⚠️ MD 파일 없음 — 건너뜀")
            continue

        # 초안 생성
        drafts = generate_drafts(slug, meta_ko, meta_en, sched_date)

        # OG 이미지 URL 결정: frontmatter ogImage 우선 (en → ko 순), 없으면 기본 경로
        og_image_url = (meta_en or {}).get('og_image_url') or \
                       (meta_ko or {}).get('og_image_url') or \
                       f"https://gsfark.com/assets/images/blog/{slug}-hero.webp"
        print(f"   🖼️  OG image: {og_image_url}")

        # Buffer 전송
        buffer_ids = {}
        all_ok = True
        for name, text in drafts.items():
            platform_match = name.split("-")[0].lower()
            canonical_url = f"https://gsfark.com/posts/{slug}/"

            # assets 결정:
            #   X        → [] (본문 URL에서 트위터 카드 자동 생성)
            #   LinkedIn → link asset (canonical URL) → OG 카드 크롤링
            #   Threads  → link asset (canonical URL) → OG 카드 크롤링
            # ※ UTM URL을 link asset에 쓰면 크롤러가 해당 파라미터 URL을 크롤링하므로 canonical만 사용
            if platform_match == "x":
                assets_payload = []
            else:
                assets_payload = [{"link": {"url": canonical_url}}]

            result = post_to_buffer(TOKEN, channel_map[name], text, due_at, assets_payload=assets_payload, dry_run=args.dry_run, platform_name=name)
            if result.get('error'):
                print(f"   ❌ {name}: {result['error']}")
                all_ok = False
            else:
                print(f"   ✅ {name}: ID={result['id']} ({result['status']})")
                buffer_ids[name] = result['id']

        if all_ok or args.dry_run:
            # 로그 업데이트
            log['published'].append({
                "round": round_no,
                "slug": slug,
                "date": sched_date,
                "mode": "scheduled" if not args.dry_run else "dry-run",
                "buffer_ids": buffer_ids,
                "note": f"JST {POST_TIME} 예약 발행"
            })
            processed.append(item)

            # sns-drafts 파일 저장
            draft_path = BASE_DIR / "sns-drafts" / f"{sched_date}-{slug}.md"
            with open(draft_path, 'w', encoding='utf-8') as df:
                df.write(f"# SNS 초안: {slug}\n\n- 회차: {round_no}/40\n- 예약일: {sched_date} JST {POST_TIME}\n\n")
                for name, text in drafts.items():
                    df.write(f"## {name}\n```\n{text}\n```\n\n")
            print(f"   📄 초안 파일: sns-drafts/{sched_date}-{slug}.md\n")

    # pending에서 처리된 항목 제거
    processed_slugs = {p['slug'] for p in processed}
    log['pending'] = [p for p in log['pending'] if p['slug'] not in processed_slugs]

    # 로그 저장
    if not args.dry_run:
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
        print(f"✅ sns-log.json 업데이트 완료")

    show_status(log)

if __name__ == "__main__":
    main()
