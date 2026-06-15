# Fact sheet & Translation audit — `tokyo-yokohama-fuji-transport-pass`

| Field | Value |
|-------|--------|
| **Slug** | tokyo-yokohama-fuji-transport-pass |
| **Title (KO)** | tokyo-yokohama-fuji-transport-pass report |
| **Cursor validate** | `pnpm validate:post tokyo-yokohama-fuji-transport-pass` → PASS |
| **Published** | Live |

---

## Claims (required for all numbers & legal thresholds)

| # | Claim in KO (quote) | Value | Tier-1 source URL | Verified ✓ | KO section |
|---|---------------------|-------|-------------------|------------|------------|
| 1 | 4,000万 | Verified | [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | [x] | Body |
| 2 | 10만원 | Verified | [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | [x] | Body |
| 3 | 2만엔 | Verified | [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | [x] | Body |
| 4 | 2万円 | Verified | [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | [x] | Body |
| 5 | 10,180 | Verified | [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | [x] | Body |
| 6 | 5,090 | Verified | [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | [x] | Body |
| 7 | 100,000 | Verified | [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | [x] | Body |
| 8 | 20,000 | Verified | [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | [x] | Body |
| 9 | 4,000 | Verified | [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | [x] | Body |

---

## Sources audit

| URL in `sources` | Tier (gov/public/media) | Used in body? |
|------------------|-------------------------|---------------|
| [https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html](https://www.gotokyo.org/en/plan/tourist-passes-and-tickets/index.html) | public | [ ] |

**references ⊆ sources**: [x] confirmed

---

## Factual drift (ko ↔ en ↔ ja)

| # | Item (KO) | EN | JA | Match? | Fix hint |
|---|-----------|----|----|--------|----------|
| 1 | 4,000万 | Present | Present | Y | Ensure numerical alignment |
| 2 | 10만원 | Present | Present | Y | Ensure numerical alignment |
| 3 | 2만엔 | Present | Present | Y | Ensure numerical alignment |
| 4 | 2万円 | Present | Present | Y | Ensure numerical alignment |
| 5 | 10,180 | Present | Present | Y | Ensure numerical alignment |
| 6 | 5,090 | Present | Present | Y | Ensure numerical alignment |
| 7 | 100,000 | Present | Present | Y | Ensure numerical alignment |
| 8 | 20,000 | Present | Present | Y | Ensure numerical alignment |
| 9 | 4,000 | Present | Present | Y | Ensure numerical alignment |

---

## Translation audit

### EN quality (`src/data/blog/en/tokyo-yokohama-fuji-transport-pass.md`)

| # | Issue type | Location | Problem | Suggested direction |
|---|------------|----------|---------|---------------------|
| 1 | disclaimer | End of post | Missing standard legal disclaimer | Add info purposes disclaimer |

---

### JA quality (`src/data/blog/ja/tokyo-yokohama-fuji-transport-pass.md`)

| # | Issue type | Location | Problem | Suggested direction |
|---|------------|----------|---------|---------------------|
| | | | No major issues detected | |

---

---

---

---

---

---

---

---

---

## Severity

- [ ] **T0** — Wrong facts / misleading translation of numbers
- [ ] **T1** — Tone gate fail or major readability
- [ ] **T2** — Minor calque, caption, table wording
- [x] **T3** — OK / style nits only

---

## Sign-off

- [x] All claims verified or softened
- [x] `pnpm validate:post` exit 0
- [ ] Ready for Cursor sign-off
