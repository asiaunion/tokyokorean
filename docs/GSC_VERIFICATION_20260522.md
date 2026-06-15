# Google Search Console 통과 점검 (2026-05-22)

**목표:** AdSense 재승인 전 **GSC 속성 검증 + 색인 기반** 확보.  
**Canonical:** `https://gsfark.com/` (www는 308 → non-www)

---

## 1. 기술 사전 점검 (자동 — PASS)

| 항목 | 결과 | 확인 방법 |
|------|------|-----------|
| `robots.txt` | **PASS** | `Allow: /`, `Sitemap: https://gsfark.com/sitemap-index.xml` |
| `sitemap-index.xml` | **PASS** | 200 → `sitemap-0.xml` |
| 사이트맵 URL 수 | **124** | macro-barrier KO/EN/JA 각 1건 포함 |
| 소유권 HTML 파일 | **PASS** | `https://gsfark.com/google21b29b3e517c0ba5.html` → 200 |
| `www` → apex | **PASS** | 308 → `https://gsfark.com/` |
| hreflang (홈) | **PASS** | `en` / `ko` / `ja` / `x-default` |
| canonical (홈) | **PASS** | `https://gsfark.com/` |
| GSC 우선 URL 6건 | **PASS** | 모두 HTTP 200 |
| `/en/posts/…` legacy | **PASS** | 308 → `/posts/…/` |

### GSC 우선 URL (200 확인됨)

1. https://gsfark.com/
2. https://gsfark.com/topics/
3. https://gsfark.com/ko/posts/macro-barrier-and-super-scarce-real-estate-selection/
4. https://gsfark.com/posts/macro-barrier-and-super-scarce-real-estate-selection/
5. https://gsfark.com/ja/posts/macro-barrier-and-super-scarce-real-estate-selection/
6. https://gsfark.com/ko/about/

---

## 2. 수정한 GSC 리스크

| 이슈 | 영향 | 조치 |
|------|------|------|
| 사이트맵에 `https://gsfark.com/en/` 포함 | 리다이렉트 URL이 sitemap에 있으면 Coverage 경고·크롤 예산 낭비 | `astro.config.ts` sitemap `filter`에서 `/en`, `/en/*` **제외** |

배포 후 확인:

```bash
curl -sL https://gsfark.com/sitemap-0.xml | grep '/en/' && echo FAIL || echo OK_no_en
```

---

## 3. Search Console에서 할 일 (순서 고정)

### Step A — 속성

1. https://search.google.com/search-console
2. 속성 추가 또는 선택: **URL 접두어** `https://gsfark.com/`  
   - `www.gsfark.com` 별도 속성은 **불필요** (이미 apex로 308)
3. 소유권 확인 방법: **HTML 파일**  
   - 파일: `google21b29b3e517c0ba5.html` (이미 배포됨)  
   - 또는 **HTML 태그** — `PUBLIC_GOOGLE_SITE_VERIFICATION` Vercel env 설정 시 `<meta name="google-site-verification">` 출력 (선택)

### Step B — Sitemap

1. 왼쪽 **Sitemaps**
2. 새 사이트맵: `sitemap-index.xml` (전체 URL 붙이지 말 것)
3. 상태가 **성공**인지, 발견된 URL 수가 120+ 인지 확인
4. **`/sitemap.xml` 제출 항목 삭제** — 이 사이트는 Astro `@astrojs/sitemap`이 `sitemap-index.xml`만 생성함. `/sitemap.xml`은 **404** → GSC “가져올 수 없음” (robots.txt는 이미 `sitemap-index.xml` 가리킴)

### Step C — URL 검사 (6건)

각 URL → **URL 검사** → “Google 색인 생성 허용됨” 또는 **색인 생성 요청**

| # | URL | 기록 (직접 채움) |
|---|-----|------------------|
| 1 | `/` | |
| 2 | `/topics/` | |
| 3 | macro-barrier KO | |
| 4 | macro-barrier EN (`/posts/…`) | |
| 5 | macro-barrier JA | |
| 6 | `/ko/about/` | |

### Step D — Coverage (배포 48시간 후)

- **페이지 색인 생성** / **제외됨** — `리디렉션`, `404`, `noindex` 급증 여부
- **Sitemap** — “가져올 수 없음” 없는지

---

## 4. 배포 반영 확인 (2026-05-22 — 배포 전/후)

| 검사 | 배포 전 (21:43 KST) | 배포 후 (21:55 KST) |
|------|---------------------|---------------------|
| `curl -sI …/ko/tags/Investment/` | **404** (middleware·slash 규칙 충돌) | **308** → `/tags/investment/` |
| `curl -sI …/tags/Investment/` | **404** | **308** → `/tags/investment/` (2차 배포 후) |
| `curl -sL sitemap-0.xml \| grep /en/` | **FAIL** — `https://gsfark.com/en/` 1건 | **OK** — `/en/` 없음 |
| `curl -sI …/en/posts/macro-barrier…/` | **308** → `/:path*` (버그) | **308** → `/posts/macro-barrier…/` |
| `curl -sI …/author/gsf/` | **404** | **308** → `/about/` |
| `curl -sI …/feed/` | **404** | **308** → `/rss.xml` |
| `curl -sI …/ko/posts/(한글 slug, URL-encoded)/` | **404** (비인코딩 URL) | **308** → `j-reit-five-things-to-know` |
| `curl -sI …/tags/real-estate/` | **200** | **200** |

**원인 요약:** main에 `0e89eac`·`240d082`가 있었으나 프로덕션 빌드가 뒤처져 sitemap·정적 redirect가 미반영. 추가로 **middleware**가 cross-locale 태그 redirect 시 slugify 없이 대소문자를 유지해 GSC 404·리디렉션 오류 유발 → `canonicalTagSegment()` 적용 커밋.

---

## 5. GSC “페이지 색인” 표 해석 (2026-05-22 스크린샷)

| GSC 사유 | 페이지 수 | 해석 | 조치 |
|----------|-----------|------|------|
| **noindex** | 62 | **의도적** — `/tags/`, `/search`, `/archives` (`robotsMeta="noindex, follow"`) | 본문 글은 noindex **없음**. 태그 허브를 색인할 계획이 없으면 **정상** |
| **리디렉션** | 3 | legacy `/en/*` 등 | sitemap에서 `/en` 제거·308 라우트 유지 |
| **크롤링됨–미색인** | 5 | 품질/우선순위 | URL 검사 → 색인 요청 |
| **리디렉션 오류** | 1 | `/ko/tags/Investment/` → `/tags/Investment/` (404) | middleware + `crossLocaleTagRedirects` slugify, 배포 |
| **404** | 53 | WP legacy·태그 대소문자·공백 slug (`Real%20Estate` vs `real-estate`)·한글 옛 post slug | `legacyPostRedirects` + vercel.json WP rules + middleware slugify 배포 후 **유효성 검사** |
| **발견–미색인** | 61 | 신규·무볼륨 사이트 흔함 | sitemap 제출 + 핵심 6 URL 색인 요청 |

**목표 지표:** “색인 생성됨” **본문 포스트·허브(`/`, `/topics/`, `/about`)** — 태그/검색 62건은 제외해도 됨.

### 404 유형 (코드 대조, 예시 URL)

| 유형 | 예시 (프로덕션 점검) | 처리 레이어 |
|------|----------------------|-------------|
| EN 태그가 `/ko/tags/`·`/ja/tags/` | `/ko/tags/Investment/` | middleware 308 → `/tags/investment/` |
| 태그 대소문자·공백 | `/tags/Investment/`, `/tags/Real%20Estate/` | middleware → slugify canonical |
| legacy `/en/*` | `/en/posts/…` | middleware + `vercel.json` + `en/[...path].astro` |
| WP | `/wp-admin/`, `/author/…`, `/feed/` | `vercel.json` (배포 시 config 병합) |
| 한글 옛 post slug | `/ko/posts/일본-리츠j-reits-…/` | `astro.config` `getLegacyPostRedirects()` |

---

## 6. 흔한 실패 원인 (이 사이트 기준)

| 원인 | 현재 상태 |
|------|-----------|
| 잘못된 속성 (www vs non-www) | apex만 사용 권장 |
| sitemap 미제출 | index만 제출하면 됨 |
| `/en/` URL 혼선 | sitemap에서 제거 + 308 라우트 유지 |
| 장기 무크롤 (좀비 도메인) | URL 검사 6건 + 신규 글 지속 발행 |
| `noindex` on posts | 포스트에 robots noindex **없음** (스팟 확인) |

---

## 7. AdSense와 분리

- GSC 통과 ≠ AdSense 승인. 지금 단계에서는 **색인·Coverage·소유권**만 보면 됨.
- `ads.txt` / GA4는 GSC 이후 또는 병행 가능하나 **GSC 블로커는 아님**.

---

## 8. 관련 파일

- [`GSC_MANUAL_STEPS_20260522.md`](./GSC_MANUAL_STEPS_20260522.md) — 짧은 체크리스트
- [`ADSENSE_AND_GSC_CHECKLIST.md`](./ADSENSE_AND_GSC_CHECKLIST.md) — Phase 4-11 GSC 섹션
- `src/pages/en/[...path].astro` — legacy `/en/*` → canonical (sitemap 제외)

---

*다음: 배포 후 GSC — sitemap 재제출, 404·리디렉션 **유효성 검사 시작**, URL 검사 6건 (`GSC_MANUAL_STEPS_20260522.md`).*
