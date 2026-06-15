# Translation audit — `<slug>`

> AG phase-1 draft. Cursor verifies and fixes `src/data/blog/{en,ja}/<slug>.md`.

| Field | Value |
|-------|--------|
| **Slug** | |
| **KO title** | |
| **EN title** | |
| **JA title** | |

---

## Automation (from `pnpm validate:post`)

| Check | Result | Notes |
|-------|--------|-------|
| `ko-formal-tone` | PASS / FAIL | |
| `ja-formal-tone` | PASS / FAIL | |
| `translation-duplication-feel` (en-ja similarity) | PASS / FAIL | score: |
| `disclaimer-present` | PASS / FAIL | |
| `title-body-alignment` (KO) | PASS / FAIL | |

---

## Factual parity (numbers & entities)

| # | Item (KO) | EN | JA | Match? | Fix hint |
|---|-----------|----|----|--------|----------|
| 1 | | | | Y / N / partial | |

---

## EN quality (`src/data/blog/en/<slug>.md`)

| # | Issue type | Location (§ or quote) | Problem | Suggested direction |
|---|------------|----------------------|---------|---------------------|
| | tone | | We/our vs **I** | Use first-person **I** (investor voice) |
| | calque | | Unnatural literal from KO | Reword for native EN |
| | structure | | Missing/extra section vs KO | Align headings |
| | caption | | Image alt/caption | Match KO facts + blur note |

**EN tone rule:** personal investor **I**, not corporate **we** (see `Blog_Agent/spec-blog-agent.md`).

---

## JA quality (`src/data/blog/ja/<slug>.md`)

| # | Issue type | Location | Problem | Suggested direction |
|---|------------|----------|---------|---------------------|
| | tone | | 〜だ / 〜である | Use 〜です / 〜ます |
| | script | | **한글** in table/body | Japanese only in JA file |
| | calque | | Wrong loanword (e.g. イニシアチブ) | Natural Japanese (e.g. 新鮮で特別) |
| | structure | | | |
| | caption | | | |

**JA tone rule:** polished です・ます explanatory style, not news だ・である.

---

## Cross-locale

| Check | OK? | Notes |
|-------|-----|-------|
| Same section count (##) roughly | | |
| Image paths identical across ko/en/ja | | |
| `description` / `title` locale-appropriate | | |
| No EN paragraph left in JA (or vice versa) | | |

---

## Severity (pick one)

- [ ] **T0** — Wrong facts / misleading translation of numbers  
- [ ] **T1** — Tone gate fail or major readability  
- [ ] **T2** — Minor calque, caption, table wording  
- [ ] **T3** — OK / style nits only  

---

## Cursor sign-off (phase 2)

- [ ] EN/JA edits applied  
- [ ] `pnpm validate:post` translation-related gates PASS  
