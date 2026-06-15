# Mobile access — GitHub links (404 fix)

## Symptom

Opening `https://github.com/asiaunion/mission-control/...` on **iPhone Safari without GitHub login** shows **404**.

This is **expected for private repositories**. GitHub hides private repos from anonymous users (404, not 403).

## Fixes (pick one)

### A. Mobile reading (recommended, already works)

Use Obsidian vault copy — no GitHub needed:

- Short checklist: `20 Areas/Playbooks/공통.md`
- Full SOP: `20 Areas/Playbooks/포스팅 SOP (상세).md`

Synced via iCloud to iPhone/iPad.

### B. GitHub link without 404 (make repo public)

Operational docs only — no API keys or `.env` in this repo.

1. Open https://github.com/asiaunion/mission-control/settings#danger-zone
2. **Change repository visibility** → **Public**
3. Confirm — GitHub doc links work on Safari without login

### C. Keep private + GitHub app login

Install GitHub app on iPhone, sign in as `asiaunion`, then open the same URL.

## SSOT

| Layer | Location |
|-------|----------|
| Agent / Mac canonical | `mission-control/docs/` (this repo) |
| Mobile / offline | Obsidian `GSF-PKM` Playbooks (iCloud) |
| Offsite backup | GitHub `asiaunion/mission-control` |
