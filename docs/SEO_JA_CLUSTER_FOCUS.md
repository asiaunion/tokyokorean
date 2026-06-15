# SEO: Japanese Cluster Focus (Phase 1–2)

> **원칙**: 3언어 **equal effort** 대신 **JA 인덱싱·검수 우선** (원고는 **KO** 유지 → 번역·배포).  
> **이유**: 도쿄 부동산·생활 니치는 **일본어 로컬 검색 의도**가 전환·Affiliate에 가장 가깝고, YMYL E-E-A-T는 JA 실거주 서술이 강함.

---

## Language roles (KO / JA / EN) — FAQ 요약

| 질문 | 한 줄 답 |
|------|----------|
| **「JA 검수·GSC 3 URL/주」= 일본어로 먼저 쓰라는 뜻?** | **아니오.** 글은 **한국어 원고** → 파이프라인. **SEO·GSC·번역 검수 시간**을 `/ja/` URL에 먼저 쓴다는 뜻. |
| **한국어(모국어)는 별도?** | **아니오 — 콘텐츠의 중심축.** 한일 크로스보더·교민·투자 각도는 KO가 가장 자연스럽다. |
| **영어는 덜 중요한가?** | **아니오 — 노력 배분과 1년차 SEO 속도의 문제.** EN은 **유지·배포·포트폴리오(Upwork/LinkedIn)** 에 필수. 다만 이 니치에서 **PV·순위를 EN만으로 끌어올리기**는 신규 사이트에 불리. |
| **EN = 더 많은 유입?** | **장기 잠재력은 있음.** 단기(≈1년)에는 **JA 롱테일 + KO 틈새 + 시리즈·내부링크**가 유입·수익 ROI가 더 현실적. |

### 역할 분담

| 언어 | 역할 | SEO attention (가이드) |
|------|------|------------------------|
| **KO** | 원고·사고의 기준; 한일 거시·세무·교민 | ~30% (GSC KO 쿼리, 크로스보더) |
| **JA** | 로컬 검색·移住·Affiliate·실거주 E-E-A-T | ~50% (GSC 주 3 URL, 번역 검수) |
| **EN** | 사이트 default locale, 글로벌·Cash Engine URL | ~20% (파이프라인 유지; 데이터 나온 slug만 개정) |

**발행**: 3언어 모두 유지 (hreflang). EN을 빼지 않는다. **「EN-first 대량 키워드」** 만 Phase 1–2에서 자제 — [`EDITORIAL_TOPIC_POLICY.md`](./EDITORIAL_TOPIC_POLICY.md) Out of scope.

**EN을 SEO 주력으로 올릴 신호** (GSC/GA4): 특정 EN URL의 impression이 JA보다 꾸준히 클 때, 그 slug만 EN 제목·H2 refresh.

---

## Primary cluster: 日本橋・中央区ライフ + 投資フレーム

**Hub key**: `tokyoLife` + `urbanInvestment` (see [`topicHubs.ts`](../src/data/topicHubs.ts))

### Tier 1 — 완주·갱신 우선 (JA title / slug)

| Priority | Slug | JA focus action |
|----------|------|-----------------|
| P0 | `nihonbashi-hamacho-walking-guide` | GSC URL inspection · 내부 링크 from hub |
| P0 | `nihonbashi-mitsui-redevelopment-pipeline-three` | 시리즈 허브 링크 |
| P1 | `ginza-marunouchi-walk-dna` | Ep 시리즈 "다음 글" 링크 |
| P1 | `tokyo-office-vacancy-five-wards-2026` | 투자 허브 앵커 |
| P2 | `japan-visa-paths-permanent-business-manager-asset-holders` | 移住 클러스터 교차 링크 |

### Tier 2 — 移住・実務 (리드 마그넷과 연결)

| Slug | Link to lead magnet |
|------|---------------------|
| `tokyo-moving-contracts-two-notes` | `/ja/resources/tokyo-relocation-d90/` |
| `japan-corporate-vs-personal-rental-after-tax-sketch` | same |
| `korea-japan-inheritance-gift-tax-cross-border-basics` | same |

---

## Weekly editorial split (unchanged volume, shifted effort)

| Slot | Mon/Wed/Fri slot | **JA effort** | EN/KO |
|------|------------------|---------------|-------|
| 2×/week | 투자/경제 | KO 원고 → **JA 번역 품질 1차 검수** | EN auto + spot-check |
| 1×/week | 에세이 | JA 또는 KO (교민 각도) | pipeline |

**시간 절약**: EN/KO는 "출시 동시"가 아니라 **JA GSC 제출 후 48h 내** 동기화해도 됨 (hreflang은 배포 시 일괄 생성).

---

## GSC actions (JA URLs first)

1. **Sitemap**: confirm `/ja/` post URLs in child sitemap.
2. **URL inspection**: 3 JA URLs/week from Tier 1 table.
3. **Query filter**: GSC → Search results → **Country: Japan**, **Language: Japanese** — 클릭·노출 주간 기록 → [`WEEKLY_KPI_REVIEW.md`](./WEEKLY_KPI_REVIEW.md).

---

## Internal linking rule

Every new **investment** JA post must link to:

1. One **tokyoLife** slug (생활 신뢰)
2. One **urbanInvestment** slug (투자 깊이)
3. Lead magnet `/ja/resources/tokyo-relocation-d90/` when 移住・契約・税務 주제

---

## GSC query refresh (post-AdSense)

> **When**: AdSense **approved** + at least **8 weeks** of GSC Search results data for property `gsfark.com`.  
> **Goal**: Raise rankings **without new topics** — update existing JA/KO posts that already match demand.  
> **Policy**: [`EDITORIAL_TOPIC_POLICY.md`](./EDITORIAL_TOPIC_POLICY.md) Phase B (30% refresh share).

### 1. Weekly GSC export (15 min, paired with Friday KPI)

1. Open [Google Search Console](https://search.google.com/search-console) → **Performance** → **Search results**.
2. Filters: **Country = Japan**, **Page** contains `/ja/` (or `/ko/` for 교민 queries).
3. Date: last **28 days**; export or copy top rows.
4. Paste top 5–10 queries into [`WEEKLY_KPI_REVIEW.md`](./WEEKLY_KPI_REVIEW.md) field `gsc_queries_top`.

### 2. Candidate selection

| Signal | Threshold | Action |
|--------|-----------|--------|
| Impressions | **> 50** in 28d | Worth optimizing |
| Average position | **8–30** | “Striking distance” — refresh target |
| CTR | Low vs peers | Improve title/meta description |
| Query intent | 移住・賃貸・投資・税務 | High priority |
| Query intent | Pure 観光・無関係 | **Ignore** — do not chase |

**Map query → existing post** (prefer Tier 1/2 slugs in this doc). If no post fits, plan **one** new long-tail in ward/移住 cluster — not a new niche.

### 3. Refresh SOP (per URL, ~45–90 min)

1. **Pick one JA URL** (canonical for cluster; KO refresh optional same week).
2. Add **one H2** that mirrors the query naturally (no keyword stuffing).
3. Add **2–4 sentences** of 2026 data or local context + link to official `sources` already used on site.
4. Add **internal links**: one `tokyoLife` + one `urbanInvestment` (or lead magnet for 移住 queries).
5. Update `modDatetime` in frontmatter; add `<!-- content-depth-v2 -->` block only if substantive.
6. **GSC** → URL inspection → **Request indexing** for that JA URL only.
7. Log in weekly KPI: `refreshed_slugs: [slug]`.

### 4. Title / meta tweaks (optional)

- Title: include query phrase **once**, keep under ~60 characters JA.
- `description`: answer intent in first sentence; no investment guarantees (YMYL).

### 5. Do not

- Create a **new** post for every query (thin duplication risk).
- Refresh **>3 posts/week** (dilutes writing capacity for new cluster content).
- Change topic hub or category to unrelated themes for traffic.

### 6. Success signals (4-week rolling)

- Position **8–30 → 5–15** on target query.
- Impressions up with stable or better CTR.
- Clicks to lead magnet or affiliate pilot posts (post-approval).

---

## Out of scope (Phase 1)

- EN-first 키워드 공략 (볼륨만 크고 전환 낮음)
- Track 2 GSF-Factory 일일 뉴스 on root domain (AdSense 승인 전)
- **GSC query refresh** (§ above) — start **after** AdSense approval
