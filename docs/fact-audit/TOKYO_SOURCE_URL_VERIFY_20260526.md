# Tokyo headline source URL verification (Phase 0)

**Date:** 2026-05-26  
**Verifier:** Cursor (`node scripts/tokyo-source-url-spot.mjs` + manual HEAD)

## HTTP status

| ID | URL | Status | Notes |
|----|-----|--------|-------|
| MLIT press | `https://www.mlit.go.jp/report/press/tochi_fudousan_kensetsugyo05_hh_000001_00237.html` | 200 | Foreign-buyer survey (fixed AG typo `...2237` → `...237`) |
| MLIT PDF | `https://www.mlit.go.jp/report/press/content/001970012.pdf` | 200 | Contains 3.5%, 7.5%, 3.2% (pdfjs extract) |
| REINS Market Watch | `https://www.reins.or.jp/pdf/trend/mw/mw_202604_summary.pdf` | 200 | Contains 137, 140 (pdfjs extract) |
| Miki Tokyo monthly | `https://www.e-miki.com/rent/assets/market/tokyo.xlsx` | 200 | Contains **2.22** (xlsx sheet1) |
| Miki portal | `https://www.e-miki.com/rent/` | 200 | Portal; 2.22 not in static HTML |
| Miki market (legacy) | `https://www.e-miki.com/market/` | **404** | Do not use |
| Kantei c202604 | `https://www.kantei.ne.jp/wp-content/uploads/c202604.pdf` | 200 | Cluster / Chugoku mansion stats |
| Kantei c2025 | `https://www.kantei.ne.jp/wp-content/uploads/c2025.pdf` | 200 | Used in tokyo-6-wards |

## Broken / deprecated (do not link)

- `https://www.mlit.go.jp/en/` — homepage only  
- `https://www.e-miki.com/market/` — 404  
- `https://www.mlit.go.jp/report/press/totikensangyo02_*` — org path rot (404)

## Recommended primary URLs (pillar)

| Claim | Primary | Archive filename |
|-------|---------|------------------|
| 9,200만 / 140만 ㎡ | REINS `mw_202604_summary.pdf` | `reins-202604-marketwatch.pdf` |
| 3.5% / 7.5% / 3.2% | MLIT press + PDF | `mlit-202511-mansion-foreign-buyer.pdf` |
| 2.22% office vacancy | Miki `tokyo.xlsx` | `miki-202603-tokyo-office-market.xlsx` |
