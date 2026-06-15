# SNS Pilot Cadence (1–2 posts / week)

> **목표**: SEO-only 트래픽에 **월 4–8건** 소셜 시그널 추가. Phase 2 full automation 전 **수동·반자동 pilot**.  
> **구현**: [`blueprint-social-broadcast.md`](../blueprint-social-broadcast.md) + `social-broadcast` Codex 스킬

---

## Weekly rhythm

| Day | Action | Volume |
|-----|--------|--------|
| **금 (발행일)** | 당주 신규 포스트 1건 → X **1언어** 초안 생성·승인·게시 | 1 post |
| **화 or 수** | 지난 7일 인기/핵심 포스트 1건 → LinkedIn **EN** 또는 Threads **KO** | 1 post |
| **—** | Instagram, 일괄 3언어 동시 게시 | **금지** (스팸 리스크) |

**월 합계**: 4–8건 (주 1–2건).

---

## Pilot log template

| Week | Slug | Platform | Lang | Posted? | URL | Notes |
|------|------|----------|------|---------|-----|-------|
| 2026-W21 | | X | ko | | | |
| 2026-W21 | | LinkedIn | en | | | |

→ `sns_posts_published` in [`WEEKLY_KPI_REVIEW.md`](./WEEKLY_KPI_REVIEW.md).

---

## YMYL reminders (from blueprint)

- 구체적 수치(공실률·수익률) SNS 요약 **금지**
- "매수 적기" 등 권유 표현 **금지**
- UTM: `utm_source=x&utm_medium=social&utm_campaign=blog_pilot`

---

## Escalation (after 4 weeks)

- [ ] 주 2건 안정 → 동일 cadence 유지
- [ ] X API 키 확보 → 승인 후 1-click 게시
- [ ] 주 3회 발행과 1:1 매칭은 **Phase 3** — pilot 중에는 1:2 (발행:SNS) 로 충분
