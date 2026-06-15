# T3 full fetch — historical note (11 slugs)

> **Superseded by:** [`T3_POLICY.md`](./T3_POLICY.md) (**P0-only**, fixed 2026-05-25).  
> This file is **archive only** — not an open backlog.

## Summary

Batch `SKIP_TRUST_VERIFY=0` once measured **24/35 PASS** because 11 slugs had hundreds of unverified Claims rows (`[ ]`) against shared tier-1 URLs. **P0 spot checks (12/12)** already passed for primary claims on those slugs.

**Decision:** Do not row-by-row T3 for all sheet rows. CI stays `SKIP_TRUST_VERIFY=1`.

## Archived slug list

| slug | Approx. unverified rows (2026-05-25) |
|------|-------------------------------------|
| `ginza-marunouchi-walk-dna` | alignment noise |
| `japan-corporate-vs-personal-rental-after-tax-sketch` | ~40 |
| `japan-visa-paths-permanent-business-manager-asset-holders` | ~27 |
| `nihonbashi-hamacho-walking-guide` | ~51 |
| `tokyo-6-wards-real-estate-insight` | ~25 |
| `tokyo-korean-community-beyond-shinokubo` | ~10 |
| `tokyo-mansion-tsubo-chiyoda-chuo-minato` | ~55 |
| `tokyo-real-estate-investment-complete-guide` | ~50 |
| `tokyo-shinjuku-shibuya-bunkyo` | ~155 |
| `tokyo-ward-guide-series-prologue` | ~40 |
| `weak-yen-korean-japan-asset-allocation-fx-scenarios` | ~32 |

## If policy ever changes

See [`T3_POLICY.md`](./T3_POLICY.md) § optional deep T3 or gate change (product decision in `trustGates.ts`).
