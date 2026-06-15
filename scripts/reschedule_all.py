#!/usr/bin/env python3
"""
GSF-Blog SNS 전체 재예약 스크립트
- Buffer 큐 삭제 후 전체 재예약 용도
- 6/11(수)부터 Mon/Wed/Fri 09:00 JST 패턴으로 순서대로 예약
- assets: X → [] / LinkedIn·Threads → link(canonical URL)
- sns-log.json을 새 일정으로 갱신

사용법:
  python3 scripts/reschedule_all.py --dry-run   # 미리보기
  python3 scripts/reschedule_all.py             # 실제 전송 (10건씩 배치)
"""

import json, re, argparse, urllib.request, urllib.error, time
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

# ── 경로 ──────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
LOG_FILE = BASE_DIR / "sns-drafts" / "sns-log.json"
BLOG_DIR = BASE_DIR / "src" / "data" / "blog"
ENV_FILE = BASE_DIR / ".env"
GQL_URL  = "https://api.buffer.com/graphql"
JST      = timezone(timedelta(hours=9))
POST_TIME = "09:00"

# ── 재예약 대상 목록 (순서 고정) ───────────────────────────────────────────
QUEUE = [
    ("series-ep04", "tokyo-shinagawa-ota"),
    ("series-ep05", "tokyo-toshima-nakano-suginami"),
    (1,  "j-reit-five-things-to-know"),
    (2,  "tokyo-mansion-tsubo-chiyoda-chuo-minato"),
    (3,  "ginza-marunouchi-walk-dna"),
    (4,  "hotel-reit-vs-office-reit-post-covid"),
    (5,  "weak-yen-korean-japan-asset-allocation-fx-scenarios"),
    (6,  "japan-corporate-vs-personal-rental-after-tax-sketch"),
    (7,  "nihonbashi-mitsui-redevelopment-pipeline-three"),
    (8,  "tokyo-small-rental-yield-vs-capital-gain-breakeven"),
    (9,  "tokyo-moving-contracts-two-notes"),
    (10, "japan-visa-paths-permanent-business-manager-asset-holders"),
    (11, "japan-rate-hike-cycle-j-reit-three-lessons"),
    (12, "tokyo-earthquake-vulnerable-five-areas"),
    (13, "korea-japan-inheritance-gift-tax-cross-border-basics"),
    (14, "three-things-when-fx-shakes"),
    (15, "reading-korea-japan-markets-together"),
    (16, "nihonbashi-hamacho-walking-guide"),
    (17, "tsukiji-to-toyosu-morning-tokyo"),
    (18, "tokyo-real-estate-investment-complete-guide"),
    (19, "tokyo-korean-community-beyond-shinokubo"),
    (20, "tokyo-museums-with-kids-five-picks"),
    (21, "tokyo-buying-process-step-by-step"),
    (22, "nihonbashi-hamacho-supermarket-peacock-city-life"),
    (23, "tokyo-five-sophisticated-spots"),
    (24, "macro-barrier-and-super-scarce-real-estate-selection"),
    (25, "ginza-weekend-walking-guide"),
    (26, "japan-shinchiku-vs-chuko-mansion-investor-guide"),
    (27, "tokyo-yokohama-fuji-transport-pass"),
    (28, "nihonbashi-the-origin-of-japan"),
    (29, "tokyo-6-wards-real-estate-insight"),
    (30, "one-failure-three-lessons-postmortem"),
    (31, "coredo-nihonbashi-mitsui-redevelopment"),
    (32, "why-warm-investing-holds"),
]

BATCH_SIZE = 10          # 배치당 전송 건수 (6건 × 10포스트 = 60 API 호출)
BATCH_PAUSE = 65         # 배치 간 대기 초

# ── Mon/Wed/Fri 날짜 생성기 ────────────────────────────────────────────────
def mwf_dates(start: date):
    """start 날짜부터 Mon/Wed/Fri 순으로 무한 생성"""
    target_weekdays = {0, 2, 4}  # Monday=0, Wednesday=2, Friday=4
    d = start
    while True:
        if d.weekday() in target_weekdays:
            yield d
        d += timedelta(days=1)

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

# ── MD 파싱 ────────────────────────────────────────────────────────────────
def parse_md(slug, locale):
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

# ── 초안 생성 ──────────────────────────────────────────────────────────────
def generate_drafts(slug, meta_ko, meta_en):
    url_base = f"https://gsfark.com/posts/{slug}/"
    is_investment = meta_ko and meta_ko.get('category') in ['investment', 'essay']
    disclaimer_ko = "\n정보 제공 목적." if is_investment else ""
    disclaimer_en = "\nFor information purposes only." if is_investment else ""

    def utm(platform):
        return f"{url_base}?utm_source={platform}&utm_medium=social&utm_campaign=blog-broadcast"

    short_ko = (meta_ko['title'][:25] + "...") if meta_ko and len(meta_ko['title']) > 28 else (meta_ko['title'] if meta_ko else slug)
    short_en = (meta_en['title'][:35] + "...") if meta_en and len(meta_en['title']) > 38 else (meta_en['title'] if meta_en else slug)
    desc_ko = meta_ko['description'][:60] if meta_ko else ""
    desc_en = meta_en['description'][:70] if meta_en else ""

    drafts = {
        "X-EN":        f"{short_en}\n\n{desc_en}{disclaimer_en}\n\n→ {url_base}\n\n#JapanRealEstate #Tokyo #GSFInsight",
        "X-KO":        f"{short_ko}\n\n{desc_ko}{disclaimer_ko}\n\n→ {url_base}\n\n#일본부동산 #도쿄 #GSF인사이트",
        "LinkedIn-EN": f"📌 {meta_en['title'] if meta_en else slug}\n\n{meta_en['description'] if meta_en else ''}{disclaimer_en}\n\nRead the full analysis:\n👉 {utm('linkedin')}\n\n#JapanRealEstate #Tokyo #AsiaInvesting",
        "LinkedIn-KO": f"📌 {meta_ko['title'] if meta_ko else slug}\n\n{meta_ko['description'] if meta_ko else ''}{disclaimer_ko}\n\n전체 내용 →\n👉 {utm('linkedin')}\n\n#일본부동산 #도쿄 #해외투자",
        "Threads-EN":  f"{meta_en['title'] if meta_en else slug}\n\n{meta_en['description'] if meta_en else ''}{disclaimer_en}\n\n→ {utm('threads')}\n\n#JapanRealEstate #Tokyo",
        "Threads-KO":  f"{meta_ko['title'] if meta_ko else slug}\n\n{meta_ko['description'] if meta_ko else ''}{disclaimer_ko}\n\n→ {utm('threads')}\n\n#일본부동산 #도쿄",
    }

    for key in ["X-EN", "X-KO"]:
        if len(drafts[key]) > 275:
            m = re.search(r'\n\n→ https?://\S+\n', drafts[key])
            if m:
                body = drafts[key][:m.start()]
                url_str = m.group(0)
                drafts[key] = body[:272 - len(url_str)].rstrip() + "..." + url_str
            else:
                drafts[key] = drafts[key][:272] + "..."

    for key in ["Threads-EN", "Threads-KO"]:
        if len(drafts[key]) > 495:
            m = re.search(r'\n\n→ https?://\S+\n', drafts[key])
            if m:
                body = drafts[key][:m.start()]
                url_str = m.group(0)
                drafts[key] = body[:492 - len(url_str)].rstrip() + "..." + url_str
            else:
                drafts[key] = drafts[key][:492] + "..."

    return drafts

# ── Buffer API ─────────────────────────────────────────────────────────────
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

def post_to_buffer(token, channel_id, text, due_at_iso, assets, dry_run, platform_name, retry=True):
    variables = {
        "input": {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "automatic",
            "mode": "customScheduled",
            "dueAt": due_at_iso,
            "saveToDraft": False,
            "assets": assets,
        }
    }
    if dry_run:
        print(f"      [DRY] {platform_name}: assets={json.dumps(assets)}")
        return {"id": "DRY-RUN", "status": "preview"}

    payload = json.dumps({"query": MUTATION, "variables": variables}).encode()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    req = urllib.request.Request(GQL_URL, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read())
            data = body.get('data', {}).get('createPost', {})
            if data.get('post'):
                time.sleep(0.5)
                return data['post']
            return {"error": data.get('message', str(body))}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        if e.code == 429 and retry:
            print(f"      ⏳ Rate limit — 65초 대기 후 재시도...")
            time.sleep(65)
            return post_to_buffer(token, channel_id, text, due_at_iso, assets, dry_run, platform_name, retry=False)
        return {"error": f"HTTP {e.code}: {err_body[:200]}"}
    except Exception as e:
        return {"error": str(e)}

# ── 메인 ───────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

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

    # Threads-KO 15분 후 수동 재예약 일정
    schedule = [
        (date(2026, 7, 22), 16, "nihonbashi-hamacho-walking-guide"),
    ]
    # requeue_slugs 추출을 위해 QUEUE도 업데이트
    QUEUE = [(16, "nihonbashi-hamacho-walking-guide")]

    mode = "[DRY-RUN] " if args.dry_run else ""
    print(f"\n{mode}총 {len(schedule)}개 포스트 재예약 시작\n")
    print(f"{'날짜':<12} {'Round':<14} {'Slug'}")
    print("-" * 65)
    for d, r, s in schedule:
        print(f"{d.strftime('%Y-%m-%d')} ({d.strftime('%a')})  {str(r):<12} {s}")
    print()

    if args.dry_run:
        # dry-run: 일정 확인만
        print("✅ Dry-run 완료 — 위 일정으로 예약됩니다.")
        return

    # 실제 전송
    with open(LOG_FILE) as f:
        log = json.load(f)

    # published에서 재예약 대상 slug 제거 후 재기록
    requeue_slugs = {slug for _, slug in QUEUE}
    log['published'] = [p for p in log['published'] if p['slug'] not in requeue_slugs]

    total = len(schedule)
    for batch_start in range(0, total, BATCH_SIZE):
        batch = schedule[batch_start:batch_start + BATCH_SIZE]
        print(f"\n── 배치 {batch_start//BATCH_SIZE + 1} ({batch_start+1}~{min(batch_start+BATCH_SIZE, total)}/{total}) ──")

        for sched_date, round_id, slug in batch:
            dt = datetime.strptime(f"{sched_date.strftime('%Y-%m-%d')} {POST_TIME}", "%Y-%m-%d %H:%M").replace(tzinfo=JST)
            due_at = dt.isoformat()

            meta_ko = parse_md(slug, 'ko')
            meta_en = parse_md(slug, 'en')
            if not meta_ko and not meta_en:
                print(f"  ⚠️  [{slug}] MD 없음 — 건너뜀")
                continue

            og_url = (meta_en or {}).get('og_image_url') or \
                     (meta_ko or {}).get('og_image_url') or \
                     f"https://gsfark.com/assets/images/blog/{slug}-hero.webp"
            canonical = f"https://gsfark.com/posts/{slug}/"

            print(f"  📝 {sched_date.strftime('%Y-%m-%d')} ({sched_date.strftime('%a')}) [{round_id}] {slug}")
            print(f"     🖼  {og_url}")

            drafts = generate_drafts(slug, meta_ko, meta_en)
            buffer_ids = {}
            all_ok = True

            for name, text in drafts.items():
                if name != "Threads-KO":
                    continue

                platform = name.split("-")[0].lower()
                assets = [] if platform == "x" else [{"link": {"url": canonical}}]
                result = post_to_buffer(TOKEN, channel_map[name], text, due_at, assets, dry_run=False, platform_name=name)
                if result.get('error'):
                    print(f"     ❌ {name}: {result['error']}")
                    all_ok = False
                else:
                    print(f"     ✅ {name}: {result['id']}")
                    buffer_ids[name] = result['id']

            note_label = f"[재예약] {sched_date.strftime('%Y-%m-%d')} JST {POST_TIME}"
            log['published'].append({
                "round": round_id,
                "slug": slug,
                "date": sched_date.strftime('%Y-%m-%d'),
                "mode": "scheduled",
                "buffer_ids": buffer_ids,
                "note": note_label if all_ok else note_label + " (일부 실패)",
            })

        # 배치 간 로그 중간 저장
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
        print(f"  💾 sns-log.json 중간 저장 완료")

        if batch_start + BATCH_SIZE < total:
            print(f"  ⏳ 다음 배치까지 {BATCH_PAUSE}초 대기...")
            time.sleep(BATCH_PAUSE)

    # 최종 로그 저장
    log['last_reschedule'] = {
        "executed_at": datetime.now(JST).isoformat(),
        "strategy": "reschedule-from-2026-06-11",
        "total": total,
    }
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 전체 재예약 완료 ({total}개 포스트)\n")

if __name__ == "__main__":
    main()
