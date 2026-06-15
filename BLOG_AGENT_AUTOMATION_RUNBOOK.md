# Blog Agent Automation Runbook

> **Hybrid workflow (default)**: **AG** writes; **Cursor** runs `pnpm validate:post` before git/deploy.  
> Handoff: tell Cursor 「slug … 검증 부탁」 after ko/en/ja md are in repo (same slug, three folders).  
> See [`docs/BLOG_AG_CURSOR_WORKFLOW.md`](docs/BLOG_AG_CURSOR_WORKFLOW.md) § Quick reference.  
> **Trust roadmap:** [`docs/BLOG_TRUST_AND_QUALITY_ROADMAP.md`](docs/BLOG_TRUST_AND_QUALITY_ROADMAP.md). Telegram is **optional (legacy)**.

## Endpoint
- `POST /api/blog-agent/workflow`

## Workflow actions
1. `start`  
   - body: `{ "action":"start", "keyword":"..." }`
2. `approve` (gate별 승인 토큰 필요)
   - body: `{ "action":"approve","workflowId":"...","gate":"research","token":"approval-12345678" }`
3. `memo`
   - body: `{ "action":"memo","workflowId":"...","memo":"..." }`
4. `draft_v1`
5. `ko_final` (optional `extraSearchNotes`)
6. `translate`
7. `prepare_publish` (dry-run diff 생성)
8. `approve` with `gate: "publish"`
9. `apply_publish`
10. `sync_ko_draft`
   - body: `{ "action":"sync_ko_draft","workflowId":"...","koMarkdown":"..." }`
11. `sync_translations`
   - body: `{ "action":"sync_translations","workflowId":"...","enMarkdown":"...","jaMarkdown":"..." }`

## Notes
- 상태 파일은 `.blog-agent-workflows/`에 JSON으로 저장됩니다.
- publish staging은 `.blog-agent-stage/`를 사용합니다.
- 생성 파일 경로: `src/data/blog/{ko,en,ja}/{slug}.md`
- 검증: `references ⊆ sources`, `npm run build` 성공 시에만 publish 적용.
- 애드센스 품질 게이트:
  - KO 본문 외부 링크 수 20개 이하
  - 단정/보장형 표현 패턴 차단
  - EN/JA 번역본 유사도 과도 시 차단
  - KO 본문 분량 **1200~4000** 한글 글자수 (면책 섹션 `## 면책 및 이용 안내` 제외 — `validationGates.ts` `ko-length-target`)
  - KO/JA 공손체 문장 종결 점검
  - 제목-본문 핵심 토큰 정합성 점검
  - 하드 게이트 미충족 시 즉시 발행 차단

## Telegram commands (GSF-Research) — legacy, optional

> **Current ops**: Blog work does **not** require Telegram. Use AG + repo md files + Cursor `validate:post` + git deploy.  
> Below commands remain for GSF-Research bot if you re-enable it. `/blog_publish` ≈ API `apply_publish` (writes md after validation).

- `/blog_help`
- `/blog_start <키워드>`
- `/blog_memo <메모>`
- `/blog_run <draft_v1|ko_final|translate|prepare_publish|apply_publish>`
- `/blog_approve <research|draft_v1|ko_final|translations|publish>`
- `/blog_preview`
- `/blog_auto_next [ko_final 단계에서 optional 추가검색메모]`
- `/blog_status`
- `/blog_cancel`
- `/blog_start_flow <키워드>` (리서치+KO v1 생성 후 Google Docs 초안 생성)
- `/blog_sync` (Docs 본문 -> KO markdown 동기화)
- `/blog_translate` (KO 승인 + EN/JA 생성 + 번역 Docs 생성)
- `/blog_publish` (EN/JA Docs 반영 + 발행 준비/승인/적용)
- 구버전 별칭도 당분간 동작: `/blog_start_docs`, `/blog_sync_docs`, `/blog_translate_docs`, `/blog_publish_docs`

## Docs session mapping
- 파일: `GSF-Research/.blog_workflow_sessions.json`
- 저장 구조(채팅 단위):
  - `workflow_id`
  - `docs.ko_doc_id`, `docs.ko_doc_url`
  - `docs.en_doc_id`, `docs.en_doc_url`
  - `docs.ja_doc_id`, `docs.ja_doc_url`

## Per-post operations (cadence: ~3 posts/week, no fixed weekdays)

Each post, in order:

1. **AG**: research → KO (→ EN/JA) → save to `src/data/blog/{ko,en,ja}/<slug>.md` (or Docs then export)
2. **Cursor**: fact sheet → `pnpm validate:post <slug>` → exit 0
3. **You**: git commit + deploy

Cross-cutting (any time): [`SEO_JA_CLUSTER_FOCUS.md`](docs/SEO_JA_CLUSTER_FOCUS.md), [`EDITORIAL_TOPIC_POLICY.md`](docs/EDITORIAL_TOPIC_POLICY.md), [`WEEKLY_KPI_REVIEW.md`](docs/WEEKLY_KPI_REVIEW.md) when convenient.

## Pilot metrics (3 posts/week)
- 목표 운영량: 주 3편(월/수/금)
- 핵심 지표:
  - 하드 게이트 통과율: 100% (미충족 발행 0건)
  - 1차 발행 성공률: 70% 이상
  - 재작업률: 30% 이하
  - 평균 보완 횟수: 1.5회 이하/포스트
- 주간 기록 포맷:
  - `week`: YYYY-WW
  - `attempted_posts`: 3
  - `published_posts`: n
  - `failed_hard_gates`: [gate names]
  - `avg_iterations_to_publish`: x.x
  - `notes`: 다음 주 개선 액션

## Gate failure remediation
- `pnpm validate:post` 또는 API `apply_publish` 실패 시 JSON `failed` 배열 확인.
- 우선 조치 순서:
  1) references/sources 무결성
  2) 분량(1200~4000, 면책 제외) 및 제목 정합성
  2b) trust: `pnpm trust:extract` / `trust:parity` / `trust:verify-sources` (see roadmap)
  3) tier source(정부/공공/언론) 보강
  4) 단정형 표현 및 면책문구

## LLM KO writer quick setup (Anthropic/OpenAI/Gemini)
1. `apps/blog-agent/.env.llm.example`를 참고해 실제 `.env`(또는 운영 env)에 변수 설정
2. 최소 필수:
   - `BLOG_KO_WRITER_PROVIDER=anthropic|openai|gemini`
   - `BLOG_KO_WRITER_MODEL=<사용 모델>`
   - 각 provider API key (`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY`)
3. 안전장치:
   - API 실패/타임아웃 시 자동으로 기존 템플릿 생성기로 fallback
   - 기존 하드 게이트/점수 게이트는 동일 적용
4. 점검:
   - `draft_v1`, `ko_final` 출력의 `llmMeta.used=true`면 LLM 본문 적용 성공
   - `llmMeta.fallbackReason` 존재 시 fallback 사유 확인
5. 권장 초기 운영:
   - provider: `anthropic`
   - 실패 시 별도 조치 없이 fallback 허용
   - 주 3편 운영 후 점수/재생성률/비용 기준으로 모델 재선정

## One-pass validation scenario (first production check)
1. 사전 준비
   - `BLOG_KO_WRITER_PROVIDER=anthropic`
   - `BLOG_KO_WRITER_MODEL=claude-3-5-sonnet-latest`
   - `ANTHROPIC_API_KEY` 설정
   - 봇/앱 재시작
2. 테스트 입력 (AG or legacy Telegram)
   - Start workflow / write KO in Docs or repo
   - `pnpm validate:post <slug>` in Cursor
   - git commit + deploy (or Telegram `블로그 발행` if bot enabled)
3. 합격 기준
   - `llmMeta.used=true` 또는 fallback이어도 품질 점수 기준 통과
   - Joseph 점수 `>= BLOG_SCORE_THRESHOLD` (기본 80)
   - 하드 게이트 전부 통과
   - 최종 발행 완료 및 slug/targetPaths 생성
4. 실패 시 즉시 조치
   - `llmMeta.fallbackReason` 확인 (키/모델/네트워크 이슈 우선 점검)
   - 점수 미달 항목 기준으로 Docs 본문 보강 후 `블로그 동기화` 재실행
   - 월 예산 상한 도달 시 템플릿 수동 모드로 전환
5. 테스트 종료 기록(권장)
   - `keyword`, `score`, `llmMeta.used`, `fallbackReason`, `published 여부`, `actual_cost_usd`를 로그에 남김

## Pre-publish approval checklist (Cursor)

Full flow: [`docs/BLOG_AG_CURSOR_WORKFLOW.md`](docs/BLOG_AG_CURSOR_WORKFLOW.md) · Fact-check: [`docs/BLOG_FACT_CHECK_WORKFLOW.md`](docs/BLOG_FACT_CHECK_WORKFLOW.md) · Image Rules: [`BLOG_IMAGE_RULES_1PAGE.md`](BLOG_IMAGE_RULES_1PAGE.md) (상세: [`BLOG_IMAGE_INTENT_RULES.md`](BLOG_IMAGE_INTENT_RULES.md))

- [ ] KO 본문이 Docs에서 최종 확정되었는지 확인 (AG)
- [ ] `src/data/blog/{ko,en,ja}/<slug>.md` repo에 반영
- [ ] Fact sheet completed — all numbers/legal claims verified
- [ ] 이미지/에셋 작업이 [`BLOG_IMAGE_RULES_1PAGE.md`](BLOG_IMAGE_RULES_1PAGE.md) 규격(Option A 2장 구조, 중복 절대 금지, 약한 가우시안 블러로 실루엣 보존, 셀카/무관한 사진 제외)을 완수했는지 확인
- [ ] `docs/fact-audit/<slug>.md` Claims complete (trust coverage)
- [ ] `pnpm validate:post <slug>` exit **0** (hard gates + score + build; trust on for publish)
- [ ] Or format-only scan: `SKIP_TRUST_VERIFY=1 pnpm validate:post <slug>` during AG 2.5b
- [ ] Human skim: title, disclaimer, JA tone (5–10 min)
- [ ] Git commit + deploy (or legacy API `apply_publish` if using workflow API)
- [ ] Validate JSON 요약을 주간 KPI `notes`에 기록 (optional)

## Public preview link (mobile/external)
- Static preview server:
  - `python3 -m http.server 4343 --directory /Users/gsf/.gemini/antigravity/scratch/apps/blog-agent/public`
- Public tunnel:
  - `cloudflared tunnel --url http://localhost:4343 --no-autoupdate`
- Save tunnel URL to:
  - `/Users/gsf/.gemini/antigravity/scratch/GSF-Research/.preview_public_url`
- `/blog_preview` reads this URL file and sends external preview link.
