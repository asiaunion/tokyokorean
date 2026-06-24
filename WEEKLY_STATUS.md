# TokyoKorean — Weekly Status

---

## [HUB] 프로젝트 요약 (전체 현황판용 공통 필드)

| 필드 | 값 |
|------|-----|
| 최종 업데이트 | 2026-06-24 (SSOT·GSC 순서 정렬) |
| 프로젝트명 | TokyoKorean |
| 상태 | 🟠 AdSense 준비 중 — GSC Phase 1 ✅ · 사진 0/61 |
| 목표 + 기한 | AdSense 신청 (2026-07-13~15, 플랜 B) |
| 이번 주 최우선 액션 | **AG Phase 2A:** [`phase2-adsense-prep`](docs/AG_TASK_2026-06-24_phase2-adsense-prep.md) · Joseph: GA4 ID · GSC sitemap 48h 재확인 |
| 다음 체크포인트 | GSC sitemap **24~48h 후** Success 확인 · ⭐⭐⭐ 사진 → URL 색인 (~7/10) |
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
| Cookie Consent 봇 허용 확인 | 🔜 AG Phase 2A | 배너 **미마운트** 확인됨 · dead code 정리 · AdSense meta Vercel env |
| GSC 소유권 인증 | ✅ 완료 | Joseph 대시보드 진입 확인 (2026-06-24) |
| GSC sitemap 제출 | ✅ 제출됨 | `sitemap-index.xml` — GSC **0 URL·가져올 수 없음**은 제출 직후 정상, 24~48h 재확인 |
| GSC URL 색인 요청 | ⏳ ⭐⭐⭐ 사진 배포 후 | ~7/10, 하루 10건 권장 |
| GA4 속성 등록 | 🔜 Joseph → AG env | Measurement ID 전달 후 Vercel redeploy |
| AdSense Publisher ID Vercel 등록 | ⏳ 신청 직전 | ca-pub-4729433282370174 확인 완료 |
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
| [`AG_TASK_2026-06-24_phase2-adsense-prep.md`](docs/AG_TASK_2026-06-24_phase2-adsense-prep.md) | **지금** | AdSense meta · GA4 · CookieConsent 감사 · GSC sitemap 48h |
| [`AG_TASK_2026-06-24_photos-route-a.md`](docs/AG_TASK_2026-06-24_photos-route-a.md) | Joseph 촬영 후 | ⭐⭐⭐ 6편 27곳 이미지 삽입 |

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
| `docs/AG_TASK_2026-06-24_gsc-ownership-sitemap.md` | GSC Phase 1 ✅ |
| `docs/ADSENSE_AND_GSC_CHECKLIST.md` | AdSense·GSC 단계별 체크리스트 (TokyoKorean 순서 포함) |
| `BLOG_IMAGE_RULES_1PAGE.md` | 이미지 삽입 규격 |
| `docs/GPT_BRIEFING_TOKYOKOREAN_2026-06-19.md` | GPT 콘텐츠 작업 브리핑 |
| `docs/AG_TASK_2026-06-15_planb-tokyokorean.md` | 사이트 구축 AG 지시서 |

---

## 📝 작업 로그

### 2026-06-24
- **GSC Phase 1 완료** — 소유권 ✅ · sitemap-index.xml 제출 ✅ (`_handoff` AG 10:25)
- **Cursor 검증** — curl 24 URL · E-E-A-T 200 · robots Sitemap · build PASS · URL 색인 미실시(범위 준수) ✅
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
