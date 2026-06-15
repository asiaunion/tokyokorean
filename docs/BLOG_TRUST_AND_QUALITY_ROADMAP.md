# GSF-Blog 신뢰성·품질 로드맵

**단일 진입점** — 팩트·번역·게이트·AG/Cursor 분업·CI를 한 문서에서 추적합니다.

> **에이전트 자동 로드 (루트):** [`../AGENTS.md`](../AGENTS.md) — 면책·WebP·T3 P0-only **영구 고정** (2026-05-25, AG Tier 2.5)

## 현재 상태 (2026-05-27)

| 영역 | 상태 |
|------|------|
| Phase 0–3 (trust infra + Cursor verify) | **완료** on `main` |
| Footnotes Wave A/B/C (36 posts `citeSources`) | **완료** — [`GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md`](./GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md) |
| CI batch | **35/35** (`SKIP_TRUST_VERIFY=1`) |
| T3 network | **P0-only** — [`fact-audit/T3_POLICY.md`](./fact-audit/T3_POLICY.md) |
| P0 URL spot | **12/12** — [`fact-audit/P0_URL_SPOT_CHECKS.md`](./fact-audit/P0_URL_SPOT_CHECKS.md) |
| 면책 | 상단 `PostDisclaimer` only |
| 다이어그램 | WebP in `diagrams/` — [`CHARTS_AND_VISUALS.md`](./CHARTS_AND_VISUALS.md) |
| **다음 작업** | [`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md) (GSC → AdSense → monetization) |
| **세션 갈무리** | [`GSF_BLOG_SESSION_ARCHIVE_20260525.md`](./GSF_BLOG_SESSION_ARCHIVE_20260525.md) |

## Phase history

| Phase | 담당 | 상태 | 산출 |
|-------|------|------|------|
| 0 | Cursor | **완료** | 게이트, CI, 로드맵 |
| 1–2 | AG + Cursor | **완료** | fact sheets, content fixes — [`fact-audit/CURSOR_PHASE2_REPORT.md`](./fact-audit/CURSOR_PHASE2_REPORT.md) |
| 3 | Cursor | **완료** | parity 35/35, P0 T3, INDEX — [`fact-audit/CURSOR_PHASE3_REPORT.md`](./fact-audit/CURSOR_PHASE3_REPORT.md) |
| 4+ | 사용자 | **순차** | [`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md) |

## P0–P4 상태 보드

| ID | 우선 | 상태 | 링크 |
|----|------|------|------|
| P0-1 | P0 | **완료** | AG 2.5b + Cursor verify on `main` |
| P0-2 | P0 | **완료** | Phase 3 + [`T3_POLICY.md`](./fact-audit/T3_POLICY.md) |
| P0-3 | P0 | **완료** | `pnpm trust:update-index` |
| P0-4 | P0 | **완료** | `main` merge / deploy |
| P1-* | P1 | **완료** | CI workflows, trust scripts |
| P2-* | P2 | **완료** | locale gates, tiering, runbook |
| P3-* | P3 | **완료** | modDatetime, source-links, KPI |

## 역할 분담

| 작업 | AG | Cursor | 사용자 |
|------|-----|--------|--------|
| KO/EN/JA 초안 | ✓ | | |
| fact sheet Claims (body + P0) | ✓ | 검토 | |
| `pnpm validate:batch` | | ✓ | |
| P0 T3 spot / per-slug deep T3 | | ✓ | |
| GSC · AdSense · affiliate | | | ✓ |
| git commit / deploy | | | 명시 시만 |

## 명령어 치트시트

```bash
# 일상 CI (canonical)
SKIP_VALIDATE_BUILD=1 SKIP_TRUST_VERIFY=1 pnpm validate:batch

# INDEX validate 열 갱신
pnpm trust:update-index

# 신규/수정 slug
pnpm trust:parity <slug>
SKIP_TRUST_VERIFY=1 pnpm validate:post <slug>

# P0 네트워크 스팟 (12 slug)
node scripts/p0-spot-verify.mjs

# (선택) 단일 slug deep T3
pnpm trust:verify-sources <slug>

# 다이어그램
pnpm diagrams:sanitize && pnpm diagrams:render
pnpm verify:diagram-posts
```

## Trust 게이트 정책 (확정)

- **T3 batch fetch:** **off** in CI — [`T3_POLICY.md`](./fact-audit/T3_POLICY.md)
- **UNCERTAIN** when trust on: hard block until resolved
- 시트 `mlit.go.jp/` 홈만 URL → `trust-tier1-url-specificity` FAIL
- human `Verified [x]` 행은 T3 스킵
- **면책:** `PostDetails` 상단 `PostDisclaimer` — markdown footer 없음

## 신규 글 Definition of Done

1. `docs/fact-audit/<slug>.md` — **본문·P0** Claims, 구체 URL
2. `pnpm trust:parity <slug>` exit 0
3. `SKIP_TRUST_VERIFY=1 pnpm validate:post <slug>` exit 0
4. P0급 수치 추가 시: P0 spot 표 갱신 또는 `trust:verify-sources` 해당 claim
5. `category` + 상단 면책 (`investment` / `safety` / `general`)
6. 다이어그램 있으면 WebP 경로 + `diagrams:render`

## 핸드오프 문구 (2026-05-25+)

| 상황 | 문구 |
|------|------|
| Trust 완료 | 「Trust CI 35/35 · T3 P0-only 고정 · 배포 OK」 |
| 다음 | 「[`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md) 1번 GSC부터」 |

## 관련 문서

| 문서 | 역할 |
|------|------|
| [`fact-audit/T3_POLICY.md`](./fact-audit/T3_POLICY.md) | **T3 정책 (필독)** |
| [`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md) | GSC · AdSense · 수익화 순서 |
| [`BLOG_AG_CURSOR_WORKFLOW.md`](./BLOG_AG_CURSOR_WORKFLOW.md) | AG/Cursor 파이프라인 |
| [`BLOG_FACT_CHECK_WORKFLOW.md`](./BLOG_FACT_CHECK_WORKFLOW.md) | 팩트 시트·스팟 |
| [`fact-audit/README.md`](./fact-audit/README.md) | 시트 라이프사이클 |
| [`fact-audit/INDEX.md`](./fact-audit/INDEX.md) | slug 대시보드 |
| [`DIAGRAM_POST_SMOKE_CHECKLIST.md`](./DIAGRAM_POST_SMOKE_CHECKLIST.md) | WebP 스모크 |
| [`MERGE_READINESS.md`](./MERGE_READINESS.md) | merge 기록 (완료) |

## 자동화 기대치 (요약)

| Tier | 내용 | 무인 자동 |
|------|------|-----------|
| T0 | 형식·면책·톤 | ~95% |
| T1 | 시트 coverage | ~85–90% |
| T2 | locale parity | ~80–90% |
| T3 | URL 숫자 (전 행) | **미목표** — P0 spot만 수동·스크립트 |
| T4 | 맥락·최신성 | 사람 필수 |

**목표:** CI PASS = 발행 가능. P0 claim + parity = 신뢰 신호. 전 시트 T3 = backlog 아님.
