# GSF-Blog Wave C footnotes — Antigravity knowledge capsule

**Load when:** editing GSF-Blog posts, footnotes, or trust workflow.

## Facts (2026-05-27)

- **Wave A / B / C** numbered-footnote rollout is **complete** on `main` (`5f3a9b7`).
- **No Wave D.** Further footnotes only on **new** posts (same pilot pattern).
- **36/36** KO posts have `citeSources`; each slug has matching `ko/en/ja` paths.
- **AG:** draft + `citeSources` + 4–6 `<sup class="source-ref">` per post.
- **Cursor:** `SKIP_TRUST_VERIFY=1 pnpm validate:post <slug>`.
- **User:** commit/deploy unless explicitly delegated.

## Non-negotiable (do not regress)

- No `## 면책` / footer disclaimer in `.md` → `PostDisclaimer` + `postDisclaimer.ts`.
- No `.svg` in post body → `diagrams/*.webp` only.
- No full-sheet T3 / `SKIP_TRUST_VERIFY=0` batch 35/35 goal.

## SSOT docs

- `docs/GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md`
- `docs/FOOTNOTE_ROLLOUT_WAVE_C_AG.md` (archive + rules)
- `docs/fact-audit/T3_POLICY.md`
- `docs/NEXT_WORK_QUEUE.md` (next: GSC → AdSense)
