# Editorial Topic Policy (Monetization & SEO)

> **목적**: 포스팅 주제·키워드 의사결정을 한 페이지로 고정합니다.  
> **전제**: 주제 **대전환 없음** — 도쿄×한일×부동산·이주·거시 니치 안에서 **클러스터 + SEO 레이어**만 조정합니다.  
> **연동**: [`SEO_JA_CLUSTER_FOCUS.md`](./SEO_JA_CLUSTER_FOCUS.md) · [`MONETIZATION_EQUITY_MVP.md`](./MONETIZATION_EQUITY_MVP.md) · [`topicHubs.ts`](../src/data/topicHubs.ts)

**언어 (KO/JA/EN)**: 원고는 **KO**, SEO·GSC 우선은 **JA**, **EN**은 유지·포트폴리오·글로벌 (1년차 PV 주력 아님). FAQ 표 → [`SEO_JA_CLUSTER_FOCUS.md` § Language roles](./SEO_JA_CLUSTER_FOCUS.md#language-roles-ko--ja--en--faq-요약).

---

## 1. Core principle

| Question | Policy |
|----------|--------|
| PV만 올리면 수익? | **부분적.** AdSense = PV×RPM. Affiliate = **의도×전환**. Cash = **전문성·포트폴리오**. |
| AdSense 승인 전 | **지금 4축 유지** — 심사·E-E-A-T·일관성 우선. |
| 승인 후 | **같은 주제**, GSC·Affiliate·시리즈 완주로 비중 조정. |
| 헤드 키워드만 노릴까? | **아니오** (1인·YMYL·신규 사이트에 불리). |

---

## 2. Four editorial hubs (mandatory home for every post)

| Hub | `topicHubs` key | Topics | Primary revenue role |
|-----|-----------------|--------|----------------------|
| Urban investment | `urbanInvestment` | Office, mansion, REIT, redevelopment, yield | AdSense RPM · Cash credibility |
| Macro & policy | `macroPolicy` | FX, rates, visa, tax, corp vs personal | Affiliate · Cash (cross-border) |
| Tokyo life | `tokyoLife` | Neighborhood walks, local life, community | E-E-A-T · Affiliate (移住) |
| Essay | `essay` | Philosophy, personal notes | Newsletter · brand (low direct $) |

**Weekly mix (default)**: investment/macro **2×** + essay **1×** — see [`BLOG_AGENT_AUTOMATION_RUNBOOK.md`](../BLOG_AGENT_AUTOMATION_RUNBOOK.md).

---

## 3. Keyword tiers (planning, not headline-chasing)

| Tier | Examples (JA/KO) | Expectation | GSF action |
|------|------------------|-------------|------------|
| **Head** | 東京 不動産 投資 | Top 10 unlikely in 12mo | Hub pages only; **no dedicated head-target posts** |
| **Body** | 日本橋 賃貸 相場, 経営管理 ビザ | 6–18mo realistic | Ward series, visa, contract posts |
| **Long-tail** | 浜町 生活, 韓国人 東京 コミュニティ | Faster index | `tokyoLife` + ward Ep |

**After AdSense approval**: prioritize **Body + long-tail**; refresh existing posts from GSC — [`SEO_JA_CLUSTER_FOCUS.md` § GSC query refresh](./SEO_JA_CLUSTER_FOCUS.md#gsc-query-refresh-post-adsense).

---

## 4. Pre-publish checklist (4 questions)

Score before drafting or at KO-final gate. **Proceed if ≥3 Yes.** If **≥2 No**, defer or downgrade to essay.

| # | Question | Yes criteria |
|---|----------|--------------|
| 1 | **Hub fit** | Maps clearly to one of four hubs in §2 |
| 2 | **Search intent** | JA (or KO 교민) intent: 情報収集 / 比較 / 移住準備 — not pure 観光 only |
| 3 | **Internal links** | Can link to **≥2 existing posts** (+ lead magnet if 移住・契約・税務) |
| 4 | **Monetization path** | Ties to **Affiliate**, **newsletter/D-90**, or **freelancing portfolio** (post CTA: [`HIGH_INTENT_POST_CTA.md`](./HIGH_INTENT_POST_CTA.md)) |

**Log** (optional): note hub + target tier in blog-agent memo or weekly KPI `notes`.

---

## 5. Phase playbook

### Phase A — AdSense pending (now)

| Do | Don't |
|----|-------|
| 3 posts/week; **ward series** + 移住/visa/tax practical | Niche pivot; head-keyword-only posts |
| JA proofread + GSC 3 JA URLs/week | EN-first volume plays |
| Lead magnet, SNS pilot | PV-only listicles; Factory flood on root |
| Micro-update strong legacy posts | Thin tag/archive index bloat |

### Phase B — First 3–6 months after approval

| Share | Content type | Goal |
|-------|--------------|------|
| **50%** | New cluster (ward, REIT, redevelopment) | SEO authority |
| **30%** | **GSC-driven refreshes** (§ SEO doc) | Rankings without new topics |
| **15%** | Affiliate pilot expansion | Conversions > PV |
| **5%** | Essay | Retention |

### Phase C — 12–24 months

- **Expand inside niche**: 多摩, 神奈川, 確定申告×外国人, Korea→Japan corporate — OK.
- **Avoid**: generic travel, crypto calls, AI-tool-only reviews, offshore real estate unrelated to JP/KR.

---

## 6. Topic priority (revenue × SEO)

1. 移住・契約・税務・ビザ → Affiliate, [D-90](/resources/tokyo-relocation-d90/), newsletter  
2. Ward series (投資+生活) → long-tail + E-E-A-T  
3. J-REIT, rates, FX → RPM + Cash Engine  
4. Essay → 1/week, low SEO expectation  
5. Pure tourism → minimize; keep “resident/investor lens” in `tokyoLife`

---

## 7. Do not pivot to (risk list)

- Mass tourism / restaurant roundups (“東京 観光” volume only)
- Crypto, short-term trade, “今すぐ買い” YMYL violations
- AI tool reviews without Tokyo/KR-JP real-estate angle
- EN high-volume keywords without JA/KO intent alignment

---

## 8. Related docs

| Doc | Use |
|-----|-----|
| [`SEO_JA_CLUSTER_FOCUS.md`](./SEO_JA_CLUSTER_FOCUS.md) | JA cluster slugs, internal links, GSC refresh SOP |
| [`AFFILIATE_SETUP.md`](./AFFILIATE_SETUP.md) | Post-approval link rules |
| [`WEEKLY_KPI_REVIEW.md`](./WEEKLY_KPI_REVIEW.md) | Friday metrics incl. `gsc_queries_top` |
| [`MONETIZATION_EQUITY_MVP.md`](./MONETIZATION_EQUITY_MVP.md) | 4-week Equity MVP |
| [`HIGH_INTENT_POST_CTA.md`](./HIGH_INTENT_POST_CTA.md) | Post → contact / LinkedIn / D-90 |
