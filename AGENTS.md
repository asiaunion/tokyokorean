# GSF-Blog — Antigravity agent notes

**Canonical path:** `/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog`

## Image work (auto — no extra user command)

Before changing `public/assets/images/blog/**`, `ogImage`, or post images:

1. Read `BLOG_IMAGE_RULES_1PAGE.md` (Option A checklist)
2. Load Knowledge **`gsf_blog_image_option_a`** (or `BLOG_IMAGE_INTENT_RULES.md`)
3. Follow `.cursor/rules/blog-images-option-a.mdc` when editing matching files

Global rules: `~/.gemini/config/rules/agent_rules.md`

**Never:** auto-pick from Downloads, same file for hero and body, heavy mosaic, couple selfie as hero.

## Write vs verify

| Phase | Owner |
|-------|--------|
| Draft KO/EN/JA, assets | **AG** |
| `pnpm validate:post <slug>` | **Cursor** |
| git commit / deploy | **User** (unless explicitly asked) |

---

## ⚙️ GSF-Blog 고정 아키텍처 규칙 (SSOT) — 2026-05-25+

모든 에이전트는 예외 없이 아래의 확정 사양을 철저히 준수하여 작업해야 하며, 임의로 하위 정책(예: 레거시 면책 수동 삽입 등)으로 롤백하거나 수정하지 마십시오.

1. **하단 면책조항 원천 배제 (No footer disclaimer)**
   * 마크다운 본문(`.md`) 하단에 `## 면책 및 이용 안내`, `## Disclaimer`, `## 免責` 및 이탤릭 면책 조항을 절대로 삽입하거나 갱신하지 마십시오.
   * 면책은 `PostDetails.astro`에서 카테고리(`category: investment / safety / general`)에 매핑하여 상단 `PostDisclaimer`로 자동화 처리하며, SSOT 문구는 `src/lib/postDisclaimer.ts`에서 단일 관리됩니다.

2. **포스트 내 SVG 사용 금지 (No .svg in posts)**
   * 포스트 마크다운 내부에서 `.svg` 파일 링크나 인라인 `<svg>` 코드를 절대로 작성하지 마십시오.
   * 다이어그램과 차트는 오직 `scripts/` 파이프라인을 거쳐 빌드된 `/assets/images/blog/diagrams/*.webp` 파일만을 링크하여 사용해야 합니다.

3. **T3 P0-only 검증 (No full-sheet T3)**
   * 35개 전체 시트의 Claims를 fetch ON하고 전수 `[x]` 마킹을 완수하는 것은 비목표(deferred)입니다.
   * T3 검증은 오직 P0 12개 스팟에 대한 네트워크 스팟 체크(`node scripts/p0-spot-verify.mjs`)에 집중하며, 배치는 `SKIP_TRUST_VERIFY=1`로 수행하는 것이 canonical 표준 정책입니다.
   * 상세: [`docs/fact-audit/T3_POLICY.md`](docs/fact-audit/T3_POLICY.md) · 아카이브: [`docs/fact-audit/T3_DEFERRED_11_SLUGS.md`](docs/fact-audit/T3_DEFERRED_11_SLUGS.md)

**Diagram pipeline (after SVG edit):** `pnpm diagrams:sanitize` → `pnpm diagrams:render` → link `diagrams/*.webp` only. See [`docs/CHARTS_AND_VISUALS.md`](docs/CHARTS_AND_VISUALS.md) §8.

**Disclaimer categories:** `investment` | `safety` | `general` (maps `life` / `local` / `essay` in `src/lib/postDisclaimer.ts`).

---

**Trust roadmap:** [`docs/BLOG_TRUST_AND_QUALITY_ROADMAP.md`](docs/BLOG_TRUST_AND_QUALITY_ROADMAP.md)  
**Footnotes Wave A/B/C:** ✅ done — [`docs/GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md`](docs/GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md) (no Wave D)  
**Session archive:** [`docs/GSF_BLOG_SESSION_ARCHIVE_20260525.md`](docs/GSF_BLOG_SESSION_ARCHIVE_20260525.md)  
**AG bootstrap (copy-paste):** [`docs/AG_CONTEXT_BOOTSTRAP_SHORT.md`](docs/AG_CONTEXT_BOOTSTRAP_SHORT.md)  
**Workflow:** [`docs/BLOG_AG_CURSOR_WORKFLOW.md`](docs/BLOG_AG_CURSOR_WORKFLOW.md)

---

## 🚨 Astro 정적/동적 파일 충돌 방지 (2026-05-30+)

> **사고 경위**: `public/robots.txt`(Disallow 18개)가 `src/pages/robots.txt.ts`(prerender)에 의해 빌드 시 무경고로 덮어쓰기되어 7일간 크롤링 제어 미작동.

### 규칙

1. **`public/` 에 파일 추가 전** → `src/pages/`에 동명 라우트(`.ts`, `.js`, `.astro`)가 있는지 반드시 확인
2. **`src/pages/` 에 파일 추가 전** → `public/`에 동명 정적 파일이 있는지 반드시 확인
3. **충돌 발견 시** → 하나로 통합. 절대 양쪽에 공존시키지 않음
4. **빌드 자동 감지**: `npm run build` 시 `scripts/check-static-route-conflict.mjs`가 자동 실행되어 충돌 감지 → 빌드 실패 처리

### 보호 대상 파일 (충돌 시 치명적)

| 파일 | 위치 (정본) | 절대 만들면 안 되는 곳 |
|------|------------|---------------------|
| `ads.txt` | `public/ads.txt` | ❌ `src/pages/ads.txt.ts` |
| `robots.txt` | `src/pages/robots.txt.ts` | ❌ `public/robots.txt` |
| Google 인증 HTML | `public/google*.html` | ❌ `src/pages/google*.astro` |

---

## 📋 Notion CMS 파이프라인 (2026-05-31+)

### 경로 구조

```
입력 경로 A (Notion UI):
  Notion 작성 → status: "발행요청"
  → CF Worker (1분 cron, workers/notion-poller/)
  → GitHub Actions (.github/workflows/notion-publish.yml)
  → notion-to-md.ts 변환 → .blog-agent-stage/{slug}.ko.md
  → Voice Rewrite (조건부) → EN/JA 번역
  → feature branch (notion/publish-{slug})
  → Vercel Preview URL → Notion 기록
  → status: "발행승인" → PR merge → 라이브

입력 경로 B (AG 대화에서 Notion 포스트 배포):
  deploy-from-notion 스킬 사용

역동기화:
  main push (KO 변경) → .github/workflows/notion-sync.yml
  → sync-git-to-notion.ts → SHA Conflict Detection → Notion 업데이트
```

### 역할 분리 규약

| 기능 | Admin CMS (Milkdown) | Notion 파이프라인 |
|---|---|---|
| 새 포스트 작성 | ✅ | ✅ |
| Voice Rewrite | ❌ (수동) | ✅ (자동, checkbox로 skip 가능) |
| EN/JA 번역 | ✅ (수동) | ✅ (자동) |
| 이미지 업로드 | ✅ (Vercel Blob) | ✅ (Vercel Blob 자동) |
| Turso DB | ✅ (상태 관리) | ❌ |
| Preview URL | ❌ | ✅ (자동 Vercel) |

> ⚠️ **동시 편집 금지**: 같은 slug를 Admin CMS + Notion에서 동시에 편집하지 않는다.
> SHA Conflict Detection이 감지하지만, 운영 규약으로도 반드시 준수.

### Conflict Detection 발생 시 처리 절차

1. Notion 페이지에 ⚠️ 코멘트가 자동 생성됨
2. Git KO 파일과 Notion 페이지 본문을 수동 비교
3. 최신 내용 결정 후 Git에 반영 (Git이 Source of Truth)
4. Notion 페이지의 `gitSha` property를 현재 commit SHA로 수동 업데이트
5. 재동기화는 해당 파일에 공백 변경 후 push하면 `notion-sync.yml`이 재실행됨

### 핵심 파일

| 파일 | 역할 |
|---|---|
| `scripts/notion-to-md.ts` | Notion → MD 변환 공통 유틸 |
| `scripts/notion-bootstrap.ts` | 초기 38개 포스트 일괄 등록 (1회성) |
| `scripts/sync-git-to-notion.ts` | 역동기화 + SHA Conflict Detection |
| `scripts/notion-page-map.json` | slug ↔ Notion Page ID 매핑 (git tracked) |
| `workers/notion-poller/` | CF Worker cron + workflow_dispatch |
| `.blog-agent-stage/` | 변환 중간 파일 임시 저장 (gitignore) |
| `.github/workflows/notion-publish.yml` | 발행 파이프라인 |
| `.github/workflows/notion-sync.yml` | 역동기화 트리거 |
| `blueprint-notion-cms.md` | 전체 아키텍처 설계서 |
