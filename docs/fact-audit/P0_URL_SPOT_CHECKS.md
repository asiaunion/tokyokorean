# P0 URL spot checks (Cursor Phase 3)

> Open tier-1 URL in browser; confirm **one claim value** on page. Record in `docs/fact-audit/<slug>.md` Claims row.

| slug | Priority | Sample claim | Tier-1 URL | Spot ✓ | Date | Verifier |
|------|----------|--------------|------------|--------|------|----------|
| `coredo-nihonbashi-mitsui-redevelopment` | P0 | 1673년 | https://www.mitsuifudosan.co.jp/english/business/development/nihonbashi/history.html | [x] | 2026-05-25 | Cursor T3 PASS |
| `ginza-marunouchi-walk-dna` | P0 | 44,400,000 | https://www.reinfolib.mlit.go.jp/landPrices_/realEstateAppraisalReport/2025/13/2025131020529.html | [x] | 2026-05-25 | Cursor T3 PASS |
| `japan-corporate-vs-personal-rental-after-tax-sketch` | P0 | 30% | https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3211.htm | [x] | 2026-05-25 | Cursor T3 PASS |
| `japan-visa-paths-permanent-business-manager-asset-holders` | P0 | 3,000만 엔 | https://www.moj.go.jp/isa/applications/resources/10_00237.html | [x] | 2026-05-25 | Cursor T3 PASS |
| `nihonbashi-hamacho-walking-guide` | P0 | 1760년 | https://ja.wikipedia.org/wiki/%E7%8E%89%E3%81%B2%E3%81%A7 | [x] | 2026-05-25 | Cursor T3 PASS |
| `tokyo-6-wards-real-estate-insight` | P0 | 34.6% | https://www.kantei.ne.jp/wp-content/uploads/c2025.pdf | [x] | 2026-05-25 | Cursor T3 PASS (PDF text) |
| `tokyo-korean-community-beyond-shinokubo` | P0 | 2026년 | https://www.mindan.org/index.php?bid=news&cate=news | [x] | 2026-05-25 | Cursor T3 PASS |
| `tokyo-mansion-tsubo-chiyoda-chuo-minato` | P0 | 2025년 | https://www.fudousankeizai.co.jp/topSiteNews?check=1 | [x] | 2026-05-25 | Cursor T3 PASS |
| `tokyo-real-estate-investment-complete-guide` | P0 | 1.4% | https://www.tax.metro.tokyo.lg.jp/kazei/real_estate/kotei_tosi | [x] | 2026-05-25 | Cursor T3 PASS |
| `tokyo-real-estate-investment-complete-guide` | P0 | 9,200만 / 140만 | https://www.reins.or.jp/pdf/trend/mw/mw_202604_summary.pdf | [x] | 2026-05-26 | Cursor PDF (mw_202604) |
| `tokyo-real-estate-investment-complete-guide` | P0 | 7.5% | https://www.mlit.go.jp/report/press/content/001970012.pdf | [x] | 2026-05-26 | Cursor PDF (foreign buyer); press HTML `..._00237.html` |
| `tokyo-real-estate-investment-complete-guide` | P0 | 2.22% | https://www.e-miki.com/rent/assets/market/tokyo.xlsx | [x] | 2026-05-26 | Cursor XLSX (tokyo market) |
| `tokyo-shinjuku-shibuya-bunkyo` | P0 | 231,402 | https://www.city.shibuya.tokyo.jp/kusei/tokei_shibuya/jinko/jumin_toroku.html | [x] | 2026-05-25 | Cursor T3 PASS |
| `tokyo-ward-guide-series-prologue` | P0 | 2025년 | https://www.stat.go.jp/data/idou/rireki/2501/index.html | [x] | 2026-05-25 | Cursor T3 PASS |
| `weak-yen-korean-japan-asset-allocation-fx-scenarios` | P0 | 2026년 | https://www.boj.or.jp/en/about/release_2026/index.htm | [x] | 2026-05-25 | Cursor T3 PASS |

**Cursor 2026-05-25:** `node scripts/p0-spot-verify.mjs` — **12/12** network PASS after deep-link fixes, fact-sheet URL repair, and PDF tier-1 extraction (`pdfjs-dist`).

**Commands (re-run):**

```bash
node scripts/sanitize-fact-sheet-urls.mjs
node scripts/repair-fact-sheet-markdown-links.mjs
node scripts/fix-doubled-urls.mjs
node scripts/p0-url-fixes.mjs
rm -rf .cache/source-verify
node scripts/p0-spot-verify.mjs
```
