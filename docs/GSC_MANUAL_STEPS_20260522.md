# Google Search Console — 수동 완료 가이드 (2026-05-22)

자동 브라우저 시도 결과: **Google 로그인 필요** (에이전트 세션에 Search Console 세션 없음).

## 1. 속성 확인

1. https://search.google.com/search-console 접속 (gsfark.com 소유 계정)
2. 속성: **URL prefix** `https://gsfark.com/` 또는 **Domain** `gsfark.com`
3. 소유권: `public/google21b29b3e517c0ba5.html` 이미 배포됨

## 2. Sitemap 제출

| 항목 | 값 |
|------|-----|
| 제출 URL | `https://gsfark.com/sitemap-index.xml` |
| 확인 | `curl -sL https://gsfark.com/sitemap-index.xml` → 200 |

**경로:** Sitemaps → 새 사이트맵 추가 → 위 URL 입력 → 제출

## 3. URL 검사 (6건)

**사전 확인 (2026-05-22):** 아래 6 URL 모두 **HTTP 200**, `noindex` 없음, canonical 일치, sitemap 포함 → 색인 요청 가능.

### 조작 순서 (Search Console)

1. https://search.google.com/search-console → 속성 `https://gsfark.com/`
2. 상단 검색창 **「URL 검사」** (왼쪽 메뉴 맨 위와 동일)
3. 아래 URL을 **한 줄씩 붙여넣기** → Enter
4. 검사가 끝날 때까지 대기 (수십 초)
5. 확인할 것:
   - **「URL이 Google에 등록되어 있음」** 또는 **「Google에 등록 가능」**
   - **「페이지 색인 생성」** → **「색인 생성 허용됨」** (noindex 아님)
   - **「페이지 가져오기」** → **「성공」** (404·리디렉션 오류 아님)
6. **「색인 생성 요청」** 클릭 → **「요청됨」** 표시되면 다음 URL
7. 하루 할당량(보통 10~12건/속성)이면 당일은 6건만 요청해도 됨

**권장 순서:** 본문 3언어 → 허브 2건 → About (중요 글 우선)

| # | 붙여넣을 URL | 메모 |
|---|----------------|------|
| 1 | `https://gsfark.com/ko/posts/macro-barrier-and-super-scarce-real-estate-selection/` | KO 본문 |
| 2 | `https://gsfark.com/posts/macro-barrier-and-super-scarce-real-estate-selection/` | EN 본문 |
| 3 | `https://gsfark.com/ja/posts/macro-barrier-and-super-scarce-real-estate-selection/` | JA 본문 |
| 4 | `https://gsfark.com/` | 홈 |
| 5 | `https://gsfark.com/topics/` | EN 토픽 허브 |
| 6 | `https://gsfark.com/ko/about/` | KO About |

### 자주 나오는 메시지

| 화면 문구 | 의미 | 조치 |
|-----------|------|------|
| 색인 생성 허용됨 | 정상 | **색인 생성 요청** 클릭 |
| 색인 생성됨 | 이미 색인됨 | 요청 생략 가능 |
| 크롤링됨 – 현재 색인 생성 안 됨 | 품질·우선순위 | 요청은 해도 됨, 며칠 후 재확인 |
| 색인생성 excluded by noindex | noindex | 이 사이트 6건에는 해당 없음 |
| 리디렉션 오류 / 404 | URL 문제 | URL 오타·배포 확인 후 재검사 |

## 4. 기록 템플릿 (완료 후 `APLUS_VERIFICATION_CHECKLIST` §3.4에 반영)

| URL | 색인 상태 | 비고 |
|-----|----------|------|
| `/` | | |
| `/topics/` | | |
| macro-barrier KO | | |
| macro-barrier EN | | |
| macro-barrier JA | | |
| `/ko/about/` | | |

## 5. Sitemap 상태 템플릿

| 사이트맵 | 제출일 | 발견 URL | 상태 |
|----------|--------|----------|------|
| sitemap-index.xml | | | |

---

*에이전트는 로그인 후 재실행 시 브라우저로 제출 상태만 스냅샷 가능합니다.*
