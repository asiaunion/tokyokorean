#!/usr/bin/env python3
"""
reschedule_series.py — 3단계 SNS 재스케줄링 전략 실행 스크립트
=================================================================
확정된 계획:
  [단계1] 시리즈 집중 6건 (Ep00~Ep05)
    6/6(토) Ep00 / 6/8(월) Ep01 / 6/9(화) Ep02
    6/10(수) Ep03 / 6/11(목) Ep04 / 6/12(금) Ep05

  [단계2] 공백 (6/13~6/17, Ep06 집필)
    6/18(목) Ep06 블로그 배포

  [단계3] 정상 궤도
    6/19(금) Ep06 SNS — 별도 수동 예약 (이 스크립트 범위 밖)
    6/22(월)~ Track A 32건 (월/수/금 패턴, ~10/2)

실행 순서:
  1. sns-log.json에서 기존 scheduled 38건 파악
  2. Buffer API로 38건 전체 삭제
  3. 시리즈 6건 신규 예약
  4. Track A 32건 신규 예약 (6/22~10/2, 월/수/금)
  5. sns-log.json 전면 업데이트

사용법:
  python3 scripts/reschedule_series.py --dry-run   # 미리보기
  python3 scripts/reschedule_series.py             # 실제 실행
"""

import os, sys, json, re, argparse, urllib.request, urllib.error, time
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

# ── 경로 설정 ──────────────────────────────────────────────────────────────
BASE_DIR  = Path(__file__).parent.parent
LOG_FILE  = BASE_DIR / "sns-drafts" / "sns-log.json"
BLOG_DIR  = BASE_DIR / "src" / "data" / "blog"
ENV_FILE  = BASE_DIR / ".env"
GQL_URL   = "https://api.buffer.com/graphql"
POST_TIME = "09:00"   # JST 발행 시각
JST       = timezone(timedelta(hours=9))
WD_MAP    = {0:'월', 1:'화', 2:'수', 3:'목', 4:'금', 5:'토', 6:'일'}

# ── 시리즈 정의 (Ep00~Ep05) ───────────────────────────────────────────────
SERIES = [
    # 'tokyo-ward-guide-series-prologue',        # Ep00 (이미 발행 완료됨)
    'tokyo-core-3-wards-chiyoda-chuo-minato',  # Ep01
    'tokyo-shinjuku-shibuya-bunkyo',           # Ep02
    'tokyo-meguro-setagaya',                   # Ep03
    'tokyo-shinagawa-ota',                     # Ep04
    'tokyo-toshima-nakano-suginami',           # Ep05
]

# ── 시리즈 예약 날짜 (단계1) ──────────────────────────────────────────────
SERIES_DATES = [
    # '2026-06-06',  # Ep00 (토) - 발행 완료됨
    '2026-06-08',  # Ep01 (월)
    '2026-06-09',  # Ep02 (화)
    '2026-06-10',  # Ep03 (수)
    '2026-06-11',  # Ep04 (목)
    '2026-06-12',  # Ep05 (금)
]

# ── Track A 시작일 & 패턴 ─────────────────────────────────────────────────
TRACK_A_START = date(2026, 6, 22)  # 6/22(월)
TRACK_A_END   = date(2026, 10, 2)  # 10/2(금)
TRACK_A_DAYS  = {0, 2, 4}          # 월=0, 수=2, 금=4

API_CALL_COUNT = 0


# ── 환경변수 로딩 ─────────────────────────────────────────────────────────
def load_env():
    env = {}
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip()
    return env


# ── 블로그 MD 파싱 ────────────────────────────────────────────────────────
def parse_md(slug, locale):
    for ext in ['.md', '.mdx']:
        path = BLOG_DIR / locale / f"{slug}{ext}"
        if path.exists():
            text = path.read_text(encoding='utf-8')
            title = re.search(r'^title[\s:]+["\']?([^"\'\n]+)["\']?', text, re.MULTILINE)
            desc  = re.search(r'^description[\s:]+["\']?([^"\'\n]+)["\']?', text, re.MULTILINE)
            cat   = re.search(r'^category[\s:]+(\S+)', text, re.MULTILINE)
            return {
                "title":       title.group(1).strip() if title else slug,
                "description": desc.group(1).strip() if desc else "",
                "category":    cat.group(1).strip() if cat else "general",
            }
    return None


# ── SNS 초안 생성 ─────────────────────────────────────────────────────────
def generate_drafts(slug, meta_ko, meta_en):
    # Check for custom drafts first
    custom_drafts_file = BASE_DIR / "sns-drafts" / "custom_drafts.json"
    if custom_drafts_file.exists():
        with open(custom_drafts_file, "r", encoding="utf-8") as f:
            custom = json.load(f)
            if slug in custom:
                return custom[slug]

    url_base = f"https://gsfark.com/posts/{slug}/"
    is_investment = meta_ko and meta_ko.get('category') in ['investment', 'essay']
    disclaimer_ko = "\n정보 제공 목적." if is_investment else ""
    disclaimer_en = "\nFor information purposes only." if is_investment else ""

    def utm(platform):
        return f"{url_base}?utm_source={platform}&utm_medium=social&utm_campaign=blog-broadcast"

    short_title_ko = (meta_ko['title'][:25] + "...") if meta_ko and len(meta_ko['title']) > 28 else (meta_ko['title'] if meta_ko else slug)
    short_title_en = (meta_en['title'][:35] + "...") if meta_en and len(meta_en['title']) > 38 else (meta_en['title'] if meta_en else slug)
    desc_ko = meta_ko['description'][:60] if meta_ko else ""
    desc_en = meta_en['description'][:70] if meta_en else ""

    drafts = {
        "X-EN":        f"{short_title_en}\n\n{desc_en}{disclaimer_en}\n\n→ {url_base}\n\n#JapanRealEstate #Tokyo #GSFInsight",
        "X-KO":        f"{short_title_ko}\n\n{desc_ko}{disclaimer_ko}\n\n→ {url_base}\n\n#일본부동산 #도쿄 #GSF인사이트",
        "LinkedIn-EN": f"📌 {meta_en['title'] if meta_en else slug}\n\n{meta_en['description'] if meta_en else ''}{disclaimer_en}\n\nRead the full analysis:\n👉 {utm('linkedin')}\n\n#JapanRealEstate #Tokyo #AsiaInvesting",
        "LinkedIn-KO": f"📌 {meta_ko['title'] if meta_ko else slug}\n\n{meta_ko['description'] if meta_ko else ''}{disclaimer_ko}\n\n전체 내용 →\n👉 {utm('linkedin')}\n\n#일본부동산 #도쿄 #해외투자",
        "Threads-EN":  f"{meta_en['title'] if meta_en else slug}\n\n{meta_en['description'] if meta_en else ''}{disclaimer_en}\n\n→ {utm('threads')}\n\n#JapanRealEstate #Tokyo",
        "Threads-KO":  f"{meta_ko['title'] if meta_ko else slug}\n\n{meta_ko['description'] if meta_ko else ''}{disclaimer_ko}\n\n→ {utm('threads')}\n\n#일본부동산 #도쿄",
    }

    # X 280자 제한 (URL 포함 원본 길이 기준)
    for key in ["X-EN", "X-KO"]:
        if len(drafts[key]) > 275:
            m = re.search(r'\n\n→ https?://\S+\n', drafts[key])
            if m:
                body = drafts[key][:m.start()]
                tail = m.group(0)
                drafts[key] = body[:275 - len(tail) - 3].rstrip() + "..." + tail + drafts[key][m.end():]
            else:
                drafts[key] = drafts[key][:272] + "..."

    # Threads 500자 제한
    for key in ["Threads-EN", "Threads-KO"]:
        if len(drafts[key]) > 495:
            m = re.search(r'\n\n→ https?://\S+\n', drafts[key])
            if m:
                body = drafts[key][:m.start()]
                tail = m.group(0)
                drafts[key] = body[:495 - len(tail) - 3].rstrip() + "..." + tail + drafts[key][m.end():]
            else:
                drafts[key] = drafts[key][:492] + "..."

    return drafts


# ── Buffer GraphQL: 삭제 ──────────────────────────────────────────────────
DELETE_MUTATION = """
mutation DeletePost($id: String!) {
  deletePost(input: { id: $id }) {
    ... on PostActionSuccess { post { id } }
    ... on InvalidInputError { message }
    ... on UnauthorizedError { message }
    ... on UnexpectedError   { message }
  }
}
"""

def delete_buffer_post(token, post_id, dry_run=False):
    if dry_run:
        return True
    payload = json.dumps({"query": DELETE_MUTATION, "variables": {"id": post_id}}).encode()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    req = urllib.request.Request(GQL_URL, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read())
            data = body.get('data', {}).get('deletePost', {})
            if data.get('post'):
                time.sleep(0.3)
                return True
            err = data.get('message', str(body))
            print(f"     ⚠️  삭제 실패: {err}")
            return False
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print("     ⏳ Rate limit — 65초 대기...")
            time.sleep(65)
            return delete_buffer_post(token, post_id, dry_run)
        print(f"     ❌ HTTP {e.code}")
        return False
    except Exception as e:
        print(f"     ❌ {e}")
        return False


# ── Buffer GraphQL: 생성 ──────────────────────────────────────────────────
CREATE_MUTATION = """
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess { post { id status } }
    ... on InvalidInputError { message }
    ... on UnauthorizedError { message }
    ... on LimitReachedError { message }
    ... on UnexpectedError   { message }
  }
}
"""

def create_buffer_post(token, channel_id, text, due_at_iso, dry_run=False):
    if dry_run:
        return {"id": "DRY-RUN", "status": "preview"}
    variables = {
        "input": {
            "channelId": channel_id,
            "text": text,
            "schedulingType": "automatic",
            "mode": "customScheduled",
            "dueAt": due_at_iso,
            "saveToDraft": False,
            "assets": []
        }
    }
    payload = json.dumps({"query": CREATE_MUTATION, "variables": variables}).encode()
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
        if e.code == 429:
            print("     ⏳ Rate limit — 65초 대기...")
            time.sleep(65)
            return create_buffer_post(token, channel_id, text, due_at_iso, dry_run)
        return {"error": f"HTTP {e.code}"}
    except Exception as e:
        return {"error": str(e)}


# ── Track A 날짜 생성 ─────────────────────────────────────────────────────
def get_track_a_dates(n_slugs):
    """6/22~10/2 월/수/금 날짜 목록 (n_slugs개 반환)"""
    dates = []
    d = TRACK_A_START
    while d <= TRACK_A_END and len(dates) < n_slugs:
        if d.weekday() in TRACK_A_DAYS:
            dates.append(str(d))
        d += timedelta(days=1)
    return dates


# ── 예약 단위 실행 ────────────────────────────────────────────────────────
def schedule_one(token, channel_map, slug, date_str, label, dry_run):
    global API_CALL_COUNT
    """단일 slug + date를 6채널 예약. (buffer_ids, drafts) 반환"""
    meta_ko = parse_md(slug, 'ko')
    meta_en = parse_md(slug, 'en')
    if not meta_ko and not meta_en:
        print(f"     ❌ MD 파일 없음 ({slug}) — 건너뜀")
        return None, None

    drafts = generate_drafts(slug, meta_ko, meta_en)
    dt = datetime.strptime(f"{date_str} {POST_TIME}", "%Y-%m-%d %H:%M").replace(tzinfo=JST)
    due_at = dt.isoformat()

    buffer_ids = {}
    all_ok = True
    for ch, text in drafts.items():
        if not dry_run:
            if API_CALL_COUNT >= 90:
                print(f"     ⏳ [Rate Limit 보호] 90건 도달. 15분 대기 시작... ({datetime.now().strftime('%H:%M:%S')})")
                time.sleep(900)
                print(f"     ▶️ 15분 대기 완료. 재개합니다. ({datetime.now().strftime('%H:%M:%S')})")
                API_CALL_COUNT = 0
            API_CALL_COUNT += 1

        result = create_buffer_post(token, channel_map[ch], text, due_at, dry_run)
        if result.get('error'):
            print(f"     ❌ {ch}: {result['error']}")
            all_ok = False
        else:
            buffer_ids[ch] = result['id']
            if dry_run:
                print(f"     [DRY] 생성: {ch}")

    status = "✅" if all_ok else "⚠️"
    print(f"     {label} | 생성: {len(buffer_ids)}/6건 {status}")
    return buffer_ids if (all_ok or dry_run) else None, drafts


# ── 메인 ─────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="3단계 SNS 재스케줄링 전략 실행")
    parser.add_argument('--dry-run', action='store_true', help='실제 API 호출 없이 미리보기')
    parser.add_argument('--delete-only', action='store_true', help='기존 예약 삭제만 실행')
    args = parser.parse_args()

    # ── sns-log.json 로드 ────────────────────────────────────────────────
    with open(LOG_FILE) as f:
        log = json.load(f)

    published = log.get('published', [])
    old_scheduled = sorted(
        [p for p in published if p.get('mode') == 'scheduled'],
        key=lambda x: str(x.get('round', ''))
    )
    non_scheduled = [p for p in published if p.get('mode') != 'scheduled']

    # Track A slugs = 기존 scheduled에서 시리즈 제외한 것 (round 순 유지)
    track_a_slugs = [p['slug'] for p in old_scheduled if p['slug'] not in SERIES]
    track_a_dates = get_track_a_dates(len(track_a_slugs))

    print(f"\n{'='*70}")
    print(f"  GSF-Blog SNS 3단계 재스케줄링 {'[DRY-RUN]' if args.dry_run else '실행'}")
    print(f"{'='*70}")
    print(f"\n📋 현황:")
    print(f"  기존 scheduled: {len(old_scheduled)}건 (삭제 예정)")
    print(f"  시리즈 예약:    6건 (6/6~6/12)")
    print(f"  Track A 예약:   {len(track_a_slugs)}건 (6/22~{track_a_dates[-1] if track_a_dates else '?'})")
    print(f"  신규 합계:      {6 + len(track_a_slugs)}건")

    # ── 미리보기 모드: Track A 날짜 목록 출력 ──────────────────────────
    if args.dry_run:
        print(f"\n{'─'*70}")
        print("  [단계1] 시리즈 예약 계획:")
        for ep_idx, (slug, d) in enumerate(zip(SERIES, SERIES_DATES)):
            wd = WD_MAP[datetime.strptime(d, "%Y-%m-%d").weekday()]
            print(f"    Ep{ep_idx:02d} | {d}({wd}) | {slug}")
        print(f"\n  [단계3] Track A 예약 계획:")
        for i, (slug, d) in enumerate(zip(track_a_slugs, track_a_dates), 1):
            wd = WD_MAP[datetime.strptime(d, "%Y-%m-%d").weekday()]
            print(f"    {i:2d}. {d}({wd}) | {slug[:50]}")
        print(f"\n[DRY-RUN] 실제 변경 없음. --dry-run 제거 후 재실행하면 반영됩니다.")
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

    # ══════════════════════════════════════════════════════════════════════
    # STEP 1: 기존 38건 전체 삭제 (사용자 수동 삭제로 인해 건너뜀)
    # ══════════════════════════════════════════════════════════════════════
    print(f"\n{'─'*70}")
    print(f"  STEP 1: 기존 scheduled {len(old_scheduled)}건 삭제 (건너뜀)")
    print(f"{'─'*70}")

    total_del = len(old_scheduled)
    total_del_fail = 0
    print("\n  ✅ (사용자가 Buffer에서 수동으로 삭제 완료했으므로 API 호출 패스)")

    if args.delete_only:
        print("\n[--delete-only 모드] 삭제만 실행. 종료.")
        # 삭제된 항목을 log에서 제거
        log['published'] = non_scheduled
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
        print("✅ sns-log.json에서 scheduled 항목 제거 완료")
        return

    # ══════════════════════════════════════════════════════════════════════
    # STEP 2: 시리즈 6건 예약 (단계1)
    # ══════════════════════════════════════════════════════════════════════
    print(f"\n{'─'*70}")
    print(f"  STEP 2: [단계1] 시리즈 6건 예약 (6/6~6/12)")
    print(f"{'─'*70}")

    new_series_entries = []
    for ep_idx, (slug, d_str) in enumerate(zip(SERIES, SERIES_DATES)):
        wd = WD_MAP[datetime.strptime(d_str, "%Y-%m-%d").weekday()]
        print(f"\n  Ep{ep_idx:02d} | {d_str}({wd}) | {slug}")
        buffer_ids, drafts = schedule_one(TOKEN, channel_map, slug, d_str,
                                           f"Ep{ep_idx:02d}", args.dry_run)
        if buffer_ids is not None:
            # sns-drafts 파일 저장
            draft_path = BASE_DIR / "sns-drafts" / f"{d_str}-series-ep{ep_idx:02d}-{slug[:30]}.md"
            with open(draft_path, 'w', encoding='utf-8') as df:
                df.write(f"# SNS 초안: Ep{ep_idx:02d} {slug}\n\n")
                df.write(f"- 단계: 시리즈 집중 (단계1)\n- 예약일: {d_str} ({wd}) JST {POST_TIME}\n\n")
                if drafts:
                    for ch, text in drafts.items():
                        df.write(f"## {ch}\n```\n{text}\n```\n\n")

            new_series_entries.append({
                "round":      f"series-ep{ep_idx:02d}",
                "slug":       slug,
                "date":       d_str,
                "mode":       "scheduled",
                "buffer_ids": buffer_ids,
                "note":       f"[단계1 시리즈] Ep{ep_idx:02d} JST {POST_TIME} 예약"
            })
        else:
            new_series_entries.append({
                "round":      f"series-ep{ep_idx:02d}",
                "slug":       slug,
                "date":       d_str,
                "mode":       "error",
                "buffer_ids": {},
                "note":       "Buffer API 거부 (Rate Limit 또는 권한 오류)"
            })

    print(f"\n  ✅ 시리즈 예약 완료: {sum(1 for e in new_series_entries if e['mode']=='scheduled')}/6건")

    # ══════════════════════════════════════════════════════════════════════
    # STEP 3: Track A 32건 예약 (단계3, 6/22~)
    # ══════════════════════════════════════════════════════════════════════
    print(f"\n{'─'*70}")
    print(f"  STEP 3: [단계3] Track A {len(track_a_slugs)}건 예약 (6/22~{track_a_dates[-1] if track_a_dates else '?'}, 월/수/금)")
    print(f"{'─'*70}")

    new_track_a_entries = []
    for i, (slug, d_str) in enumerate(zip(track_a_slugs, track_a_dates), 1):
        wd = WD_MAP[datetime.strptime(d_str, "%Y-%m-%d").weekday()]
        print(f"\n  {i:2d}/{len(track_a_slugs)} | {d_str}({wd}) | {slug[:50]}")
        buffer_ids, drafts = schedule_one(TOKEN, channel_map, slug, d_str,
                                           f"TrackA-{i:02d}", args.dry_run)
        if buffer_ids is not None:
            # sns-drafts 파일 저장
            draft_path = BASE_DIR / "sns-drafts" / f"{d_str}-{slug[:40]}.md"
            with open(draft_path, 'w', encoding='utf-8') as df:
                df.write(f"# SNS 초안: {slug}\n\n")
                df.write(f"- 단계: Track A (단계3)\n- 회차: {i}/{len(track_a_slugs)}\n- 예약일: {d_str} ({wd}) JST {POST_TIME}\n\n")
                if drafts:
                    for ch, text in drafts.items():
                        df.write(f"## {ch}\n```\n{text}\n```\n\n")

            new_track_a_entries.append({
                "round":      i,
                "slug":       slug,
                "date":       d_str,
                "mode":       "scheduled",
                "buffer_ids": buffer_ids,
                "note":       f"[단계3 Track A] {i}/{len(track_a_slugs)} JST {POST_TIME} 예약"
            })
        else:
            new_track_a_entries.append({
                "round":      i,
                "slug":       slug,
                "date":       d_str,
                "mode":       "error",
                "buffer_ids": {},
                "note":       "Buffer API 거부 (Rate Limit 또는 권한 오류)"
            })

    track_a_ok = sum(1 for e in new_track_a_entries if e['mode'] == 'scheduled')
    print(f"\n  ✅ Track A 예약 완료: {track_a_ok}/{len(track_a_slugs)}건")

    # ══════════════════════════════════════════════════════════════════════
    # STEP 4: sns-log.json 전면 업데이트
    # ══════════════════════════════════════════════════════════════════════
    print(f"\n{'─'*70}")
    print("  STEP 4: sns-log.json 업데이트")
    print(f"{'─'*70}")

    new_published = non_scheduled + new_series_entries + new_track_a_entries
    log['published'] = new_published
    log['last_reschedule'] = {
        "executed_at":    datetime.now(JST).isoformat(),
        "strategy":       "3-phase-series-first",
        "series_count":   len(new_series_entries),
        "track_a_count":  len(new_track_a_entries),
        "deleted_old":    len(old_scheduled),
        "series_ok":      sum(1 for e in new_series_entries if e['mode'] == 'scheduled'),
        "track_a_ok":     track_a_ok,
    }

    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=2)

    # ══════════════════════════════════════════════════════════════════════
    # 최종 브리핑
    # ══════════════════════════════════════════════════════════════════════
    total_new = len(new_series_entries) + len(new_track_a_entries)
    total_ok  = sum(1 for e in new_series_entries + new_track_a_entries if e['mode'] == 'scheduled')

    print(f"\n{'='*70}")
    print(f"  ✅ 재스케줄링 완료 브리핑")
    print(f"{'='*70}")
    print(f"\n  [삭제] 기존 scheduled: {len(old_scheduled)}건 ({total_del}개 Buffer ID 삭제)")
    print(f"\n  [단계1] 시리즈 6건:")
    for e in new_series_entries:
        wd = WD_MAP[datetime.strptime(e['date'], "%Y-%m-%d").weekday()]
        status = "✅" if e['mode'] == 'scheduled' else "❌"
        ep = e['round']
        print(f"    {status} {ep} | {e['date']}({wd}) | {e['slug']}")

    print(f"\n  [단계3] Track A {len(new_track_a_entries)}건:")
    first_5 = new_track_a_entries[:5]
    last_3  = new_track_a_entries[-3:]
    for e in first_5:
        wd = WD_MAP[datetime.strptime(e['date'], "%Y-%m-%d").weekday()]
        status = "✅" if e['mode'] == 'scheduled' else "❌"
        print(f"    {status} {e['round']:2d}. {e['date']}({wd}) | {e['slug'][:45]}")
    print(f"    ... ({len(new_track_a_entries)-8}건 생략) ...")
    for e in last_3:
        wd = WD_MAP[datetime.strptime(e['date'], "%Y-%m-%d").weekday()]
        status = "✅" if e['mode'] == 'scheduled' else "❌"
        print(f"    {status} {e['round']:2d}. {e['date']}({wd}) | {e['slug'][:45]}")

    print(f"\n  📊 총계: {total_ok}/{total_new}건 성공")
    print(f"  📝 sns-log.json 업데이트 완료")
    print(f"\n  ⚠️  참고: Ep06 SNS (6/19) 는 별도 수동 예약 필요")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
