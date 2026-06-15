# High-Intent Post CTA (Blog → Cash / Newsletter)

> **목적**: PV가 아니라 **프리랜싱·상담·리드 마그넷**으로 넘기는 고정 패턴.  
> **구현**: [`HighIntentPostCta.astro`](../src/components/HighIntentPostCta.astro) · 규칙 [`highIntentCta.ts`](../src/data/highIntentCta.ts)

---

## Placement

| 위치 | 순서 |
|------|------|
| 포스트 본문 | 기사 → 출처 → **High-intent CTA** → 작성자 카드 → Follow → 뉴스레터 |

**에세이**(`category: essay`)·일반 라이프 글에는 **미표시** (뉴스레터만).

---

## When it shows

| Block | Condition |
|-------|-----------|
| **Freelance / contact** | `category` = `investment` or `safety` |
| **D-90 lead magnet** | Slug in `LEAD_MAGNET_SLUGS` (移住・契約・税務·구별 시리즈 프롤로그 등) |

`life` / `local` only: **D-90 링크만** (slug가 목록에 있을 때). 프리랜스 CTA 없음.

---

## Copy principles (YMYL)

- 투자·매수 권유 없음. **「구축·자동화·상담」** 프레임.
- `highIntentCtaDisclosure`: 본문 편집·투자 조언과 **별개**인 작성자 서비스임을 한 줄로 표시 (AdSense·FTC 투명성).
- Contact = `/contact/` · LinkedIn = UTM `high_intent_cta`
- GA4: `data-cta` + `data-cta-location="post-high-intent"` · `data-cta-type="author-services"`

---

## Slug list maintenance

`LEAD_MAGNET_SLUGS` in [`highIntentCta.ts`](../src/data/highIntentCta.ts) — add when publishing:

- 移住・ビザ・契約・税務・法人
- Ward guide series (`tokyo-ward-guide-series-prologue`, `tokyo-*-wards-*`, etc.)

Affiliate pilot slugs: [`AFFILIATE_SETUP.md`](./AFFILIATE_SETUP.md) — same posts often qualify for both.

---

## Related

- [`EDITORIAL_TOPIC_POLICY.md`](./EDITORIAL_TOPIC_POLICY.md) §4 (monetization path)
- [`MONETIZATION_EQUITY_MVP.md`](./MONETIZATION_EQUITY_MVP.md)
- [`CASH_ENGINE_WARM_INTRO_PLAYBOOK.md`](../../../docs/superpowers/specs/CASH_ENGINE_WARM_INTRO_PLAYBOOK.md)
