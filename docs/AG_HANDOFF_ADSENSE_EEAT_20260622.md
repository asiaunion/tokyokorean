# AG 통합 작업 지시서 — TokyoKorean AdSense 승인 준비

> **작성:** Cursor (Claude Code 인수인계 + WEEKLY_STATUS 통합)  
> **일자:** 2026-06-22 (발행일 스케줄·보강 범위 반영)  
> **목표:** AdSense 신청 (2026-07-13~20)  
> **작업 경로:** `/Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean`  
> ⚠️ **GSF-Ark가 아님**

---

## 배경

GSF-Ark에서 이식한 한국어 전용 생활 블로그. P0 버그(admin siteUrl, Giscus repo, alt, OG, 개인정보처리방침, GSF-Ark 잔재 코드)는 완료.  
이 문서는 **EEAT 강화 + 심사 전 품질 마감** 잔여 작업의 단일 SSOT이다.

**포지션:** 도쿄 니혼바시 거주 한국인의 실제 생활 아카이브  
**금지:** GSF-Ark 투자·J-REIT 분석 이식 / 선교·신앙 색채 / 본문 임의 수정  
**AG 범위 외 (Joseph 별도):** 포스트 본문 보강·분량 확장

---

## 발행일 스케줄 (적용 완료 — 2026-06-22)

`pubDatetime`은 아래 표대로 **frontmatter에 반영됨**. AG는 **변경하지 말 것**.

| 날짜 | slug | 글 제목 | 역할 |
|------|------|---------|------|
| 6/23 화 | `nihonbashi-why-i-live-here` | 왜 도쿄 니혼바시에 살게 되었나 | 사이트 정체성 |
| 6/24 수 | `japan-banking-credit-card` | 일본 은행 계좌 개설 방법 | 실전 생활정보 |
| 6/26 금 | `japan-life-8years-honest` | 일본 생활 8년 차 한국인이 솔직하게 말하는 것들 | 운영자 신뢰 |
| 6/27 토 | `tokyo-life-cost-of-living` | 도쿄 생활비 현실 | 검색 유입 |
| 6/28 일 | `nihonbashi-history-and-modern-life` | 니혼바시 역사와 현재 | 장소성 강화 |
| 6/30 화 | `tokyo-housing-rental-process` | 일본 집 구하기 | 이주/임대 실전 |
| 7/1 수 | `japan-garbage-disposal-rules` | 일본 쓰레기 분리수거 방법 | 생활 적응 |
| 7/3 금 | `tokyo-public-transportation-tips` | 도쿄 대중교통 완전 정복 | 도쿄 생활 인프라 |
| 7/4 토 | `japan-healthcare-hospital-visit` | 일본 병원 이용법 | 의료/생활 정보 |
| 7/5 일 | `tokyo-supermarket-guide` | 니혼바시 마트 비교 | 로컬 생활감 |
| 7/7 화 | `japan-married-to-japanese-culture-diff` | 일본인 아내와 살며 놀랐던 문화 차이 | 개인 서사 |
| 7/8 수 | `japan-language-learning-survival-japanese` | 일본어 공부법 | 언어/자격 신뢰 |
| 7/10 금 | `japan-korea-work-culture-diff` | 한국과 일본 직장 문화 차이 | 한일 비교 |
| 7/11 토 | `nihonbashi-buying-property-foreigner` | 일본에서 집을 산다는 것 | 고관여 신뢰 글 |
| 7/12 일 | `nihonbashi-hidden-cafes` | 니혼바시 카페 추천 | 로컬 다양성 |
| 7/13 월 | `tokyo-weekend-getaway-spots` | 니혼바시 베이스 당일치기 추천 | 생활권 확장 |
| 7/14 화 | `japan-elderly-care-frontline` | 개호 현장에서 본 일본의 고령사회 | 깊이/차별화 |
| 7/15 수 09:00 | `japan-seasons-matsuri-culture` | 일본 마쓰리 문화 | 문화/계절감 |

### 보류 (7/20 이후 — draft: true)

| slug | 글 제목 | 상태 |
|------|---------|------|
| `japan-convenience-store-must-buys` | 일본 편의점 추천 상품 | `draft: true`, pubDatetime 7/21 (임시) |
| `tokyo-korean-community-culture` | 도쿄 한인 커뮤니티 | `draft: true`, pubDatetime 7/21 (임시) |

Joseph이 일정 확정 후 `draft: false` + pubDatetime 조정.

---

## 우선순위 요약

| 순위 | 작업 | 담당 | AdSense 영향 |
|------|------|------|-------------|
| P0 | `[사진 필요]` 플레이스홀더 15편 삭제 + 빌드 | AG | 높음 |
| P0 | Cookie Consent / AdSense 봇 노출 확인 | AG (확인만) | 중간 |
| P1 | About 페이지 EEAT 보강 | AG | 높음 |
| P1 | sources (선택) — 사실 기반 5편만 | AG | 중간 |
| P2 | Giscus ID 입력 | **Joseph 수동** | 낮음 |
| P2 | 저자 프로필 이미지 rename | AG | 낮음 |
| P2 | GSF 브랜딩 잔재 정리 | AG | 낮음 |

---

## 공통 규칙

### 반드시 지킬 것

- 작업 디렉터리: `scratch/projects/TokyoKorean`
- 콘텐츠 변경 후: `pnpm validate:post <slug>`
- 일괄 마감 후: `pnpm run build`
- 출처 추가 시 (선택): `pnpm validate:post <slug>` — essay 프로필 기본
- strict 검증이 필요할 때만:
  ```bash
  CONTENT_INTEGRITY_REQUIRE_SOURCES=true CONTENT_INTEGRITY_MIN_SOURCES=2 pnpm exec astro check
  ```

### 절대 금지

- `pubDatetime` / `modDatetime` 변경 (Joseph가 2026-06-22 확정)
- **포스트 본문 보강·분량 확장** (Joseph 별도 단계)
- 본문 내용 임의 삭제 (플레이스홀더 줄 삭제만 예외)
- 포스트 하단 면책조항 수동 삽입 (`PostDisclaimer` 자동 처리)
- 포스트 내 `.svg` 사용
- `git commit` / 배포 (Joseph 명시 요청 시만)

### 참고 문서

| 문서 | 용도 |
|------|------|
| `WEEKLY_STATUS.md` | 프로젝트 현황·블로커 |
| `docs/PHOTO_NEEDED_TRACKER.md` | 사진 삽입 위치 48곳 (Joseph 순차) |
| `docs/ADSENSE_AND_GSC_CHECKLIST.md` | GSC·AdSense 체크리스트 |

---

## Phase 1 — P0 (먼저 실행)

### 1-A. `[사진 필요]` 플레이스홀더 전수 삭제

**대상:** `src/data/blog/ko/` 내 **미처리 15편**

이미 처리 완료 (건드리지 말 것):
- japan-life-8years-honest
- tokyo-life-cost-of-living
- nihonbashi-why-i-live-here
- japan-banking-credit-card
- nihonbashi-buying-property-foreigner

**미처리 15편:**
- tokyo-weekend-getaway-spots
- tokyo-supermarket-guide
- nihonbashi-history-and-modern-life
- nihonbashi-hidden-cafes
- tokyo-korean-community-culture *(보류 글이나 플레이스홀더는 삭제 가능)*
- japan-seasons-matsuri-culture
- japan-language-learning-survival-japanese
- japan-korea-work-culture-diff
- japan-convenience-store-must-buys *(보류 글이나 플레이스홀더는 삭제 가능)*
- tokyo-public-transportation-tips
- japan-garbage-disposal-rules
- tokyo-housing-rental-process
- japan-healthcare-hospital-visit
- japan-elderly-care-frontline
- japan-married-to-japanese-culture-diff

**방법:**
- `[사진 필요: ...]` 형식 **한 줄 전체 삭제**
- 연속 빈 줄 2개 이상 → 1개로 정리
- 그 외 본문 **절대 수정 금지**

### 1-B. Cookie Consent → AdSense 봇 허용 확인

`src/layouts/Layout.astro` 282~304행 확인:
- `PUBLIC_ADSENSE_PUBLISHER_ID` 설정 시 `<meta name="google-adsense-account">`와 adsbygoogle 스크립트가 **Cookie Consent 동의 여부와 무관하게 항상 렌더링**되는지 확인
- 이미 구현되어 있으면 **변경 없이 완료 보고**
- consent 조건으로 가려져 있으면 Joseph에게 보고 후 수정

### 1-C. 빌드 검증

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean
pnpm run build
```

에러 없으면 Phase 1 완료 보고.

### 1-D. (선택) 루트 임시 파일 정리

Joseph 확인 후 이동 대상:
- `test-replace.ts`, `test.js`, `test.ts`, `test-time.js`
- `fix-status.cjs`, `dump-posts.ts`, `wait-for-production.js`

→ `_archived/` 이동. `astro.config.ts`, `package.json` 등 빌드 필수 파일 **절대 이동 금지**.

---

## Phase 2 — P1 EEAT (About만)

### 2-A. About 페이지 저자 전문성 보강

**파일:** `src/data/about/ko.md`

현재: 거주·동기·블로그 소개 수준. EEAT Expertise 신호 부족.

**추가할 내용 (Joseph 실제 경력 기반, 생활 블로그 톤 유지):**

1. 한국 직업/커리어 배경 (손해보험 상품기획·통계 분석 등 — GSF-Ark About 참고 가능)
2. 2018 일본 이주 계기와 정착 과정
3. 니혼바시 콘도 **직접 매입** 경험 → `nihonbashi-buying-property-foreigner` 글과 상호 링크
4. 일본어 능력 수준 (JLPT, 생활·업무 사용 정도)
5. 개호 현장 경험 (해당 시) → `japan-elderly-care-frontline` 연결
6. **공적 프로필** 섹션: LinkedIn, X 링크 명시
7. "이 블로그 주제를 왜 내가 쓸 수 있는가" 한 단락

**주의:** GSF-Ark 투자·J-REIT 분석 톤 이식 금지. 생활·이주·로컬 관점만.

---

## Phase 3 — P1 출처 (sources, 선택적)

### TokyoKorean CI 정책 (Joseph 확정 2026-06-22)

**에세이·체험담 블로그**이므로 GSF-Ark식 **전 포스트 sources 필수 CI는 적용하지 않음.**

| 레이어 | 정책 |
|--------|------|
| CI | `CONTENT_INTEGRITY_REQUIRE_SOURCES=false` (적용 완료) |
| 스키마 | `sources:`를 **넣은 경우만** URL 품질·도메인 2개+ 검증 |
| validate:post | `BLOG_VALIDATION_PROFILE=essay` (기본) — sources 없어도 통과 |

**Phase 3 실행:** **전략 A (선택적)** — 사실 기반이 강한 5편에만 공식 URL 2개+ frontmatter `sources` 추가.  
나머지 에세이 글은 sources 없이 유지 OK.

### 1차 대상 5편 (권장, 필수 아님)

| 포스트 | 출처 예시 |
|--------|----------|
| japan-banking-credit-card | 유초은행 외국인 안내, MUFG 공식 |
| japan-healthcare-hospital-visit | 후생노동성, 건강보험조합 안내 |
| tokyo-housing-rental-process | 국토교통省, SUUMO |
| nihonbashi-buying-property-foreigner | 법무성 외국인 부동산 취득 |
| tokyo-life-cost-of-living | 총무성 가계조사, 도쿄도 통계 |

**frontmatter 형식:**

```yaml
sources:
  - "https://example.go.jp/..."
  - "https://example2.jp/..."
```

- **서로 다른 도메인 2개 이상** 필수
- URL은 실제 접근 가능한 공식 페이지
- 추가 후 `pnpm validate:post <slug>` (essay 프로필; sources 없는 글도 통과)

---

## Phase 4 — P2 마무리

### 4-A. Giscus 댓글 (Joseph 수동 — AG 불가)

1. GitHub → `asiaunion/tokyokorean` → Discussions 활성화
2. https://giscus.app 에서 repo 설정
3. `src/components/GiscusComments.astro` 25~27행에 ID 입력:
   - `GISCUS_REPO_ID`
   - `GISCUS_CATEGORY_ID`

현재 repo는 `asiaunion/tokyokorean`으로 설정됨. ID만 비어 있음.

### 4-B. 저자 프로필 이미지 rename

**파일 이동:**
- `public/assets/images/gsf-author-profile.webp` → `joseph-kim-profile.webp`
- `public/assets/images/gsf-author-profile.png` → `joseph-kim-profile.png`
- 원본 → `_archived/` 이동
- `gsf-author.webp`, `gsf-author.png`, `gsf-author.jpg` — 미사용 확인 후 `_archived/` 이동

**참조 업데이트 (4곳):**
- `src/data/about/ko.md:6`
- `src/layouts/PostDetails.astro:43`
- `src/layouts/AboutLayout.astro:22`
- `src/layouts/AboutLayout.astro:38` — Person JSON-LD `name: "Joseph (GSF)"` → `"Joseph KIM"`

전수 확인: `grep -rn "gsf-author" src/`

### 4-C. GSF 브랜딩 잔재 (여유 시)

| 파일 | 내용 |
|------|------|
| `src/config.ts:13` | `ogImage: "gsf-og-default.jpg"` |
| `src/components/AffiliateDisclosure.astro` | "GSF" → "TokyoKorean" 또는 Joseph KIM |
| `src/data/resources/tokyo-relocation-d90/*.md` | description의 "GSF" 문구 |

---

## Joseph 전용 (AG 이후)

| 항목 | 시점 |
|------|------|
| 포스트 본문 보강·분량 확장 | 별도 단계 |
| Giscus ID 입력 | Phase 4-A |
| 실제 사진 48곳 삽입 | `docs/PHOTO_NEEDED_TRACKER.md` 순차 |
| 편의점·커뮤니티 글 일정 확정 | 7/20 이후 |
| GSC 소유권 인증 | 사진·플레이스홀더 정리 후 |
| GA4 속성 등록 | GSC 이후 |
| AdSense 신청 | 7/13~20 |

---

## 완료 체크리스트 (AG 보고용)

```
Phase 1
[ ] 15편 플레이스홀더 삭제
[ ] Cookie Consent / AdSense 봇 확인 (변경 없음 or 수정 내역)
[ ] pnpm run build 성공

Phase 2
[ ] about/ko.md EEAT 보강

Phase 3
[ ] (선택) 5편 sources 추가 — Joseph/AG 판단
[ ] validate:post 해당 slug 통과

Phase 4
[ ] 프로필 이미지 rename + 참조 4곳
[ ] (선택) GSF 브랜딩 잔재
```

---

## 이미 완료 (참고 — 재작업 금지)

- `src/admin/config.ts` — TokyoKorean / tokyokorean.net
- `src/admin/lib/github.ts` — asiaunion/tokyokorean
- `src/layouts/AdminLayout.astro` — TokyoKorean Admin
- `src/lib/validation/pdfText.ts`, `sourceVerification.ts` — User-Agent
- `PostDetails.astro` alt → "Joseph KIM"
- `GiscusComments.astro` — repo 변경 (ID만 대기)
- `public/astropaper-og.jpg` → `_archived/`
- Privacy ko/en/ja — 상세 주소 제거
- Contact en/ja — 상세 주소 제거
- Privacy 3개 — gsfark.com → tokyokorean.net
- About KO 플레이스홀더 삭제
- 포스트 5편 플레이스홀더 삭제
- **발행일 스케줄 18편 pubDatetime 적용 (2026-06-22)**
- **편의점·커뮤니티 2편 draft 보류**

---

*Claude Code 인수인계 + WEEKLY_STATUS 통합본 · 글 보강 제외 · 발행일 Joseph 확정*
