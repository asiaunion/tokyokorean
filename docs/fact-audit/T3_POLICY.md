# T3 source verification policy (fixed)

> **Status:** **Fixed 2026-05-25** — production and CI use **P0-only** network T3, not row-by-row verification of every Claims row.

## What we verify

| Layer | Scope | How |
|-------|--------|-----|
| **T0** | Format, tone, disclaimer layout | `validationGates` (batch default) |
| **T1** | Fact sheet coverage vs KO extract | `pnpm trust:extract` / parity scripts |
| **T2** | KO / EN / JA numeric parity | `pnpm trust:parity` |
| **T3 (P0)** | Primary tier-1 URLs for **P0 slugs** | [`P0_URL_SPOT_CHECKS.md`](./P0_URL_SPOT_CHECKS.md) · `node scripts/p0-spot-verify.mjs` (**12/12**) |
| **T3 (optional)** | Single slug deep check | `pnpm trust:verify-sources <slug>` when editing that post |

## What we do *not* pursue

- **Batch `SKIP_TRUST_VERIFY=0` → 35/35** with every auto-extracted Claims row fetched and `[x]`’d.
- Treating **24/35** or **525 unverified rows** as a merge or deploy blocker.

Those rows were deferred by design; see historical note in [`T3_DEFERRED_11_SLUGS.md`](./T3_DEFERRED_11_SLUGS.md).

## CI and daily commands (canonical)

```bash
# Default — same as Vercel pre-release habit
SKIP_VALIDATE_BUILD=1 SKIP_TRUST_VERIFY=1 pnpm validate:batch

# Parity + coverage without HTTP
TRUST_SKIP_SOURCE_FETCH=1 npx tsx scripts/cursor-phase3-verify-all.mjs

# P0 network spot (12 slugs)
node scripts/p0-spot-verify.mjs

# Diagram assets after SVG edit
pnpm diagrams:sanitize && pnpm diagrams:render
pnpm verify:diagram-posts
```

**Do not** run `SKIP_TRUST_VERIFY=0` batch expecting 35/35 unless you are explicitly experimenting with policy change C (gate rewrite).

## New post bar

1. Fact sheet: **body claims** + **specific** tier-1 URLs (no homepage-only `[x]`).
2. `pnpm trust:parity <slug>` exit 0.
3. `SKIP_TRUST_VERIFY=1 pnpm validate:post <slug>` exit 0 for merge.
4. If slug is **P0** or adds a new primary statistic: add one row to P0 spot table or run `pnpm trust:verify-sources <slug>` for that claim.
5. Top **`PostDisclaimer`** via `PostDetails` (no markdown footer disclaimer).

## Optional deep T3 (per slug)

```bash
pnpm trust:verify-sources <slug>
# Fix FAIL/UNCERTAIN rows you care about; ignore noise rows (duplicate years, etc.)
```

## Related

- [`../BLOG_TRUST_AND_QUALITY_ROADMAP.md`](../BLOG_TRUST_AND_QUALITY_ROADMAP.md)
- [`../NEXT_WORK_QUEUE.md`](../NEXT_WORK_QUEUE.md) — GSC, AdSense, monetization (sequential)
- [`CURSOR_PHASE3_REPORT.md`](./CURSOR_PHASE3_REPORT.md)
