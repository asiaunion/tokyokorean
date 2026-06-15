# Next work queue (after trust housekeeping)

> **Trust / T3:** Fixed — [`fact-audit/T3_POLICY.md`](./fact-audit/T3_POLICY.md).  
> **Do not** reopen full batch T3 unless policy changes.  
> **Full session context:** [`GSF_BLOG_SESSION_ARCHIVE_20260525.md`](./GSF_BLOG_SESSION_ARCHIVE_20260525.md)

Work in order. Check off in this file or weekly KPI when done.

---

## 1. Search Console (manual)

Guide: [`GSC_ADSENSE_WAITING_CHECKLIST_KO.md`](./GSC_ADSENSE_WAITING_CHECKLIST_KO.md) · [`GSC_MANUAL_STEPS_20260522.md`](./GSC_MANUAL_STEPS_20260522.md) · JA: [`SEO_JA_CLUSTER_FOCUS.md`](./SEO_JA_CLUSTER_FOCUS.md)

- [x] Sitemap `https://gsfark.com/sitemap-index.xml` submitted / healthy *(HTTP 200 + `/sitemap.xml` → 308 확인, 2026-05-27 Cursor)*
- [x] URL inspection ~6 URLs (home, topics, KO/EN/JA post, about) *(GSC 제출 완료)*
- [x] JA cluster P0 URLs (3/week per SEO doc) *(GSC 제출 완료)*
- [ ] Legacy Korean URL 308 spot-check if GSC still shows old paths *(태그 페이지 308 확인됨. `/privacy/`는 404 확인되어 `vercel.json` redirect 보강 후 배포 필요)*

---

## 2. AdSense (manual + env)

Guide: [`ADSENSE_AND_GSC_CHECKLIST.md`](./ADSENSE_AND_GSC_CHECKLIST.md)  
Audit 보고서: [`../adsense_audit_report_2026-06-13.md`](../adsense_audit_report_2026-06-13.md)

- [x] `PUBLIC_ADSENSE_PUBLISHER_ID` on Vercel production
- [x] ads.txt 실제 pub-ID 적용 (`public/ads.txt` 정상, HTTP 200) *(5/22 수정, 5/8 신청 당시엔 주석만 있었음)*
- [x] AdSense 스크립트 무조건 로드 (consent-gate 제거, 6/4 수정)
- [x] 4차 신청 제출 완료 — **현재 심사 중 ("준비 중")** 2026-06-13
- [ ] ⏳ 심사 결과 대기 — 코드 수정·재신청 동결
- [ ] **[다음 재신청 전 필수]** `astro.config.ts` sitemap filter — admin 1줄 추가: `if (pathname.startsWith("/admin")) return false;`
- [ ] **[다음 재신청 전 필수]** 직전 거절로부터 최소 2~3주 대기 (빠른 재신청 패턴 탈피)
- [ ] After approval: Lighthouse ≥90 재측정 *(2026-05-27 mobile / 79, 84, 87 — 개선 여지 있음)*

---

## 3. Monetization MVP (manual)

Guide: [`MONETIZATION_EQUITY_MVP.md`](./MONETIZATION_EQUITY_MVP.md)

- [ ] W1: A8.net + もしも affiliate signup (links after AdSense OK)
- [x] W1: Buttondown welcome sequence (1 email) *(마크다운 초안 준비 완료, 무료 요금제 한계로 Welcome email 1개만 우선 수동 설정)*
- [ ] W2–W3: SNS pilot 4–8 posts ([`SNS_PILOT_CADENCE.md`](./SNS_PILOT_CADENCE.md))
- [ ] W4: Affiliate links in 3 pilot posts ([`AFFILIATE_SETUP.md`](./AFFILIATE_SETUP.md))

---

## 4. Content & SEO (ongoing)

- [ ] New posts: DoD in [`BLOG_TRUST_AND_QUALITY_ROADMAP.md`](./BLOG_TRUST_AND_QUALITY_ROADMAP.md) § 신규 글
- [ ] Ward / Nihonbashi series internal links per [`SEO_JA_CLUSTER_FOCUS.md`](./SEO_JA_CLUSTER_FOCUS.md)
- [ ] Micro-update + `modDatetime` on top legacy posts (freshness)

---

## 5. Later (separate projects)

- Track 2 news factory · UI v2 — [`superpowers/specs/spec-blog-v2.md`](./superpowers/specs/spec-blog-v2.md)

---

## Release hygiene (each deploy)

```bash
SKIP_VALIDATE_BUILD=1 SKIP_TRUST_VERIFY=1 pnpm validate:batch
pnpm verify:diagram-posts   # after diagram changes
pnpm run build              # before major releases
```

## Cursor quick check log (2026-05-27)

- Production reachability: `/`, `/topics/`, `/ko/topics/`, `/ja/topics/`, `/about/`, `/ko/about/`, `/ja/about/`, `/privacy-policy/`, `/ads.txt` = 200
- Redirects: `/sitemap.xml` → `/sitemap-index.xml` (308), `/ko/tags/foo/2/` → `/ko/tags/foo/` (308)
- Follow-up patch staged: `vercel.json`에 `/privacy/`, `/ko/privacy/`, `/ja/privacy/` → `*-privacy-policy/` redirect 추가 (배포 필요)

### Lighthouse prod (2026-05-27, HeadlessChrome mobile + desktop preset)

| URL | Mobile perf | Mobile BP | Desktop perf | Desktop BP | LCP (m / d) |
|-----|-------------|-----------|--------------|------------|-------------|
| `/` | 79 | 100 | 88 | 100 | 4.2s / 2.3s |
| `/topics/` | 84 | 100 | 92 | 100 | 4.0s / 1.8s |
| long-post | 87 | 100 | 98 | 100 | 3.4s / 1.0s |

- long-post hero HTML: `srcset` 없음(아직 `width=1200 height=630`만) → hero variants 배포 후 mobile perf·image-delivery 재측정
