# AG TASK — Plan B: tokyokorean.net AdSense 승인용 블로그 구축
> 생성: 2026-06-15
> 작성: Claude
> 목적: AdSense 계정 활성화 전용 Non-YMYL 블로그 런칭
> 타임라인: 6/15~7/10 구축·콘텐츠 → 7/10~15 AdSense 신청

---

## 배경 및 목적

- GSFArk.com (투자·부동산 YMYL) AdSense 5차 거절 후 재신청 대기 중
- Plan B: Non-YMYL 블로그로 AdSense **계정 자체를 먼저 활성화**
- 계정 활성화 후 → GSFArk.com을 동일 계정에 추가 사이트로 등록 예정
- GSFGrace.com은 이 플랜에서 완전 제외 (사역 사이트, 비전 충돌)

---

## 확정 사항 (변경 불가)

| 항목 | 결정 |
|------|------|
| 도메인 | `tokyokorean.net` |
| 플랫폼 | Astro-Lite (Vercel 무료 티어) |
| 언어 | 한국어 단일 |
| 니치 | 한국인의 일본 생활·문화·한일 비교 (Non-YMYL) |
| 목표 콘텐츠 수 | 15~20편 게시 후 AdSense 신청 |
| GSF 브랜드 | 완전 제외 — 독립적 1인칭 일본 생활 블로그로 포지셔닝 |

---

## STEP 1 — 도메인 구매

**tokyokorean.net** 구매 (Namecheap 또는 Google Domains 권장)
- 구매 후 Vercel 프로젝트에 커스텀 도메인 연결
- 구매 완료 후 도메인 등록 확인 스크린샷 보고

---

## STEP 2 — Astro-Lite 코드베이스 구축

### 핵심 원칙
GSFArk 코드를 복제하되 **철저히 다이어트** — 아래 항목 전부 제거:

**제거 대상 (필수):**
- 다국어(i18n) 구조 전체 — 한국어 단일
- Admin CMS (`/admin/` 관련 코드 전체)
- Turso DB, Google OAuth, JWT 등 서버 기능 전체
- Cookie Consent 배너 — **절대 달지 않음** (GSFArk 실수 반복 금지)
- 태그 페이지 pagination
- Newsletter 폼 (선택, 나중에 추가 가능)

**유지 대상:**
- Astro 기본 구조 + Tailwind
- 포스트 목록·상세 페이지
- About / Contact / Privacy Policy 페이지
- 사이트맵 (`@astrojs/sitemap`) — admin 등 불필요 URL 처음부터 제외
- 다크모드 (선택)
- 관련 포스트 섹션

### AdSense 최적화 (처음부터 완벽히)
- `PUBLIC_ADSENSE_PUBLISHER_ID` 환경변수 설정
- `<meta name="google-adsense-account">` 태그 Layout.astro에 삽입
- `public/ads.txt` — **처음부터 실제 pub-ID 기재** (주석 절대 금지)
  ```
  google.com, pub-4729433282370174, DIRECT, f08c47fec0942fa0
  ```
- AdSense 스크립트 **무조건 로드** (쿠키 동의 조건 절대 금지)

### 필수 페이지
- `/about/` — 저자 소개 (한국어, 1인칭, 니혼바시 거주 한국인)
- `/contact/` — 연락처
- `/privacy-policy/` — 개인정보처리방침 (한국어)

---

## STEP 3 — 콘텐츠 15편 목록 초안 작성

아래 카테고리 기준으로 **제목 + 소제목 3~5개 + 예상 글자 수** 구성:

| 카테고리 | 편수 |
|----------|------|
| 일본 생활 실용 | 4편 |
| 한일 문화 비교 | 4편 |
| 도쿄·니혼바시 로컬 | 4편 |
| 일본어 팁 (N1 경험) | 3편 |

**포맷 규칙:**
- 편당 1,000~1,500자 이상
- h2/h3 태그 활용한 문단 구성
- 본인 사진 2~3장 포함 예정 슬롯 표시
- 1인칭 경험 에세이 톤

---

## STEP 4 — Vercel 배포 및 GSC 등록

1. Vercel 프로젝트 신규 생성 (`tokyokorean-net` 등)
2. `tokyokorean.net` 커스텀 도메인 연결
3. 환경변수 설정 (`PUBLIC_ADSENSE_PUBLISHER_ID` 등)
4. 배포 후 라이브 확인:
   ```bash
   curl -s https://tokyokorean.net/ads.txt
   # 출력: google.com, pub-4729433282370174, DIRECT, f08c47fec0942fa0
   curl -sI https://tokyokorean.net/ | grep -i '^HTTP'
   # 출력: HTTP/2 200
   ```
5. Google Search Console에 `tokyokorean.net` 등록 + 사이트맵 제출

---

## STEP 5 — 보고

각 STEP 완료 후 아래 형식으로 보고:

```
[STEP 1] 도메인 구매 완료 여부
[STEP 2] Astro-Lite 코드베이스 구축 완료 + 커밋 해시
[STEP 2-검증] ads.txt curl 결과 / AdSense 메타태그 HTML 확인
[STEP 3] 콘텐츠 15편 목록 초안 (제목 + 소제목)
[STEP 4] Vercel 배포 URL + GSC 등록 확인
```

---

## 주의사항

- GSF 브랜드명 어디에도 사용 금지 (도메인·저자명·사이트명 전부)
- Cookie Consent 배너 절대 금지
- ads.txt 주석(#) 절대 금지 — 실제 pub-ID만 기재
- Admin 관련 URL 절대 sitemap에 포함 금지
- 다국어 구조 금지 — 한국어 단일
- 임의 기능 추가 금지 — 요청한 5개 STEP만 실행
- 콘텐츠 초안은 목사님 검토 후 실제 게시 (AG 임의 게시 금지)
