# Blog workflow: Antigravity (write) + Cursor (pre-publish verify)

> **Start here (trust · phases · CI):** [`BLOG_TRUST_AND_QUALITY_ROADMAP.md`](./BLOG_TRUST_AND_QUALITY_ROADMAP.md)  
> **AG 컨텍스트:** 첫 세션 [`AG_CONTEXT_BOOTSTRAP_20260525.md`](./AG_CONTEXT_BOOTSTRAP_20260525.md) · 이후 [`AG_CONTEXT_BOOTSTRAP_SHORT.md`](./AG_CONTEXT_BOOTSTRAP_SHORT.md)

> **원칙**: 글 **작성·초안**은 **Antigravity (AG)**. **발행 직전 검증**은 **Cursor**에서 통과한 뒤 repo에 반영·배포.  
> **요일 고정 없음** · **Telegram 불필요** — 포스트 1편마다 아래 순서만 지키면 됨.

---

## Quick reference (운영 요약)

| 항목 | 내용 |
|------|------|
| **AG → Cursor 넘기기** | 초안·repo 반영 후 Cursor에 예: 「slug `…` — ko/en/ja 반영됨. 발행 전 검증 부탁」 |
| **같은 slug** | `ko/`, `en/`, `ja/` 아래 **파일명 동일** (예: `…/ko/foo.md`, `…/en/foo.md`, `…/ja/foo.md`) |
| **AG에 시킬 때** | slug 영문 kebab-case로 통일 → KO 작성 → EN/JA 번역 → 위 세 경로에 저장 |
| **Cursor 검증** | `pnpm validate:post <slug>` exit 0 |
| **발행** | 본인: git commit + deploy (`/blog_publish` 텔레그램은 legacy, [§ below](#what-was-blog_publish-telegram)) |
| **repo 루트 주의** | `src/data/blog/_integrity-example-*.md`, `_template-*.md` 는 예시/템플릿 — 실제 글은 **`ko/` `en/` `ja/` 안만** |

**폴더 구조 (확인됨)**:

```
src/data/blog/ko/<slug>.md
src/data/blog/en/<slug>.md
src/data/blog/ja/<slug>.md
```

---

## Responsibility split

| Phase | Owner | Typical tools |
|-------|--------|----------------|
| Research, KO draft, edit | **AG** | Antigravity, Google Docs, deploy-blog 스킬 등 |
| EN/JA (if not in AG) | **AG or pipeline** | 번역 스킬 / 기존 blog-agent |
| Fact sheet + spot-check | **You + Cursor** | [`BLOG_FACT_CHECK_WORKFLOW.md`](./BLOG_FACT_CHECK_WORKFLOW.md) |
| Automated gates + build | **Cursor** | `pnpm validate:post <slug>` |
| **Publish** | **You** (after validate) | `git commit` + Vercel deploy — see § Publish below |

**Do not** merge/deploy until `pnpm validate:post` exits `0`.

---

## Per-post pipeline (no fixed weekdays)

```
AG: 주제 → KO 원고 → (EN/JA) → repo md 반영
        ↓
Cursor: 팩트 시트 → pnpm validate:post <slug>
        ↓
You: git commit + deploy
```

발행 **빈도**는 [`EDITORIAL_TOPIC_POLICY.md`](./EDITORIAL_TOPIC_POLICY.md) / runbook 목표(예: 주 3회)를 참고하되, **월·수·금 같은 요일 매핑은 사용하지 않음**.

---

## Cursor pre-publish checklist

### 1. Markdown in repo

`src/data/blog/{ko,en,ja}/<slug>.md` 가 있어야 합니다.

- AG가 파일을 저장했거나, Docs 최종본을 Cursor/AG가 md로 넣었거나
- 스테이징만 있으면: `.blog-agent-stage/<slug>/` → `pnpm validate:post --stage <slug>`

### 2. Fact sheet

- [`docs/templates/blog-fact-sheet.md`](./templates/blog-fact-sheet.md)
- 숫자·법적 요건 → 티어1 URL + 사람 ✓

### 3. Automated validation

```bash
pnpm validate:post <slug>
```

Exit `0` = 하드 게이트 + 점수 + `npm run build` 통과.

### 4. Human skim (5–10 min)

제목, 면책, JA 톤, 투자 권유 없음.

### 5. Publish (current default — no Telegram)

[`§ What was `/blog_publish`?`](#what-was-blog_publish-telegram) 참고.

1. `pnpm validate:post <slug>` 가 이미 **0**
2. `git add` / `commit` the three locale files
3. Deploy (예: `pnpm run build` + Vercel, or your existing deploy script)

Telegram / GSF-Research 봇은 **현재 운영에서 필수 아님** (legacy).

---

## What was `/blog_publish`? (Telegram)

과거 **GSF-Research Telegram 봇**이 호출하던 명령으로, 내부적으로는 blog-agent API의 **`apply_publish`** 와 같은 역할이었습니다.

| 단계 | 의미 |
|------|------|
| Docs/워크플로에서 KO·EN·JA 확정 | 번역·동기화 |
| `prepare_publish` | slug·경로 dry-run |
| `apply_publish` | `runBlogValidation` 후 `src/data/blog/{ko,en,ja}/<slug>.md` 에 기록 |

**지금 Telegram을 쓰지 않는다면** → AG가 md를 repo에 두고, Cursor에서 `pnpm validate:post` 한 뒤 **git으로 발행**하면 됩니다. 검증 로직은 동일합니다 (`validationGates.ts`).

선택: 예전처럼 API만 쓰려면 `POST /api/blog-agent/workflow` + `action: "apply_publish"` ([`BLOG_AGENT_AUTOMATION_RUNBOOK.md`](../BLOG_AGENT_AUTOMATION_RUNBOOK.md)) — 워크플로 JSON(`.blog-agent-workflows/`)이 있을 때만.

---

## What Cursor validation runs

[`src/lib/validation/validationGates.ts`](../src/lib/validation/validationGates.ts) — sources, tier, KO length/tone, disclaimers, build.

실패 시 수정 순서: runbook § Gate failure remediation.

---

## Handoff notes for Cursor agent

“발행 전 검증해줘”일 때:

1. `slug` + `src/data/blog/` 경로 확인
2. 팩트 시트 템플릿 안내
3. `pnpm validate:post <slug>` → 0 될 때까지 md 수정
4. **사용자가 요청할 때만** commit/deploy
5. Telegram 언급하지 말 것 — publish는 git/deploy

Rule: [`.cursor/rules/blog-pre-publish.mdc`](../.cursor/rules/blog-pre-publish.mdc)

---

## Batch fact-check loop (35 published posts)

| Phase | Owner | Prompt doc | md edit? |
|-------|--------|------------|----------|
| 1차 감사 | **AG** | [`AG_BATCH_FACT_CHECK_PROMPT.md`](./AG_BATCH_FACT_CHECK_PROMPT.md) | No — `docs/fact-audit/` only |
| 2차 게이트·일괄 수정 | **Cursor** | [`fact-audit/CURSOR_PHASE2_REPORT.md`](./fact-audit/CURSOR_PHASE2_REPORT.md) | Yes |
| 2.5 클레임·번역 수정 | **AG** | [`AG_PHASE2_CONTENT_FIX_PROMPT.md`](./AG_PHASE2_CONTENT_FIX_PROMPT.md) | Yes — per fact sheet |
| 3차 재검증 | **Cursor** | [`CURSOR_PHASE3_REVERIFY_PROMPT.md`](./CURSOR_PHASE3_REVERIFY_PROMPT.md) | Yes — minimal |
| Publish | **You** | — | `git commit` after validate 0 |

**Handoff lines**

- AG (Wave A 일부): **「팩트·번역 AG 수정 완료, Cursor 3차 재검증 대기」** — 6~7 slug만 해당
- AG (merge 전 전수): **「팩트·번역 AG 전량(35) 수정 완료, Cursor 3차 전수 재검증 대기」**
- Cursor → You: **「Cursor 3차 재검증 완료 — validate N/35, 커밋 대기」**

**merge 전 권장:** Wave A 잔여 5만보다 **35 전수 (Deep/Standard/Light)** AG → Cursor 3차가 안전. [`AG_PHASE2_CONTENT_FIX_PROMPT.md`](./AG_PHASE2_CONTENT_FIX_PROMPT.md) § 전체 35개 재작업.

---

## Related

- [`BLOG_AGENT_AUTOMATION_RUNBOOK.md`](../BLOG_AGENT_AUTOMATION_RUNBOOK.md)
- [`BLOG_FACT_CHECK_WORKFLOW.md`](./BLOG_FACT_CHECK_WORKFLOW.md)
- [`AG_PHASE2_CONTENT_FIX_PROMPT.md`](./AG_PHASE2_CONTENT_FIX_PROMPT.md)
- [`CURSOR_PHASE3_REVERIFY_PROMPT.md`](./CURSOR_PHASE3_REVERIFY_PROMPT.md)
