# Blog fact-check workflow (Cursor)

> Used in the **Cursor** step of [`BLOG_AG_CURSOR_WORKFLOW.md`](./BLOG_AG_CURSOR_WORKFLOW.md).  
> **Roadmap (P0-2, trust gates):** [`BLOG_TRUST_AND_QUALITY_ROADMAP.md`](./BLOG_TRUST_AND_QUALITY_ROADMAP.md)  
> AG generates text; **this process verifies claims** before publish.

---

## What automation cannot prove

| Checked automatically (`validate:post`) | Needs human + fact sheet |
|----------------------------------------|---------------------------|
| sources / references shape | Number matches source page |
| Tier domain (go.jp, etc.) | Law/article still current |
| Fact-sheet coverage (T1) | Tier-1 **specific** URL in sheet |
| Locale numeric parity (T2) | Context not misleading |
| Source page fetch + fuzzy (T3) | Law/article still current |
| EN We / JA hangul lint | Judgment calls on YMYL |
| No “guaranteed return” phrases | T4 semantic review |
| KO length 1200–4000 (면책 제외), tone, disclaimer | |

---

## Fact sheet (required per post)

Template: [`templates/blog-fact-sheet.md`](./templates/blog-fact-sheet.md)

**Rule**: Every **statistic, date, threshold, %, ¥ amount** in KO body must appear on the sheet with:

1. Exact value as written in post  
2. Tier-1 URL (government / public / major media)  
3. Human ✓ after opening URL  
4. Section in KO md  

If no tier-1 source exists → soften wording or remove the claim.

---

## Cursor-assisted review (prompts)

Copy into Cursor chat after filling the fact sheet:

### A. Claim vs sources

```
Read src/data/blog/ko/<slug>.md frontmatter sources and body.
List every number, date, and legal threshold in the body.
For each, say whether it is supported by the cited sources or needs a fix.
Do not invent sources.
```

### B. KO vs EN/JA drift

```
Compare src/data/blog/ko/<slug>.md with en and ja versions.
List factual differences (numbers, dates, named entities), not style.
```

### C. After edits

```
Run: pnpm validate:post <slug>
Summarize failures and propose minimal md fixes.
```

---

## Source tier (align with code)

[`src/lib/research-adapter/tiering.ts`](../src/lib/research-adapter/tiering.ts)

| Tier | Examples | Use for |
|------|----------|---------|
| government | `.go.jp`, `.go.kr`, `.gov` | Law, stats, policy |
| public | `.or.jp`, `boj.or.jp`, `reins.or.jp` | Market data |
| media | nikkei, reuters, bloomberg | Secondary confirmation |
| general | other | Background only — not sole support for numbers |

---

## Sign-off

| Role | Action |
|------|--------|
| Author | Fact sheet ✓ + `pnpm validate:post` pass |
| Cursor session | Log slug, date, validation exit code in weekly KPI `notes` |
| You | git commit + deploy only after above |

---

## Related

- [`BLOG_AG_CURSOR_WORKFLOW.md`](./BLOG_AG_CURSOR_WORKFLOW.md)
- [`BLOG_AGENT_AUTOMATION_RUNBOOK.md`](../BLOG_AGENT_AUTOMATION_RUNBOOK.md) § Pre-publish approval
