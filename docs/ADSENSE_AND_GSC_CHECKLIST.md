# AdSense & Search Console — TokyoKorean 체크리스트

> **도메인:** tokyokorean.net · **AdSense 신청 목표:** 2026-07-13~15 (플랜 B)  
> **사진 SSOT:** [`PHOTO_NEEDED_TRACKER.md`](./PHOTO_NEEDED_TRACKER.md) — **ogImage 13/20 · 본문 25건 라이브** (6/25) · ⭐⭐⭐ **6/6**

---

## 권장 순서 (2026-06-25 갱신)

| # | 작업 | 사진 필요? | 담당 | 시점 |
|---|------|-----------|------|------|
| 1 | GSC 소유권 인증 | ❌ | Joseph | ✅ 완료 (6/24) |
| 2 | GSC sitemap 제출 | ❌ | Joseph | ✅ 완료 — 6/25~26 Success·~24 URL 확인 대기 |
| 3 | Cookie Consent / AdSense meta 봇 허용 | ❌ | AG | ✅ 완료 (`1f23724`) |
| 4 | GA4 속성 등록 | ❌ | Joseph | ✅ 완료 — Realtime 확인 |
| 5 | 루트 A/B 촬영 → ⭐⭐⭐ 6편 이미지 삽입·배포 | ✅ | Joseph + AG | **2차** — weekend·NEXPECT 반영 (6/25) |
| 6 | GSC URL 색인 요청 (~10–15 URL) | ✅ | Joseph | ⏳ **5 후**, ~7/10 |
| 7 | AdSense 신청 | ✅ | Joseph | ⏳ 7/13~15 |

**핵심:** GSC **인증·sitemap**은 사진과 무관하게 먼저. **URL 색인 요청**은 ⭐⭐⭐ 6편에 히어로·본문 이미지가 반영된 **최종 URL**로 요청.

---

## Phase 1 — GSC 소유권 + sitemap ✅ 완료

1. Google Search Console → `tokyokorean.net` 속성 추가 ✅
2. 소유권 확인 — `google21b29b3e517c0ba5.html` (GSF-Ark와 동일 계정 자동 통과) ✅
3. **Sitemaps** 제출: `https://tokyokorean.net/sitemap-index.xml` ✅
4. ⏳ 6/25~26 Success · ~24 URL UI 재확인 (Joseph)

---

## Phase 2 — 기술 게이트 ✅ 완료

### Cookie Consent / AdSense meta
- [x] `<meta name="google-adsense-account">`가 consent 조건 **없이** 프로덕션 HTML에 항상 출력 ✅
- [x] AdSense 크롤러가 consent wall에 막히지 않음 ✅

### ads.txt
- [x] `https://tokyokorean.net/ads.txt` — 200, `ca-pub-4729433282370174` ✅

### GA4
- [x] GSC 연동 속성 생성 · `PUBLIC_GA4_MEASUREMENT_ID=G-86NS9E5Y20` Vercel Production 설정 ✅
- [x] GA4 Realtime Joseph 확인 ✅

### 신뢰도 (Trust Polish) — `1c33a25` ✅ 완료
- [x] 공개 이메일 `asiaunion@gmail.com` 통일 (`tokyokorean78@gmail.com` 사이트 비노출)
- [x] Privacy §4·§7 GA4 정합성 KO/EN/JA 반영 (발효일 6/25 갱신)
- [x] postPerPage 8
- [x] Giscus 언마운트 (`8ef0234`) — 포스트 하단 에러 제거 (신청 후 `GiscusComments.astro`로 재설정)

### 품질 스모크
- [x] 홈 · `/about/` · `/contact/` · `/privacy-policy/` 200 ✅
- [x] KO 포스트 20편 200 · `[사진 필요]` 본문 0건 ✅
- [x] `npm run build` exit 0 (`3f70855` 배포 시 확인) ✅

---

## Phase 3 — 사진 (AdSense·색인 요청 전) 🟡 2차 진행

SSOT: [`PHOTO_NEEDED_TRACKER.md`](./PHOTO_NEEDED_TRACKER.md)

| 등급 | AdSense 7/13 전 | 6/25 상태 |
|------|-----------------|-----------|
| ⭐⭐⭐ 6편 (27곳) | **필수** | **6/6** hero+본문 ✅ |
| ⭐⭐ 7편 (18곳) | 권장 | 은행·병원·임대·쓰레기·마쓰리·생활비 등 hero 반영 |
| ⭐ 7편 (16곳) | 선택 | 대부분 미삽입 — 신청 후 가능 |

**라이브 검증 (6/25):** `japan-banking-credit-card-hero.jpg` · `tokyo-housing-rental-process-hero.jpg` · `tokyo-life-cost-of-living-hero.jpg` → HTTP 200

이미지 규격: [`BLOG_IMAGE_RULES_1PAGE.md`](../BLOG_IMAGE_RULES_1PAGE.md)

### Cursor AdSense 승인률 재평가 (7/20 신청 기준)

| 항목 | 이전 (사진 전) | 현재 (6/25) |
|------|----------------|-------------|
| 종합 승인 가능성 | 65~75% | **78~85%** |
| thin content 리스크 | 높음 (텍스트-only 다수) | **낮~중** (13편 hero) |
| ⭐⭐⭐ 게이트 | 0/6 | **6/6** ✅ |
| E-E-A-T·기술 인프라 | ✅ | ✅ (변동 없음) |

**강점:** 본인 촬영 실사진 다수 · 은행·병원 이미지 재교정(`d167b7e`) · 니혼바시 히스토리 4본문 · 슈퍼마켓 3본문

**잔여 리스크**

| 리스크 | 영향 | 조치 |
|--------|------|------|
| `tokyo-weekend-getaway-spots` 이미지 0 | ~~중~~ | ✅ hero+본문 4장 반영 |
| ogImage 없는 7편 | 낮~중 | 신청 가능, 여유 시 보강 |
| GSC URL 색인 미요청 | 중 | 사진 URL 확정 후 10건 (Joseph) |
| 신규 도메인 (2026) | 낮 | 20편 고품질·실사진으로 상쇄 |

**현재 추정:** **78~85%**

---

## Phase 4 — GSC URL 색인 요청 (~7/10) ⏳

**조건:** ⭐⭐⭐ 6편 배포 완료(히어로 + 대표 본문 이미지) · E-E-A-T 페이지 정상

**GSC 조작:** URL 검사 → 붙여넣기 → 「색인 생성 허용됨」 → **색인 생성 요청** (하루 **10건** 권장)

### 우선 URL (~10–15)

| # | URL | 비고 |
|---|-----|------|
| 1 | `https://tokyokorean.net/` | 홈 |
| 2 | `https://tokyokorean.net/about/` | E-E-A-T |
| 3 | `https://tokyokorean.net/contact/` | E-E-A-T |
| 4 | `https://tokyokorean.net/privacy-policy/` | AdSense 필수 |
| 5 | `https://tokyokorean.net/ko/posts/nihonbashi-hidden-cafes/` | ⭐⭐⭐ |
| 6 | `https://tokyokorean.net/ko/posts/japan-convenience-store-must-buys/` | ⭐⭐⭐ |
| 7 | `https://tokyokorean.net/ko/posts/nihonbashi-history-and-modern-life/` | ⭐⭐⭐ |
| 8 | `https://tokyokorean.net/ko/posts/nihonbashi-why-i-live-here/` | ⭐⭐⭐ |
| 9 | `https://tokyokorean.net/ko/posts/tokyo-supermarket-guide/` | ⭐⭐⭐ |
| 10 | `https://tokyokorean.net/ko/posts/tokyo-weekend-getaway-spots/` | ⭐⭐⭐ |

「이미 색인됨」이면 스킵 → 같은 Day 다음 URL로 진행.

⭐⭐·⭐ 편은 신청 전 여유 있으면 추가 요청.

---

## Phase 5 — AdSense 신청 (7/13~15) ⏳

1. **Do not** commit a real publisher ID in git. Vercel Production:
   - `PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-4729433282370174`
2. Redeploy — `Layout.astro` emits:
   ```html
   <meta name="google-adsense-account" content="ca-pub-…" />
   ```
3. AdSense UI에서 tokyokorean.net 사이트 추가·신청
4. **승인 후:** `public/ads.txt` 최종 확인 · `https://tokyokorean.net/ads.txt` 200
5. **승인 후:** Giscus 재설정 (Discussions 활성화 + giscus.app 설정)

### 신청 전 체크
- [x] ⭐⭐⭐ 6편 이미지 반영 라이브 ✅
- [ ] GSC URL 색인 요청 10건+ 완료 (반영은 1~2주 소요 가능)
- [x] Cookie Consent / meta / ads.txt / Privacy / About / Contact ✅
- [x] 이메일 통일 / Privacy GA4 정합성 / Giscus 에러 제거 ✅
- [x] Topic·Category 뱃지 GSF 잔재 제거 (`f2b4141`) ✅
- [x] Non-YMYL — 선교·신앙 색채 없음 ✅
- [x] ogImage 13/20 + 본문 실사진 25건 라이브 ✅

---

## Deploy with analytics env

Astro inlines `PUBLIC_*` at **build time**:

```bash
PUBLIC_GA4_MEASUREMENT_ID=G-86NS9E5Y20 \
PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-4729433282370174 \
pnpm run build
```

Or redeploy from Vercel dashboard with Production env vars.

---

## Optional maintenance

- Re-run `pnpm exec astro check && pnpm run build` before each release.
- TokyoKorean uses **essay-mode CI**: sources in frontmatter optional. See [`CONTENT_INTEGRITY_GATES.md`](../CONTENT_INTEGRITY_GATES.md).
- Lighthouse Mobile on `/` + one ⭐⭐⭐ post — target ≥ 90 SEO (이미지 추가 후 CLS·LCP 재측정).

---

## 요청하지 않을 URL

| URL 유형 | 이유 |
|----------|------|
| `/tags/*` | noindex 목록 |
| draft 포스트 | `#20 tokyo-korean-community-culture` |
| RSS / admin | 크롤 비대상 |

---

*2026-06-25 갱신 — weekend·NEXPECT 사진 배포, ⭐⭐⭐ 6/6, 승인률 78~85%*
