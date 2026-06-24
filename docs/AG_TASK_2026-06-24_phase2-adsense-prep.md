# AG TASK — TokyoKorean Phase 2: AdSense 기술 준비 + GA4 + GSC 후속
> 생성: 2026-06-24  
> 작성: Cursor (Joseph 요청)  
> 선행 완료: [`AG_TASK_2026-06-24_gsc-ownership-sitemap.md`](./AG_TASK_2026-06-24_gsc-ownership-sitemap.md) — GSC Phase 1 ✅  
> 목적: **7/13~15 AdSense 신청 전** 기술 게이트 통과 · GA4 라이브 · GSC sitemap Success 확인  
> **범위 밖:** URL 색인 요청 · ⭐⭐⭐ 사진 삽입 (Joseph 촬영 후 별도 TASK)

---

## 배경 · 역할

| 담당 | Phase 2 작업 |
|------|----------------|
| **AG** | AdSense/GA4 라이브 점검 · Vercel env 반영( ID 수신 후) · CookieConsent 감사 · GSC sitemap curl 검증 · _handoff 보고 |
| **Joseph** | GA4 속성 생성 + Measurement ID 전달 · GSC Sitemaps 화면 24~48h 재확인 · Vercel env 승인(필요 시) |

**타임라인**

| 시점 | 항목 |
|------|------|
| **지금 (Phase 2A)** | AdSense meta Vercel env · GA4 env · CookieConsent 감사 · GSC sitemap 후속 curl |
| **Joseph 촬영 후 (Phase 2B)** | [`AG_TASK 사진`](./AG_TASK_2026-06-24_photos-route-a.md) — 별도 지시서, Joseph 트리거 시 |
| **~7/10** | GSC URL 색인 요청 (Joseph) |
| **7/13~15** | AdSense 신청 (Joseph) |

---

## STEP 0 — 현재 상태 스냅샷 (AG, 시작 시 실행)

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean

echo "=== ads.txt ==="
curl -s https://tokyokorean.net/ads.txt

echo "=== AdSense meta (프로덕션) ==="
curl -s https://tokyokorean.net/ | grep -o 'google-adsense-account[^>]*' || echo "MISSING — PUBLIC_ADSENSE_PUBLISHER_ID 미설정 가능"

echo "=== GA4 (프로덕션) ==="
curl -s https://tokyokorean.net/ | grep -o 'googletagmanager.com/gtag/js?id=[^"]*' || echo "MISSING — PUBLIC_GA4_MEASUREMENT_ID 미설정"

echo "=== Cookie banner DOM ==="
curl -s https://tokyokorean.net/ | grep -c 'cookie-consent-banner' || true

echo "=== GSC sitemap ==="
curl -s https://tokyokorean.net/sitemap-index.xml | head -3
curl -s https://tokyokorean.net/sitemap-0.xml | python3 -c "import sys,re; print('urls', len(re.findall(r'<loc>', sys.stdin.read())))"

pnpm run build
```

**2026-06-24 Cursor 기준 예상**

| 항목 | 상태 |
|------|------|
| `ads.txt` | ✅ 라이브 (`ca-pub-4729433282370174`) |
| `google-adsense-account` meta | ❌ **미출력** — Vercel `PUBLIC_ADSENSE_PUBLISHER_ID` 비어 있음 |
| GA4 gtag | ❌ **미출력** — `PUBLIC_GA4_MEASUREMENT_ID` 비어 있음 |
| CookieConsent 배너 | ✅ **미마운트** (Layout `<body>`에 import 없음) |
| `CookieConsent.astro` 파일 | ⚠️ dead code — STEP 2에서 정리 |

---

## STEP 1 — AdSense meta + 스크립트 라이브 (AG + Joseph)

### 1-A. Joseph — Vercel Production env (또는 AG에 Vercel 접근 시 AG 실행)

Vercel → TokyoKorean 프로젝트 → Settings → Environment Variables → **Production**:

| 변수 | 값 |
|------|-----|
| `PUBLIC_ADSENSE_PUBLISHER_ID` | `ca-pub-4729433282370174` |

> **주의:** git에 커밋하지 말 것. Astro는 build 시 `PUBLIC_*` 인라인.

### 1-B. AG — 재배포 후 검증

```bash
# Redeploy 후 (Vercel dashboard 또는 git empty commit — Joseph 지시에 따름)

curl -s https://tokyokorean.net/ | grep 'google-adsense-account'
curl -s https://tokyokorean.net/ | grep 'adsbygoogle.js'
```

**PASS 기준**

- `<meta name="google-adsense-account" content="ca-pub-4729433282370174">` 존재
- `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js` script **consent 조건 없이** `<head>`에 존재
- Cookie 배너 **없음** (봇이 consent wall에 막히지 않음)

`Layout.astro` 참고 — AdSense는 이미 **항상 주입** 설계(`PUBLIC_ADSENSE_PUBLISHER_ID` 있을 때). CookieConsent는 **마운트되지 않음** = Plan B 원칙 준수.

---

## STEP 2 — CookieConsent 감사 (AG)

원래 Plan B 지시([`AG_TASK planb`](./AG_TASK_2026-06-15_planb-tokyokorean.md)): **Cookie Consent 배너 절대 달지 않음**.

AG 작업:

1. `rg "CookieConsent" src/` — Layout **import·렌더 0건** 확인 (주석만 있으면 OK)
2. 라이브 HTML에 `cookie-consent-banner` **0건** 확인
3. **권장 정리 (Joseph 승인 후):**
   - `src/components/CookieConsent.astro` → `_archived/components/` 이동 **또는** 삭제
   - `Layout.astro` 내 CookieConsent 관련 주석·`__gsfEnableAdsense` noop 정리 (AdSense noop 불필요 시)
4. 변경 시 `pnpm run build` → redeploy → STEP 0 curl 재실행

**수정 불필요 조건:** 배너 미마운트 + AdSense meta 항상 출력 → **PASS**, dead code 정리만 선택.

---

## STEP 3 — GA4 연동 (Joseph + AG)

### 3-A. Joseph — GA4 속성 생성 (~10분)

1. https://analytics.google.com → **관리** → **속성 만들기**
   - 속성 이름: `Tokyo Korean Life` 또는 `tokyokorean.net`
   - 시간대: `(GMT+09:00) Tokyo`
   - 통화: JPY 또는 KRW
2. **데이터 스트림** → **웹** → URL: `https://tokyokorean.net`
3. **측정 ID** 복사 (형식: `G-XXXXXXXXXX`)
4. (권장) GA4 **관리 → Search Console 연결** → `tokyokorean.net` 속성 연결
5. AG에게 전달:

```
PUBLIC_GA4_MEASUREMENT_ID=G-____________________
```

### 3-B. AG — Vercel env + 배포 + 검증

1. Vercel Production: `PUBLIC_GA4_MEASUREMENT_ID=<Joseph ID>`
2. Redeploy
3. 검증:

```bash
curl -s https://tokyokorean.net/ | grep "googletagmanager.com/gtag/js?id=G-"
```

4. GA4 **실시간** 보고서에서 Joseph가 `tokyokorean.net` 방문 → 1 active user 확인 (Joseph)

---

## STEP 4 — GSC Sitemap 후속 (Joseph UI + AG curl)

GSC Phase 1 제출 직후 **「가져올 수 없음」·0 URL** = 정상. **24~48h 후** Joseph 확인.

### 4-A. Joseph — GSC UI (~2분)

1. Search Console → `https://tokyokorean.net/` → **Sitemaps**
2. `sitemap-index.xml` 행 확인:
   - **상태:** Success (또는 유사)
   - **발견된 페이지:** ~**24**
3. 스크린샷 AG/_handoff 공유

### 4-B. AG — curl 교차 검증

```bash
curl -s https://tokyokorean.net/sitemap-0.xml | python3 -c "
import sys,re
urls=re.findall(r'<loc>([^<]+)</loc>', sys.stdin.read())
print('count', len(urls))
bad=[u for u in urls if '/admin' in u or '/tags' in u]
print('admin/tags', len(bad))
"
```

**PASS:** count ≥ 20, admin/tags = 0. GSC 발견 URL과 ±2 이내면 OK.

**FAIL (48h 후에도 0):** Joseph에게 Sitemaps 재제출 안내 · `robots.txt` Sitemap 줄 확인.

---

## STEP 5 — 루트 임시 파일 (AG, 선택)

WEEKLY에列挙된 `test*.ts`, `dump-posts.ts` 등 — **2026-06-24 확인 시 이미 없음**.

```bash
ls test-replace.ts test.js test.ts dump-posts.ts 2>&1 | grep "No such file" && echo "CLEAN"
```

있으면 `_archived/` 이동. 없으면 보고서에 **「이미 정리됨」** 기록.

---

## STEP 6 — 완료 보고 (_handoff.md append)

```markdown
## [YYYY-MM-DD HH:MM] AG — TokyoKorean Phase 2 (AdSense prep + GA4)
- AdSense meta 라이브: PASS / FAIL — curl 스니펫
- ads.txt: PASS (기존)
- CookieConsent: 미마운트 PASS / dead code 정리 여부
- GA4 env: G-________ / Realtime Joseph 확인
- GSC sitemap: Joseph Success ~24 / AG curl 24
- build: pnpm run build exit 0
- 다음: Joseph 루트 A 촬영 → AG_TASK photos-route-a · ~7/10 URL 색인
```

### 체크리스트

| # | 항목 | AG | Joseph |
|---|------|-----|--------|
| 1 | `PUBLIC_ADSENSE_PUBLISHER_ID` Vercel Production | ☐ | env 승인 |
| 2 | 라이브 `google-adsense-account` meta | ☐ | |
| 3 | CookieConsent 미마운트 / dead code 정리 | ☐ | 승인 |
| 4 | GA4 속성 + Measurement ID | | ☐ |
| 5 | `PUBLIC_GA4_MEASUREMENT_ID` Vercel + Realtime | ☐ | Realtime 확인 |
| 6 | GSC sitemap Success ~24 (48h 후) | curl ☐ | UI ☐ |
| 7 | `pnpm run build` PASS | ☐ | |
| 8 | _handoff 기록 | ☐ | |

---

## 하지 말 것

| 금지 | 이유 |
|------|------|
| URL 색인 요청 10건+ | ⭐⭐⭐ 사진 배포 전 |
| 사진 삽입 (Joseph 원본 없이) | [`BLOG_IMAGE_INTENT_RULES.md`](../BLOG_IMAGE_INTENT_RULES.md) |
| Cookie Consent 배너 **신규 마운트** | Plan B 원칙 위반 |
| Publisher ID / GA4 ID git 커밋 | env only |

---

## Joseph → AG 시작 메시지 (복사용)

```
TokyoKorean Phase 2 시작해줘.
지시서: docs/AG_TASK_2026-06-24_phase2-adsense-prep.md

[즉시 진행 — Vercel env]
PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-4729433282370174

[GA4 — 생성 후 붙여넣기]
PUBLIC_GA4_MEASUREMENT_ID=G-____________________

Vercel 접근: [ AG 가능 / Joseph만 — env만 설정 후 AG redeploy ]

범위: AdSense meta 라이브 · CookieConsent 감사 · GA4 · GSC sitemap 후속.
사진·URL 색인은 하지 말 것.
```

---

*Phase 2A 완료 후 → Joseph 루트 A 촬영 → `AG_TASK_2026-06-24_photos-route-a.md`*
