# GSF-Ark — Weekly Status

---

## [HUB] 프로젝트 요약 (전체 현황판용 공통 필드)

| 필드 | 값 |
|------|-----|
| 최종 업데이트 | 2026-06-15 |
| 프로젝트명 | GSF-Ark |
| 상태 | 🟠 AdSense 재신청 대기 + Plan B 준비 중 |
| 목표 + 기한 | AdSense 계정 활성화 → GSFArk 추가 등록 (2026 Q3) |
| 이번 주 최우선 액션 | 6/29~30 GSFArk 재제출 + tokyokorean.net Plan B 병행 준비 |
| 다음 체크포인트 | 6/29~30 AdSense 재제출 / 7/10~15 Plan B 런칭 + 신청 |
| 블로커 | 없음 — 기술 결함 전부 해소 완료 (2026-06-15) |

---

## 🔴 이번 주 필수 액션

| 기한 | 항목 | 상태 |
|------|------|------|
| 6/29~30 | GSFArk AdSense 재제출 (체크박스 체크 → 다시 제출) | ⏳ 대기 |
| 7/10~15 | tokyokorean.net Plan B 런칭 + AdSense 신청 | 🔄 AG 준비 중 |
| 매주 화/목 | 발행 목표 주 2회 유지 | 🔄 진행 중 |

---

## ✅ 2026-06-15 완료 작업

| 항목 | 내용 | 커밋 |
|------|------|------|
| sitemap admin URL 제거 | astro.config.ts filter 1줄 추가 | 0d84582 |
| 라이브 검증 | sitemap 151→147개 (admin 4개 정확히 감소) | — |
| ads.txt 상태 | 라이브 200 + 정상 pub-ID 확인 | — |

---

## 📋 AdSense 현황 (2026-06-15 기준)

| 항목 | 상태 |
|------|------|
| 신청 횟수 | 5차 (조치 필요 통보 수신) |
| 기술 결함 | ✅ 전부 해소 (admin sitemap, consent-gate, ads.txt) |
| 재제출 예정 | 6/29~30 (2주 cool-off 후) |
| GSC 색인 추세 | ⚠️ 130개대 → 120개대 → 116개 하락 추세 모니터링 필요 |

---

## 🆕 Plan B — tokyokorean.net

| 항목 | 내용 |
|------|------|
| 목적 | Non-YMYL 블로그로 AdSense 계정 먼저 활성화 |
| 도메인 | tokyokorean.net (확정) |
| 플랫폼 | Astro-Lite + Vercel (무료) |
| 언어 | 한국어 단일 |
| 니치 | 한국인의 일본 생활·문화·한일 비교 |
| 콘텐츠 목표 | 15~20편 게시 후 신청 |
| 타임라인 | 6/15~7/10 구축·콘텐츠 → 7/10~15 런칭 + 신청 |
| AG 지시서 | `docs/AG_TASK_2026-06-15_planb-tokyokorean.md` |
| 계정 활성화 후 | GSFArk.com 동일 계정 추가 등록 예정 |

---

## ✍️ 콘텐츠 발행 현황

| 항목 | 값 |
|------|-----|
| 발행 목표 | 주 2회 이상 (화/목) |
| 현재 총 발행 수 | 36기사 (2026-06-09 기준) |
| 소셜 자동 배포 | ✅ 정상 가동 중 |
| 언어 | 日/韓/英 3언어 |

---

## 📈 과제 로드맵 (우선순위 순)

| 순위 | 과제 | 상태 | 비고 |
|------|------|------|------|
| 1 | AdSense 계정 활성화 | 🔄 진행 중 | Plan A(GSFArk 재제출) + Plan B(tokyokorean.net) 병행 |
| 2 | tokyokorean.net 런칭 | 🔄 AG 준비 중 | 7/10~15 목표 |
| 3 | GSC 색인 하락 모니터링 | 🔄 관찰 중 | 116개 → 2주 후 재확인 |
| 4 | SEO 최적화 | ⬜ 미착수 | 승인 후 착수 |
| 5 | 발행 지속성 유지 | 🔄 진행 중 | 주 2회 화/목 |

---

## 📊 KPI (미정 — 별도 논의 예정)

> ⚠️ KPI 항목 및 측정 방식은 별도 세션에서 확정 예정.

---

## 📅 주간 루틴 (고정)

| 주기 | 항목 |
|------|------|
| 매주 화/목 | 발행 1건 이상 |
| 매주 | 소셜 자동 배포 정상 가동 확인 |
| 수시 | 애드센스 메일함 확인 |
| 6/29~30 | GSFArk AdSense 재제출 (목사님 직접) |

---

## 🗂️ 관련 문서

| 문서 | 용도 |
|------|------|
| `docs/AG_TASK_2026-06-15_adsense-sitemap-fix.md` | sitemap admin 제거 AG 지시서 |
| `docs/AG_TASK_2026-06-15_planb-tokyokorean.md` | Plan B tokyokorean.net AG 지시서 |
| `docs/kpi-archive/` | 주간 KPI 기록 (확정 후 운영) |

---

## 📝 작업 로그

### 2026-06-15
- AdSense "조치 필요" 통보 수신 확인
- 라이브 sitemap 점검 → admin URL 4개 여전히 포함 확인
- AG: astro.config.ts sitemap filter admin 제외 1줄 추가 (커밋 0d84582)
- 라이브 검증 완료: sitemap 151→147개, admin grep 빈 결과
- ads.txt 라이브 정상 확인 (200 + 정상 pub-ID)
- AdSense Audit v2 재검토 → 실제 원인: ads.txt 공백(5/8~5/22) + consent-gate(5/27~6/4) + 반복 재신청 패턴
- Author Card 라이브 확인 → 포스트 하단 정상 표시 (E-E-A-T 문제 없음)
- AdSense 재제출 전략 확정: 6/29~30 (2주 cool-off)
- Plan B 전략 확정: tokyokorean.net, Astro-Lite, 한국어 단일, Non-YMYL
- AG 지시서 2개 저장 완료
- GSC 색인 하락 확인: 130개대 → 120개대 → 116개 (모니터링 필요)

### 2026-06-13
- AdSense 기술 Audit v2 실행 및 보고서 작성
- 결함 발견: admin URL 4개 sitemap 포함, ads.txt 이력 재구성
- 현재 심사 대기 결정

### 2026-06-10
- reschedule_all.py 실행으로 34개 포스트 SNS 전체 재예약
- 히어로 섹션 2컬럼 리디자인 + ui/hero-2col→main 머지
- CTR 개선: 8개 포스트 EN/KO/JA title·description 업데이트

### 2026-06-09
- 소셜 배포 파이프라인 점검 (Buffer rate limit 해소 확인)
- sns_scheduler.py Threads 이미지 누락 버그 수정

### 2026-06-14
- GSF 폴더 구조 개편: GSF-Blog → GSF-Ark
- CLAUDE.md, projects.registry.yaml 경로 업데이트
