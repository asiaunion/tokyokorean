# Weekly KPI Review (Friday, 30 min)

> **연동**: GSF-Job 전략 §10.1 · Cash [`CASH_ENGINE_WARM_INTRO_PLAYBOOK.md`](../../../docs/superpowers/specs/CASH_ENGINE_WARM_INTRO_PLAYBOOK.md)

**데이터 소스**

| Metric | Source |
|--------|--------|
| Sessions / PV | [GA4](https://analytics.google.com/) → Reports → Engagement |
| Indexed / impressions | [GSC](https://search.google.com/search-console) → Performance |
| Subscribers | [Buttondown](https://buttondown.com/) dashboard |
| Cash | 수동 (플랫폼·송금) |

---

## Copy-paste template

```markdown
## Week YYYY-Www (YYYY-MM-DD)

### Equity
| KPI | This week | Δ vs last week | Target (phase) |
|-----|-----------|----------------|----------------|
| posts_published | | | 3/wk (Phase 1) |
| ja_posts_prioritized | | | ≥2/wk JA focus |
| ga4_sessions | | | — |
| ga4_pageviews | | | — |
| gsc_impressions_ja | | | — |
| gsc_clicks_ja | | | — |
| gsc_indexed_urls (approx) | | | — |
| gsc_queries_top | | | top 5 JA queries (28d) — see [SEO_JA_CLUSTER_FOCUS § GSC refresh](./SEO_JA_CLUSTER_FOCUS.md#gsc-query-refresh-post-adsense) |
| refreshed_slugs | | | post-Adsense refresh targets |
| email_subscribers | | | 50 @ 3mo |
| sns_posts_published | | | 1–2/wk |
| adsense_revenue_jpy | | | bonus only |
| affiliate_clicks | | | — |

### Cash
| KPI | This week | Notes |
|-----|-----------|-------|
| warm_intros_sent | | target 5 |
| platform_proposals_sent | | cap 2 |
| client_calls | | |
| projects_won | | |
| revenue_jpy | | |
| cumulative_reviews | | |

### Publishing (AG write + Cursor validate)
| KPI | This week | Notes |
|-----|-----------|-------|
| posts_validated_cursor | | `pnpm validate:post` pass count (format + trust) |
| posts_format_only_pass | | `SKIP_TRUST_VERIFY=1` batch pass count |
| trust_pass_count | | full trust on, exit 0 |
| trust_uncertain_cleared | | T3 UNCERTAIN → human ✓ |
| posts_deployed | | git/deploy after validate |
| validate_failures | | gate names |
| index_validate_synced | | `pnpm trust:update-index` run Y/N |

### Qualitative
- Done:
- Learned:
- Next week (max 3):
- Burnout (1–5):
```

---

## Phase targets (quick reference)

| Phase | posts/mo | PV/mo (guide) | email subs | cash/mo |
|-------|----------|---------------|------------|---------|
| 1 (mo 1–3) | ~12 | <1k | 50 | ¥0–50k |
| 2 (mo 4–5) | ~12 | 1.5k–3k | 100 | ¥50k–100k |
| 3 (mo 6+) | ~12 | 3k+ | 100+ | ¥100k+ |

---

## Archive

Store filled weeks in `docs/kpi-archive/YYYY-Www.md` (create folder on first use).
