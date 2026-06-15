# Equity Engine MVP (4-Week Launch)

> **상태**: 2026-05-23 실행 패키지  
> **전략 연동**: GSF-Job [`2026-05-14-solo-monetization-strategy-design.md`](../../../docs/superpowers/specs/2026-05-14-solo-monetization-strategy-design.md)

Phase 1 Equity 레버 중 **미가동이었던 3축**을 4주 안에 최소 MVP로 닫습니다.

---

## Week-by-week checklist

| Week | Deliverable | Owner action | Done |
|------|-------------|--------------|------|
| **W1** | A8.net + もしもアフィリエイト **가입** (링크 삽입은 AdSense 승인 후) | 수동 가입 | [ ] |
| **W1** | 리드 마그넷 랜딩 `/resources/tokyo-relocation-d90/` 배포 | 코드 배포 | [ ] |
| **W1** | Buttondown에 환영 시퀀스 1통 (수동 발송 OK) | Buttondown UI | [ ] |
| **W2** | SNS pilot **2건** (X 1 + LinkedIn 또는 Threads 1) | `social-broadcast` 스킬 | [ ] |
| **W3** | SNS pilot **2건** + 홈/포스트 **고의도 CTA** ([`HIGH_INTENT_POST_CTA.md`](./HIGH_INTENT_POST_CTA.md)) | 코드 배포됨 | [x] |
| **W4** | Affiliate 링크 **3개 포스트** 파일럿 (AdSense 승인 후) | [`AFFILIATE_SETUP.md`](./AFFILIATE_SETUP.md) | [ ] |

---

## Implemented in repo

| Asset | Path |
|-------|------|
| Lead magnet (KO/EN/JA pages) | `src/pages/[...locale]/resources/tokyo-relocation-d90.astro` + `src/data/resources/tokyo-relocation-d90/` |
| Printable checklist | `public/downloads/tokyo-relocation-d90-checklist-{en,ko,ja}.md` |
| Affiliate ops guide | [`AFFILIATE_SETUP.md`](./AFFILIATE_SETUP.md) |
| SNS cadence | [`SNS_PILOT_CADENCE.md`](./SNS_PILOT_CADENCE.md) |
| Newsletter | `src/components/NewsletterForm.astro` (Buttondown `gsf`) |
| High-intent post CTA | `src/components/HighIntentPostCta.astro` + [`HIGH_INTENT_POST_CTA.md`](./HIGH_INTENT_POST_CTA.md) |

---

## Success metrics (Phase 1 checkpoint)

| Metric | Target |
|--------|--------|
| Affiliate programs enrolled | 2+ |
| Lead magnet live | 1 |
| SNS posts (pilot month) | 4–8 total |
| Email subscribers | 50+ (3 months; needs traffic + magnet) |

---

## Related

- [`EDITORIAL_TOPIC_POLICY.md`](./EDITORIAL_TOPIC_POLICY.md) — topic/keyword decisions (no niche pivot)
- [`AFFILIATE_SETUP.md`](./AFFILIATE_SETUP.md)
- [`SNS_PILOT_CADENCE.md`](./SNS_PILOT_CADENCE.md)
- [`SEO_JA_CLUSTER_FOCUS.md`](./SEO_JA_CLUSTER_FOCUS.md)
- [`WEEKLY_KPI_REVIEW.md`](./WEEKLY_KPI_REVIEW.md)
- [`../blueprint-social-broadcast.md`](../blueprint-social-broadcast.md)
- [`BLOG_AG_CURSOR_WORKFLOW.md`](./BLOG_AG_CURSOR_WORKFLOW.md) — AG write / Cursor verify
