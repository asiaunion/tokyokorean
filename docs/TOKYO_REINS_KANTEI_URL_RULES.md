# Tokyo market stats — REINS / Kantei / Miki URL rules

Editorial rules for the Tokyo real-estate **content cluster** (pillar + ward / tsubo / office posts).

## REINS (成約・Market Watch)

| Use case | Link type | Example |
|----------|-----------|---------|
| Monthly 23-ward contract price / ㎡ unit | **Direct PDF** (changes each month) | `https://www.reins.or.jp/pdf/trend/mw/mw_YYYYMM_summary.pdf` |
| Fallback when PDF rot | Archive under `/assets/sources/reins-YYYYMM-marketwatch.pdf` | Same month as prose `as of` |
| Generic “check REINS” | Data top page (not homepage root only) | `https://www.reins.or.jp/reins/market/` |

**Do not** link bare `https://www.reins.or.jp/` when the sentence cites a **specific month’s** figure.

## Tokyo Kantei (東京カンテイ)

| Use case | Link type | Example |
|----------|-----------|---------|
| Chukomansion 70㎡ index (annual / monthly) | **Direct PDF** | `https://www.kantei.ne.jp/wp-content/uploads/c2025.pdf` (year in filename) |
| Newer month | `c202604.pdf` etc. — verify HTTP 200 before publish | |
| Archive | `/assets/sources/kantei-2025-chukomansion.pdf` | When post cites 2025 full-year stats |

**Do not** use broken paths like `c2025.pdfasia/japan/price-history` (typo in legacy frontmatter).

## Miki Shoji (三鬼商事 / e-miki)

| Use case | Link type | Example |
|----------|-----------|---------|
| 5-ward office vacancy / rent | **Tokyo XLSX** | `https://www.e-miki.com/rent/assets/market/tokyo.xlsx` |
| Portal | `https://www.e-miki.com/rent/` | |
| Archive | `/assets/sources/miki-YYYYMM-tokyo-office-market.xlsx` | |

**Do not** use `https://www.e-miki.com/market/` — returns **404** (2026-05-26).

## MLIT (foreign-buyer share, land price)

- Press HTML: `https://www.mlit.go.jp/report/press/tochi_fudousan_kensetsugyo05_hh_*.html`
- Same release PDF under `/report/press/content/`
- Avoid `https://www.mlit.go.jp/en/` for numeric claims.

## Dual-link markdown (all locales)

```markdown
([Publisher label, period](primaryUrl) · [archive label](/assets/sources/file.ext))
```

See [`SOURCE_ARCHIVE_POLICY.md`](./SOURCE_ARCHIVE_POLICY.md).

## Manifest per slug

`docs/fact-audit/sources/<slug>.sources.yaml` — add when a post has 3+ headline stats from rotating files.
