# TokyoKorean — Weekly Status

---

## [HUB] 프로젝트 요약 (전체 현황판용 공통 필드)

| 필드 | 값 |
|------|-----|
| 최종 업데이트 | 2026-06-21 |
| 프로젝트명 | TokyoKorean |
| 상태 | 🟠 AdSense 준비 중 |
| 목표 + 기한 | AdSense 신청 (2026-07-13~15, 플랜 B) |
| 이번 주 최우선 액션 | AG 작업 지시서 전달 후 실행 + 사진 순차 삽입 |
| 다음 체크포인트 | 사진 삽입 완료 후 GSC 소유권 인증 |
| 블로커 | 사진 미삽입 (Joseph + AG 순차 진행 중) |

---

## 🏗️ 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| 사이트 구조 (Astro + Vercel) | ✅ 완료 | tokyokorean.net 접속 가능 |
| 포스트 20편 | ✅ 라이브 | 2026-06-20 배포 완료 |
| Privacy Policy 3개 (KO/EN/JA) | ✅ 수정 완료 | gsfark.com → tokyokorean.net (2026-06-21) |
| About KO 플레이스홀더 | ✅ 삭제 완료 | `[사진 필요]` 텍스트 제거 (2026-06-21) |
| 포스트 내 `[사진 필요]` 플레이스홀더 | 🔜 AG 작업 필요 | 5편 처리 완료, 15편 미처리 |
| 포스트 사진 삽입 | 🔜 Joseph + AG 순차 | 48곳 추적 문서 생성됨 |
| Cookie Consent 봇 허용 확인 | 🔜 AG 작업 필요 | GSF-Ark 거절 원인 동일 이슈 |
| GSC 소유권 인증 | ⏳ 사진 삽입 완료 후 | 순서 중요 |
| GA4 속성 등록 | ⏳ GSC 이후 | Joseph 직접 |
| AdSense Publisher ID Vercel 등록 | ⏳ 신청 직전 | ca-pub-4729433282370174 확인 완료 |
| AdSense 신청 | ⏳ 7/13~15 | 플랜 B (GSFArk 7/10 신청 후 3~5일) |

---

## ✅ 2026-06-21 완료 작업

| 작업 | 내용 |
|------|------|
| Privacy 3개 파일 수정 | GSF Blog/gsfark.com → Tokyo Korean/tokyokorean.net, 운영자명 Joseph KIM, 최종업데이트 6/21 |
| About KO 플레이스홀더 삭제 | `[사진 필요: 니혼바시 거리...]` 텍스트 제거 |
| 포스트 5편 플레이스홀더 삭제 | japan-life-8years-honest, tokyo-life-cost-of-living, nihonbashi-why-i-live-here, japan-banking-credit-card, nihonbashi-buying-property-foreigner |
| 루트 잔재 파일 정리 | blueprint 4개, spec 2개, run_logs 5개, json 데이터 11개, audit report, py 스크립트 3개 → `_archived/` 이동 |
| 사진 위치 추적 문서 생성 | `docs/PHOTO_NEEDED_TRACKER.md` — 20편 48곳 위치 기록 |
| LinkedIn 실계정 연결 확인 | ✅ seungju-kim-3b3629260 정상 |
| ads.txt Publisher ID 확인 | ✅ ca-pub-4729433282370174 동일 계정 확인 |

---

## ⚠️ 세션 메모 (다음 세션 참고)

**AdSense 전략 재검토 필요**
이번 세션에서 땜질식 항목 처리(날짜 소급 등)가 반복됨. 다음 세션에서는 실행 전에 "TokyoKorean AdSense 승인을 막는 실제 리스크가 무엇인가"를 구조적으로 먼저 분석할 것. GSF-Ark 거절 원인을 그대로 이식하지 말 것 — 두 사이트 상황이 다름.

**AG 작업 지시서 전달 필요**
`docs/PHOTO_NEEDED_TRACKER.md` 및 세션 클로징 메모 기반으로 AG에게 전달할 작업 지시서 작성 완료 (Claude 세션 내 인라인). AG에게 전달 후 확인 필요.

**pubDatetime 날짜 분산 → 보류**
사이트 개설일(6월)보다 이전 날짜로 소급 설정 시 구글 신뢰도 감점 리스크. 현상 유지(2026-06-20 동일)가 더 안전. 신규 포스트 추가로 자연스러운 활동 신호를 만드는 방향 권고.

---

## 🔜 AG 작업 지시서 (전달 대기)

아래 내용을 AG에게 전달할 것.

### Task 1. 포스트 `[사진 필요: ...]` 플레이스홀더 전수 삭제
- 대상: `src/data/blog/ko/` 내 미처리 15편
- 처리 완료 제외 파일: japan-life-8years-honest, tokyo-life-cost-of-living, nihonbashi-why-i-live-here, japan-banking-credit-card, nihonbashi-buying-property-foreigner
- 방법: `[사진 필요: ...]` 형식 줄 전체 삭제. 연속 빈 줄 2개 이상 시 1개로 정리. 본문 내용 절대 수정 금지.

### Task 2. Cookie Consent → AdSense 봇 허용 확인 및 수정
- GSF-Ark AdSense 거절 원인과 동일한 이슈 가능성
- `src/` 내 Cookie Consent 컴포넌트 확인
- AdSense `<meta name="google-adsense-account">` 태그가 consent 조건 없이 항상 렌더링되는지 확인
- 수정 필요 시 변경 사항 Joseph에게 보고 후 처리

### Task 3. 루트 잔여 임시 파일 정리
- 대상: `test-replace.ts`, `test.js`, `test.ts`, `test-time.js`, `fix-status.cjs`, `dump-posts.ts`, `wait-for-production.js`
- 빌드 필수 파일(astro.config.ts, package.json 등) 절대 이동 금지
- 불명확한 파일은 Joseph 확인 후 처리

### Task 4. 완료 후 빌드 검증
```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean
pnpm run build
```
에러 없으면 완료 보고. 에러 발생 시 내용 전달.

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
| `docs/PHOTO_NEEDED_TRACKER.md` | 포스트 사진 필요 위치 추적 (48곳) |
| `docs/ADSENSE_AND_GSC_CHECKLIST.md` | AdSense·GSC 체크리스트 |
| `docs/GPT_BRIEFING_TOKYOKOREAN_2026-06-19.md` | GPT 콘텐츠 작업 브리핑 |
| `docs/AG_TASK_2026-06-15_planb-tokyokorean.md` | 사이트 구축 AG 지시서 |

---

## 📝 작업 로그

### 2026-06-21
- Privacy Policy 3개 파일 수정 (gsfark.com → tokyokorean.net)
- About KO 플레이스홀더 삭제
- 포스트 5편 플레이스홀더 삭제 (15편 AG 위임)
- 루트 잔재 파일 _archived/ 이동 (blueprint, spec, logs, json, py)
- 사진 위치 추적 문서 생성 (docs/PHOTO_NEEDED_TRACKER.md)
- ads.txt Publisher ID 확인 / LinkedIn 실계정 확인
- AG 작업 지시서 작성 (WEEKLY_STATUS.md 하단 기록)

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
