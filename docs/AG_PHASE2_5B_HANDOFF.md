# AG Phase 2.5b handoff (35 slugs)

> **Todo:** User/AG runs full Wave per [`AG_PHASE2_CONTENT_FIX_PROMPT.md`](./AG_PHASE2_CONTENT_FIX_PROMPT.md).  
> Cursor does **not** commit; completes Phase 3 after AG signals done.

## Start phrase (AG → Cursor)

When all 35 slugs are updated:

**「팩트·번역 AG 전량(35) 수정 완료, Cursor 3차 전수 재검증 대기」**

## AG checklist (per slug)

- [ ] `docs/fact-audit/<slug>.md` Claims: every KO numeric has a row
- [ ] Tier-1 URL is **specific page** (not `mlit.go.jp/` homepage only)
- [ ] `Verified ✓` only after URL opened OR claim softened/removed
- [ ] ko/en/ja numeric parity (same units: 엔/円, not 원/엔 drift)
- [ ] EN: I not We (investment/T1); JA: です・ます, no hangul in body
- [ ] Standard disclaimer block in ko/en/ja
- [ ] Append row to `docs/fact-audit/AG_PHASE2_FIX_REPORT.md` Wave 2.5b

## Waves (from INDEX priority)

| Wave | Slugs | Depth |
|------|-------|-------|
| A | P0 rows in INDEX | Deep — URL + parity |
| B | P1 Standard (4) | EN I, JA tone |
| C | P2 Light (~19) | Disclaimer + drift |

## Forbidden

- Bulk `[x]` on Claims without opening URL
- `mlit.go.jp/` homepage as sole source for a number

## Cursor follow-up

[`CURSOR_PHASE3_REVERIFY_PROMPT.md`](./CURSOR_PHASE3_REVERIFY_PROMPT.md)
