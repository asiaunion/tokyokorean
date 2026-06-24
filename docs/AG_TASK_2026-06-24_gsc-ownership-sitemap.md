# AG TASK — TokyoKorean GSC 소유권 인증 + Sitemap 제출
> 생성: 2026-06-24  
> 작성: Cursor (Joseph 요청)  
> 프로젝트: TokyoKorean (`tokyokorean.net`)  
> 목적: AdSense 7/13~15 전 **Search Console 속성 확보 + sitemap 제출** (URL 색인 요청은 **별도** — ⭐⭐⭐ 사진 배포 후)  
> SSOT: [`WEEKLY_STATUS.md`](../WEEKLY_STATUS.md) · [`ADSENSE_AND_GSC_CHECKLIST.md`](./ADSENSE_AND_GSC_CHECKLIST.md)

---

## 배경

| 항목 | 내용 |
|------|------|
| 도메인 | `https://tokyokorean.net/` |
| 포스트 | 20편 라이브 (KO 단일) |
| 사이트맵 | `https://tokyokorean.net/sitemap-index.xml` → `sitemap-0.xml` (**24 URL**, 2026-06-24 curl 확인) |
| 사진 | 텍스트 `[사진 필요]` 0건 ✅ · 실제 이미지 0/61 ⏳ — **본 TASK 범위 아님** |
| GSC URL 색인 요청 | **하지 않음** — Joseph, ⭐⭐⭐ 6편 사진 배포 후 (~7/10) |

**역할 분담**

| 담당 | 작업 |
|------|------|
| **AG** | 사전 점검 · 소유권 파일/메타 배포 · Joseph GSC UI 안내 · 완료 보고(curl + 스크린샷 체크리스트) |
| **Joseph** | Google Search Console 로그인 · 속성 추가 · **소유권 확인 클릭** · sitemap 제출 |

> GSC는 Google 로그인 필수. AG 브라우저에 Joseph 세션이 없으면 **UI 조작은 Joseph**, AG는 **기술 준비·검증**만.

---

## STEP 0 — 사전 점검 (AG, 배포 전)

저장소: `/Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean`

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean

# 사이트맵
curl -sI https://tokyokorean.net/sitemap-index.xml | head -3
curl -sI https://tokyokorean.net/sitemap-0.xml | head -3
curl -s https://tokyokorean.net/sitemap-0.xml | grep -c '<loc>'

# sitemap.xml → sitemap-index.xml 리다이렉트 (astro.config 308)
curl -sI https://tokyokorean.net/sitemap.xml | grep -i '^HTTP\|^location'

# robots.txt
curl -s https://tokyokorean.net/robots.txt | head -20

# E-E-A-T 필수 페이지
for u in / /about/ /contact/ /privacy-policy/; do
  echo -n "$u "; curl -sI "https://tokyokorean.net$u" | head -1
done

# 기존 GSC 검증 파일 (GSF-Ark 복제본일 수 있음 — STEP 1에서 Joseph 토큰으로 교체)
curl -sI https://tokyokorean.net/google21b29b3e517c0ba5.html | head -3
```

**PASS 기준**

| 항목 | 기대 |
|------|------|
| sitemap-index.xml | HTTP 200, `application/xml` |
| sitemap URL 수 | ≥ 20 (포스트+정적) |
| /about/ /contact/ /privacy-policy/ | HTTP 200 |
| admin | sitemap **미포함** (`astro.config.ts` filter) |

점검 결과를 완료 보고 §4 표에 기록.

---

## STEP 1 — 소유권 검증 준비 (AG + Joseph)

### 1-A. Joseph — GSC 속성 추가 (수동, ~5분)

1. https://search.google.com/search-console (Joseph Google 계정 — AdSense·GSF-Ark와 **동일 계정 권장**)
2. **속성 추가** → **URL 접두어** 선택  
   → 입력: `https://tokyokorean.net/`
3. **소유권 확인** 화면에서 방법 선택 (아래 **권장: HTML 파일**)

### 1-B. 권장 방법 — HTML 파일

Joseph가 GSC에 표시된 **새 파일명**을 AG에게 전달 (예: `googleabcd1234efgh5678.html`).

AG 작업:

1. GSC 화면의 파일 **전체 내용**을 `public/<파일명>.html` 로 저장  
   (한 줄 예: `google-site-verification: googleabcd1234efgh5678.html`)
2. **기존 파일 처리:** `public/google21b29b3e517c0ba5.html` 은 **GSF-Ark용 복제본**일 가능성 높음.  
   Joseph가 발급받은 **tokyokorean.net 전용** 파일만 유지. 구 파일은 삭제하거나 Joseph 확인 후 삭제.
3. 커밋 → `main` push → Vercel 배포 완료 대기
4. 검증:
   ```bash
   curl -s "https://tokyokorean.net/<Joseph가_준_파일명>.html"
   ```
   → GSC에 표시된 내용과 **바이트 일치**
5. Joseph에게 **「소유권 확인」버튼 클릭** 요청

### 1-C. 대안 — HTML meta 태그

Joseph가 meta `content="..."` 값만 전달한 경우:

1. Vercel Production 환경변수 추가:
   - `PUBLIC_GOOGLE_SITE_VERIFICATION=<Joseph가_준_content_값>`
2. 재배포 (`Layout.astro`가 `<meta name="google-site-verification">` 출력)
3. 확인:
   ```bash
   curl -s https://tokyokorean.net/ | grep google-site-verification
   ```
4. Joseph **「소유권 확인」** 클릭

### 1-D. 대안 — DNS TXT (도메인 등록업체/Vercel DNS)

Joseph가 DNS TXT 레코드를 선호하면 AG는 **레코드 값만 Joseph에게 전달** (GSC UI 표시).  
Vercel → Domains → tokyokorean.net → DNS Records 에 TXT 추가는 **Joseph 또는 AG(DNS 접근 시)**.

---

## STEP 2 — Sitemap 제출 (Joseph 수동, 소유권 확인 직후)

Joseph 조작 (~3분):

1. Search Console → 속성 `https://tokyokorean.net/` 선택
2. 왼쪽 **Sitemaps** (사이트맵)
3. **새 사이트맵 추가** → 입력:

   ```
   sitemap-index.xml
   ```

   (전체 URL `https://tokyokorean.net/sitemap-index.xml` 도 가능)

4. **제출**
5. 24~48h 후 상태 확인:
   - **성공** / 발견 URL ~24
   - 오류 0 목표

**제출하지 말 것:** `sitemap.xml` (308 → index로 리다이렉트만 됨 — index만 제출)

AG는 Joseph 완료 후 스크린샷 요청 또는 Joseph가 공유한 화면으로 §4 표 작성.

---

## STEP 3 — AG 완료 후 검증 (curl + 선택 Lighthouse)

```bash
pnpm run build   # exit 0

# noindex 없는지 샘플 3건 (홈 + 포스트 1)
curl -s https://tokyokorean.net/ | grep -i robots
curl -s https://tokyokorean.net/posts/nihonbashi-hidden-cafes/ | grep -i 'noindex\|canonical'
```

**선택:** URL 검사 **1건만** Joseph 계정에서 시험 (`https://tokyokorean.net/`) —  
「색인 생성 허용됨」 확인. **대량 색인 요청은 이번 TASK 범위 밖.**

---

## STEP 4 — 완료 보고 (AG → Joseph / _handoff)

아래를 채워 `_handoff.md` append + Joseph에게 전달.

```markdown
## [YYYY-MM-DD HH:MM] AG — TokyoKorean GSC 소유권 + Sitemap
- 소유권 방법: HTML 파일 / meta / DNS (해당 항목)
- 검증 파일 또는 env: `<파일명 또는 PUBLIC_GOOGLE_SITE_VERIFICATION 설정 여부>`
- 라이브 확인: curl PASS / FAIL
- GSC 소유권: Joseph 확인 완료 / 대기
- Sitemap 제출: sitemap-index.xml — Joseph 제출 완료 / 대기
- 발견 URL (GSC): ___
- sitemap curl URL 수: ___
- 다음: GA4 등록 (Joseph) · ⭐⭐⭐ 사진 후 URL 색인 (~7/10)
- 스크린샷: GSC 속성 Overview + Sitemaps (Joseph 제공)
```

### 보고 체크리스트

| # | 항목 | AG | Joseph |
|---|------|-----|--------|
| 1 | STEP 0 curl 사전 점검 | ☐ | |
| 2 | tokyokorean 전용 verification 파일/meta 배포 | ☐ | 토큰 제공 |
| 3 | GSC 속성 `https://tokyokorean.net/` 추가 | | ☐ |
| 4 | 소유권 **확인됨** | | ☐ |
| 5 | sitemap-index.xml 제출 | | ☐ |
| 6 | Sitemap 상태 Success (24~48h) | | ☐ |
| 7 | `pnpm run build` PASS | ☐ | |
| 8 | _handoff.md 기록 | ☐ | |

---

## 하지 말 것

| 금지 | 이유 |
|------|------|
| URL 색인 요청 10건+ 일괄 진행 | ⭐⭐⭐ 사진 배포 전 — SSOT 순서 위반 |
| GSF-Ark `google21b29b3e517c0ba5.html` 그대로 두고 “완료” 보고 | tokyokorean.net 전용 토큰 필요 |
| sitemap에 admin·tags 포함 | 이미 filter 제외 — 코드 변경 불필요 |
| Joseph GSC 로그인 없이 “인증 완료” 주장 | UI 확인은 Joseph |

---

## 범위 밖 (후속 TASK)

| 항목 | 시점 | 문서 |
|------|------|------|
| GA4 속성 + Vercel `PUBLIC_GA4_MEASUREMENT_ID` | GSC 직후 | ADSENSE_AND_GSC_CHECKLIST Phase 2 |
| Cookie Consent / AdSense meta | 병렬 | WEEKLY AG Task 1 |
| GSC URL 색인 요청 ~10건 | ⭐⭐⭐ 사진 후 ~7/10 | ADSENSE_AND_GSC_CHECKLIST Phase 4 |
| AdSense 신청 | 7/13~15 | ADSENSE_AND_GSC_CHECKLIST Phase 5 |

---

## Joseph → AG 전달 템플릿 (복사용)

```
TokyoKorean GSC TASK 시작.

소유권 방법: [ HTML 파일 / meta 태그 / DNS TXT ]

[HTML 파일인 경우]
파일명: google__________.html
파일 내용:
google-site-verification: google__________.html

[meta인 경우]
PUBLIC_GOOGLE_SITE_VERIFICATION=_______________________

GSC·Vercel 접근: [ AG DNS 가능 / Joseph만 가능 ]
```

---

*2026-06-24 — Plan B AdSense 타임라인 · GSC Phase 1 only*
