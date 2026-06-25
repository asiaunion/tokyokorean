# TokyoKorean — Weekly Status

---

## [HUB] 프로젝트 요약 (전체 현황판용 공통 필드)

| 필드 | 값 |
|------|-----|
| 최종 업데이트 | 2026-06-25 (AdSense prep fixes — disclaimer lang, cookie banner, modDatetime) |
| 프로젝트명 | TokyoKorean |
| 상태 | 🟠 AdSense 준비 중 — GSC ✅ · Phase 2A ✅ · trust polish ✅ · 사진 0/61 |
| 목표 + 기한 | AdSense 신청 (2026-07-13~15, 플랜 B) |
| 이번 주 최우선 액션 | Joseph: **루트 A** 촬영 → AG Phase 2B 사진 삽입 |
| 다음 체크포인트 | ⭐⭐⭐ 6편 사진 배포 → GSC URL 색인 (~7/10) → AdSense 신청 (7/13~15) |
| 블로커 | 실제 이미지 미삽입 61곳 (텍스트 플레이스홀더는 해소됨) |

---

## 🏗️ 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| 사이트 구조 (Astro + Vercel) | ✅ 완료 | tokyokorean.net 접속 가능 |
| 포스트 20편 | ✅ 라이브 | 2026-06-20 배포 완료 |
| Privacy Policy 3개 (KO/EN/JA) | ✅ 수정 완료 | gsfark.com → tokyokorean.net (2026-06-21) |
| About·포스트 `[사진 필요]` 텍스트 | ✅ 완료 | KO 20편 본문 0건 (2026-06-21~24 확인) |
| 포스트 **실제 이미지** 삽입 | 🔜 Joseph + AG | **0/61** — [`PHOTO_NEEDED_TRACKER.md`](docs/PHOTO_NEEDED_TRACKER.md) |
| Cookie Consent / AdSense meta | ✅ 완료 | Phase 2A meta 라이브 · **CookieConsent 배너 복원** (AdSense 크롤러 비차단) |
| 공개 이메일 | ✅ `asiaunion@gmail.com` 통일 | `1c33a25` — `tokyokorean78@gmail.com` 사이트 비노출 |
| Privacy GA4 정합성 | ✅ §4·§7 KO/EN/JA 반영 | `1c33a25` — 발효일 6/25 갱신 |
| Giscus 댓글 | ✅ 언마운트 완료 | `8ef0234` — `GiscusComments.astro` 보존, AdSense 신청 후 재설정 |
| 태그·허브·메뉴 라우팅 | ✅ 정상 | `ccce7e2` · `0a19ce7` · `581350b` |
| modDatetime 라벨 | ✅ 정리 | `dbbfc1b` 제거 후 `a87afab` 일괄 재추가 → **Cursor 6/25 재제거** (미래 pub 포스트 오표시 방지) |
| vercel.json 레거시 리다이렉트 | ✅ 정리 | `42e25ab` — GSF-Ark 레거시 55줄 삭제 |
| postPerPage | ✅ 8 | `1c33a25` |
| GSC 소유권 인증 | ✅ 완료 | Joseph 대시보드 진입 확인 (2026-06-24) |
| GSC sitemap 제출 | ✅ 제출됨 | Joseph **6/25~26** Success·~24 URL 재확인 |
| GSC URL 색인 요청 | ⏳ ⭐⭐⭐ 사진 배포 후 | ~7/10, 하루 10건 권장 |
| GA4 | ✅ `G-86NS9E5Y20` | gtag 라이브 · **Realtime Joseph 확인 완료** (2026-06-24) |
| AdSense Publisher ID | ✅ 라이브 | `ca-pub-4729433282370174` |
| AdSense 신청 | ⏳ 7/13~15 | ⭐⭐⭐ 6편 + E-E-A-T 페이지 이미지 권장 |

---

## 📸 사진 파이프라인 SSOT (2026-06-24 전수 분석)

> **구분:** `[사진 필요: …]` **텍스트** = ✅ 삭제 완료 · **실제 이미지 파일** = ⏳ TRACKER 추적

| 등급 | 편수 | 위치 | AdSense 전 필수? |
|------|------|------|------------------|
| ⭐⭐⭐ 최우선 | 6 | 27곳 | **예** — 루트 A(니혼바시 도보) 일괄 촬영 |
| ⭐⭐ 중간 | 7 | 18곳 | 권장 — 신청 전 일부 |
| ⭐ 하위 | 7 | 16곳 | 선택 — #20 draft 포함, 신청 후 가능 |

**⭐⭐⭐ 6편:** `nihonbashi-hidden-cafes` · `japan-convenience-store-must-buys` · `nihonbashi-history-and-modern-life` · `nihonbashi-why-i-live-here` · `tokyo-supermarket-guide` · `tokyo-weekend-getaway-spots`

**촬영 루트:** A(니혼바시 도보 1~2h) → B(근교 반나절) → C(스톡·개인서류). 상세는 [`PHOTO_NEEDED_TRACKER.md`](docs/PHOTO_NEEDED_TRACKER.md).

---

## 🔍 GSC · AdSense 순서 (2026-06-24 확정)

| # | 작업 | 사진 필요? | 시점 |
|---|------|-----------|------|
| 1 | GSC 소유권 인증 | ❌ | **지금** |
| 2 | GSC sitemap 제출 | ❌ | 인증 직후 |
| 3 | Cookie Consent / AdSense meta 봇 허용 | ❌ | **지금** (AG Task 1) |
| 4 | GA4 등록 | ❌ | GSC 직후 |
| 5 | 루트 A 촬영 → ⭐⭐⭐ AG 이미지 삽입·배포 | ✅ | Joseph + AG 순차 |
| 6 | GSC URL 색인 요청 (~10–15 URL) | ✅ | **5 완료 후**, ~7/10 |
| 7 | AdSense 신청 | ✅ | 7/13~15 |

**색인 요청 대상 (6단계):** 홈 · About · Contact · Privacy · ⭐⭐⭐ 6편(이미지 반영 URL만). 61곳 전부까지 기다릴 필요 없음.

상세: [`docs/ADSENSE_AND_GSC_CHECKLIST.md`](docs/ADSENSE_AND_GSC_CHECKLIST.md)

---

## ✅ 2026-06-21 완료 작업

| 작업 | 내용 |
|------|------|
| Privacy 3개 파일 수정 | GSF Blog/gsfark.com → Tokyo Korean/tokyokorean.net, 운영자명 Joseph KIM, 최종업데이트 6/21 |
| About KO 플레이스홀더 삭제 | `[사진 필요: 니혼바시 거리...]` 텍스트 제거 |
| 포스트 플레이스홀더 삭제 | 20편 전체 — `[사진 필요: …]` 본문 0건 (5편 6/21 + 잔여 6/24 확인) |
| 루트 잔재 파일 정리 | blueprint 4개, spec 2개, run_logs 5개, json 데이터 11개, audit report, py 스크립트 3개 → `_archived/` 이동 |
| 사진 위치 추적 문서 | `docs/PHOTO_NEEDED_TRACKER.md` — 6/21 48곳 → **6/24 61곳** 전수 재분석 |
| LinkedIn 실계정 연결 확인 | ✅ seungju-kim-3b3629260 정상 |
| ads.txt Publisher ID 확인 | ✅ ca-pub-4729433282370174 동일 계정 확인 |

---

## ⚠️ 세션 메모 (다음 세션 참고)

**AdSense 실제 리스크 (TokyoKorean)**
GSF-Ark 거절 패턴을 그대로 이식하지 말 것. TokyoKorean(Non-YMYL) 핵심 리스크: **이미지 없는 텍스트-only 포스트**, Cookie Consent로 AdSense 봇 차단, 콘텐츠 양·E-E-A-T 페이지 완성도.

**pubDatetime 날짜 분산 → 보류**
사이트 개설일(6월)보다 이전 날짜 소급 시 신뢰도 감점 리스크. 현상 유지. 신규 포스트로 활동 신호 확보.

---

## 🔜 AG 작업 지시서

| 문서 | 시점 | 내용 |
|------|------|------|
| [`AG_TASK_2026-06-24_gsc-ownership-sitemap.md`](docs/AG_TASK_2026-06-24_gsc-ownership-sitemap.md) | ✅ 완료 | GSC 소유권 + sitemap |
| [`AG_TASK_2026-06-24_phase2-adsense-prep.md`](docs/AG_TASK_2026-06-24_phase2-adsense-prep.md) | ✅ 완료 | `1f23724` |
| [`AG_TASK_2026-06-25_adsense-trust-polish.md`](docs/AG_TASK_2026-06-25_adsense-trust-polish.md) | ✅ 완료 | `1c33a25` — 이메일·Privacy·postPerPage |
| [`AG_TASK_2026-06-25_giscus-unmount.md`](docs/AG_TASK_2026-06-25_giscus-unmount.md) | ✅ 완료 | `8ef0234` — Giscus 언마운트 |
| [`AG_TASK_2026-06-24_photos-route-a.md`](docs/AG_TASK_2026-06-24_photos-route-a.md) | ⏳ Joseph 촬영 후 | ⭐⭐⭐ 6편 27곳 이미지 삽입 |

<details>
<summary>Phase 2A 요약 (접기)</summary>

1. Vercel `PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-4729433282370174` → redeploy → meta curl PASS  
2. Joseph GA4 `G-___` → Vercel env → Realtime 확인  
3. CookieConsent 미마운트 확인 · dead code 선택 정리  
4. Joseph GSC sitemap Success ~24 + AG curl 24  
5. `pnpm run build` · _handoff

</details>

---

## 📋 콘텐츠 전략 (2026-06-19 확정)

**포지션**: "도쿄 니혼바시에 사는 한국인의 실제 생활 아카이브"
**타깃**: 일본 생활에 관심 있는 한국인
**언어**: 한국어 단일
**차별화**: 필자(Joseph KIM)의 실거주 경험 — 니혼바시 거주, 콘도 매입, 개호 근무, 한일 부부

---

## ⚠️ 주의사항

- 선교/신앙 색채 배제 (생활 블로그)
- GSF-Ark와 중복 금지 (부동산 투자 분석은 Ark 전용)
- AdSense 심사 중 기독교 관련 내용 포함 금지

---

## 🗂️ 관련 문서

| 문서 | 용도 |
|------|------|
| `docs/PHOTO_NEEDED_TRACKER.md` | 사진 삽입 위치 61곳 · ⭐⭐⭐/⭐⭐/⭐ · 루트 A/B/C |
| `docs/AG_TASK_2026-06-24_phase2-adsense-prep.md` | **Phase 2A** AdSense·GA4·GSC 후속 |
| `docs/AG_TASK_2026-06-24_photos-route-a.md` | **Phase 2B** ⭐⭐⭐ 사진 (Joseph 촬영 후) |
| `docs/CLAUDE_HANDOFF_20260625.md` | **Claude 인수인계 최신** (세션 시작 시 필독) |
| `docs/CLAUDE_HANDOFF_20260624.md` | ~~superseded~~ by 20260625 |
| `docs/ADSENSE_AND_GSC_CHECKLIST.md` | AdSense·GSC 단계별 체크리스트 |
| `BLOG_IMAGE_RULES_1PAGE.md` | 이미지 삽입 규격 |
| `docs/GPT_BRIEFING_TOKYOKOREAN_2026-06-19.md` | GPT 콘텐츠 작업 브리핑 |
| `docs/AG_TASK_2026-06-15_planb-tokyokorean.md` | 사이트 구축 AG 지시서 |

---

## 📝 작업 로그

### 2026-06-25
- **Trust polish 완료** (`1c33a25`) — 이메일 `asiaunion@gmail.com` 통일, Privacy §4·§7 GA4 반영, postPerPage 8
- 태그 무한 리다이렉트 수정 (vercel.json 레거시 룰 제거)
- AdSense trust polish (개인정보처리방침 GA4 반영 및 이메일/페이지네이션 갱신)
- Giscus 컴포넌트 언마운트 (PostDetails)
- **Giscus 언마운트** (`8ef0234`) — 포스트 하단 에러 제거, `GiscusComments.astro` 보존
- **라우팅 정리** — 허브 슬러그·라벨 수정(`ccce7e2`), Header/Footer `/ko/` prefix 제거(`0a19ce7`), 태그 리다이렉트 ~1881건 제거(`581350b`), GSF-Ark 레거시 55줄 삭제(`42e25ab`)
- **modDatetime 라벨 제거** (`dbbfc1b`) — KO 16편
- **AdSense 평가 정합성 확인** — 헤더 네비 있음(기존 평가 오류 수정), 이메일·Privacy·Giscus 완료

### 2026-06-24
- **Phase 2A 완료** — AdSense meta+script · GA4 `G-86NS9E5Y20` · CookieConsent 아카이브 (`1f23724`)
- GSC 소유권 및 sitemap-index.xml 제출
- Phase 2A(AdSense Prep) 환경변수 설정 및 Vercel 배포 완료
- **Joseph GA4 Realtime** — `G-86NS9E5Y20` active user 확인 완료
- **SSOT 정렬** — GSC 순서(인증·sitemap=지금 / URL 색인=⭐⭐⭐ 사진 후), 플레이스홀더 vs 실제 이미지 구분 반영
- `[사진 필요]` KO 20편 **0건** 재확인 — AG Task(플레이스홀더 삭제) 종료
- `PHOTO_NEEDED_TRACKER.md` 전수 재분석 — 48곳 → **61곳**, ⭐⭐⭐ 6편(27) / ⭐⭐ 7편(18) / ⭐ 7편(16), 루트 A/B/C
- `ADSENSE_AND_GSC_CHECKLIST.md` TokyoKorean 단계별 순서 추가
- GSF-Job: エコナビスタ·パラマウントベッド 불합격 반영 (6/23)

### 2026-06-22
- AdSense EEAT 보강 (저자 프로필 갱신, 공식 출처 2개 기재)
- 발행일 5일 앞당김 적용 및 배포

### 2026-06-21
- Privacy Policy 3개 파일 수정 (gsfark.com → tokyokorean.net)
- About KO 플레이스홀더 삭제
- 포스트 플레이스홀더 삭제 (5편 직접 + 잔여 완료)
- 루트 잔재 파일 _archived/ 이동 (blueprint, spec, logs, json, py)
- 사진 위치 추적 문서 생성 (docs/PHOTO_NEEDED_TRACKER.md)
- ads.txt Publisher ID 확인 / LinkedIn 실계정 확인

### 2026-06-20
- /ko/posts/* 404 수정
- About 프로필 이미지 교체, Hero 수정
- 포스트 20편 라이브 배포

### 2026-06-19
- 콘텐츠 전략 확정
- GPT 브리핑 문서 작성
- WEEKLY_STATUS.md 신규 작성

### 2026-06-15
- 사이트 구조 완성 (Astro + Vercel)
- 초안 15편 생성
- tokyokorean.net 도메인 등록
