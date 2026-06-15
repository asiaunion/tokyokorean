# modDatetime policy (P3-1)

When to update `modDatetime` in blog post frontmatter (`src/data/blog/{ko,en,ja}/<slug>.md`).

## Update modDatetime when

- **Material fact change:** numbers, dates, legal thresholds, visa/tax rates, or source-backed claims changed.
- **YMYL correction:** investment/safety/visa content corrected after fact audit.
- **Structural rewrite:** >20% of KO body replaced (not typo-only).

## Do not bump for

- Typo fixes, tone-only edits, disclaimer boilerplate sync across locales.
- Image path/caption changes without factual change.
- Gate-only fixes (length padding, formal endings) with no reader-facing fact change.

## Procedure

1. Set `modDatetime` to publish date of correction (ISO `YYYY-MM-DDTHH:mm:ss+09:00` or site convention).
2. Note in `docs/fact-audit/<slug>.md` Sign-off: "modDatetime bumped — reason".
3. Keep `pubDatetime` unchanged unless the post was never public.

## Cross-locale

Update **ko, en, ja** the same day when the same factual correction applies to all three files.
