# Merge readiness — `feat/fact-audit-wave-a` → `main`

> **Status:** **Completed** — trust wave merged and deployed on `main` (2026-05-25+).  
> **Ongoing ops:** [`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md) · [`fact-audit/T3_POLICY.md`](./fact-audit/T3_POLICY.md)

## Historical pre-merge checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Format gates 35/35 | `SKIP_TRUST_VERIFY=1 pnpm validate:batch` |
| 2 | Production build | `pnpm run build` |
| 3 | INDEX synced | `pnpm trust:update-index` |
| 4 | P0 URL spot | [`fact-audit/P0_URL_SPOT_CHECKS.md`](./fact-audit/P0_URL_SPOT_CHECKS.md) 12/12 |

## Post-merge maintenance

```bash
SKIP_VALIDATE_BUILD=1 SKIP_TRUST_VERIFY=1 pnpm validate:batch
pnpm trust:update-index    # after fact sheet edits
node scripts/p0-spot-verify.mjs   # after P0 claim URL changes
pnpm verify:diagram-posts  # after diagram SVG edits
```

Do **not** treat `SKIP_TRUST_VERIFY=0` batch failures as regressions — see T3 policy.
