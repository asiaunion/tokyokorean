# TokyoKorean locale SSOT (2026-07-04)

## Public URLs

- **Unprefixed only:** `/`, `/posts/{slug}/`, `/about/`, `/privacy-policy/`, …
- **Never link to** `/ko/…`, `/ja/…`, or `/en/…` in HTML, sitemap, RSS, or UI.

## Content folders

- Blog markdown lives under `src/data/blog/ko/` — the folder name is **content language**, not a URL prefix.
- `getPath()` strips `ko|en|ja` from the file id and emits `/posts/{slug}/`.

## UI language

- `SITE.lang` and `defaultUiLang()` are **`ko`**.
- `UiLang` is `"ko"` only (`src/i18n/ui.ts`).

## Legacy insurance (edge only)

- `vercel.json` / `astro.config` may **308** external bookmarks from `/ko/*` and `/ja/*` to unprefixed paths.
- That is for GSC/backlinks only. **Do not regenerate those URLs in the app.**

## Forbidden regressions

- `LangBanner` / `LanguageSwitcher` on public chrome
- `getLangUrl()` inventing `/${lang}/…` prefixes
- Cookie consent or footer linking to `/ko/privacy-policy/`
- Defaulting `<html lang>` or JSON-LD `inLanguage` to `"en"`

## GSC note

404s on `/ko/` and `/ja/` were caused by **internal links** (LangBanner + CookieConsent), not missing static pages. Redirects alone are insufficient if HTML keeps emitting locale prefixes.
