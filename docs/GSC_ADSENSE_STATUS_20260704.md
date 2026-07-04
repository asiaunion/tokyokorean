# TokyoKorean — GSC / AdSense 상태 (Cursor SSOT)

> **갱신:** 2026-07-04 23:14 JST · Owner: Cursor  
> **사이트:** https://tokyokorean.net/

---

## Joseph 확인 사항 (2026-07-04)

| # | 항목 | 상태 |
|---|------|------|
| 1 | GSC **404 수정 결과 확인** (`/ko/`, `/ja/`) | ✅ 확인됨 |
| 2 | **색인 생성됨** 페이지 | ✅ 아래 목록 (5페이지) |
| 3 | Sitemap `sitemap-index.xml` | ✅ **성공** (제출 6/24, 최종 읽기 7/1, 발견 **26**페이지) |
| 4 | 사이트 소유권(GSC) | ✅ 속성 접근 가능 = **이미 인증됨** (아래 방법 참고) |

---

## 색인 생성됨 (5페이지) — GSC 리포트 기준

| URL | 최종 크롤 (리포트) |
|-----|-------------------|
| `https://tokyokorean.net/` | 2026-06-30 |
| `https://tokyokorean.net/about/` | 2026-06-25 |
| `https://tokyokorean.net/contact/` | 2026-06-25 |
| `https://tokyokorean.net/privacy-policy/` | 2026-06-25 |
| `https://tokyokorean.net/topics/` | 2026-06-20 |

**아직 색인 목록에 없음 (정상 — 최근 배포·미크롤):**

- `/terms/` (2026-07-04 배포, 사이트맵 포함)
- `/posts/` 및 개별 포스트 20개 (GSC: **발견됨·현재 미색인** 21건과 대응)

신뢰 페이지(홈·소개·연락·개인정보)는 이미 색인되어 AdSense 심사에 유리합니다. 포스트·이용약관은 URL 검사로 **색인 생성 요청**하면 됩니다.

---

## Sitemap

| 필드 | 값 |
|------|-----|
| 제출 URL | `/sitemap-index.xml` |
| 상태 | **성공** |
| 발견 페이지 | **26** (홈·about·contact·posts 목록·포스트 20·privacy·terms·topics) |

`/terms/`가 사이트맵에 있으므로, 다음 읽기 이후 “발견”에 잡히거나 URL 검사로 앞당길 수 있습니다.

---

## 사이트 인증 (소유권 확인)

### 현재 상태

GSC에서 `https://tokyokorean.net/` 속성을 보고 있으므로 **소유권은 이미 확인된 상태**입니다. 추가 “인증”이 필요한 경우는 보통:

1. **AdSense**가 사이트 소유를 물을 때  
2. GSC **설정 → 소유권 확인**에 다른 방법을 추가할 때  

### 이미 배포된 방법 (HTML 파일)

레포·라이브에 HTML 확인 파일이 있습니다.

| 항목 | 값 |
|------|-----|
| 파일 | `public/google21b29b3e517c0ba5.html` |
| 라이브 URL | https://tokyokorean.net/google21b29b3e517c0ba5.html |
| 내용 | `google-site-verification: google21b29b3e517c0ba5.html` |

이 파일이 GSC에 등록한 토큰과 같으면 **추가 작업 없음**.

### 확인 절차 (Joseph)

1. GSC → **설정(Settings)** → **소유권 확인(Ownership verification)**  
2. 사용 중인 방법이 **HTML 파일**인지 **HTML 태그(메타)** 인지 확인  
3. HTML 파일이면 위 URL이 **200**인지 브라우저로 열기 (이미 배포됨)  
4. 메타 태그 방식이면 Vercel에 `PUBLIC_GOOGLE_SITE_VERIFICATION=<토큰>` 설정 후 재배포  
   - 코드: `Layout.astro`가 env가 있을 때만 `<meta name="google-site-verification">` 출력  
   - `.env.example`에 안내 있음  

### AdSense에서 “사이트 소유 확인”을 물을 때

- GSC와 **같은 Google 계정**으로 AdSense에 로그인했는지 확인  
- 또는 AdSense가 안내하는 **ads.txt / 메타 / HTML 파일** 중 하나를 따르면 됨  
- 본 사이트 `public/ads.txt` 및 (env 설정 시) AdSense 스크립트·메타는 코드에 준비됨  

---

## Joseph 남은 액션 (우선순위)

| 우선 | 액션 |
|------|------|
| 1 | URL 검사: `/terms/` + 주요 `/posts/...` **색인 생성 요청** |
| 2 | (선택) 설정 → 소유권 확인에서 방법·상태 스크린샷만 보관 |
| 3 | AdSense 계정 생성·사이트 추가 후 `PUBLIC_ADSENSE_PUBLISHER_ID` → Vercel env → 재배포 |
| 4 | 신청서: Joseph KIM, 도쿄 거주 8년, 포스트 샘플 |

**코드 추가 작업 없음** (locale 근본 수정·이용약관·리다이렉트 완료).

---

## 코드 마일스톤 (참고)

| commit | 내용 |
|--------|------|
| `59e05f1` | locale SSOT — `/ko` `/ja` 링크 생성 중단 |
| `6cb5dd0` / `295bd51` | `/ko` `/ja` 308 보험 |
| `f1e01f1` | `/terms/` 이용약관 |

---

## 관련

- [`docs/LOCALE_SSOT.md`](./LOCALE_SSOT.md)
- GSF-Ark 후속: `GSF-Ark/docs/DEFERRED_AFTER_ADSENSE.md` (별 사이트)
