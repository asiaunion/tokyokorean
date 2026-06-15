# GSF-Blog 세션 아카이브 (2026-05-25)

> **목적:** Trust Phase 3 · 면책 · 다이어그램 · 정책 고정까지의 결정·배포·남은 일을 **한 문서**에 갈무리.  
> **정본 진입점:** [`BLOG_TRUST_AND_QUALITY_ROADMAP.md`](./BLOG_TRUST_AND_QUALITY_ROADMAP.md) · **다음 작업:** [`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md)  
> **대화 맥락:** Cursor 세션 (trust/disclaimer/diagram/housekeeping) — 2026-05-24 ~ 2026-05-25

---

## 1. Executive summary

| 영역 | 최종 상태 |
|------|-----------|
| **프로덕션** | https://gsfark.com/ · Vercel `main` 배포 정상 |
| **CI 검증** | `SKIP_TRUST_VERIFY=1` → **36/36 PASS** (KO 기준 slug, MDX 포함) |
| **T3 정책** | **P0-only 고정** — 전 시트 fetch ON 35/35 **비목표** |
| **면책** | 본문 **맨 위 `PostDisclaimer`만** (투자/안전/일반 카테고리별 문구) |
| **다이어그램** | 포스트는 **`diagrams/*.webp`만** 링크 (SVG는 편집용) |
| **각주 Wave A/B/C** | ✅ **완료** (2026-05-27) — [`GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md`](./GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md) |
| **다음 순서** | GSC → AdSense → Monetization MVP → 콘텐츠 SEO |

---

## 2. 타임라인 (주요 커밋)

| 커밋 | 요약 |
|------|------|
| `f460710` | Trust Phase 3, P0 URL, ginza coverage |
| `237429a` | pnpm-lock + pdfjs-dist (Vercel 빌드 복구) |
| `36158a7` | 교차 로케일 QA 블록(독자용) 제거 |
| `6b1df8d` | 이탤릭 중복 면책 제거 |
| `451fb8c` | **상단 면책 통일**, 하단 `## Disclaimer` 105편 제거 |
| `919ebfc` | macro 하단 면책 제거 · SVG→WebP 46종 · CTA 공시 |
| `936dceb` | **T3 P0-only** 문서·로드맵·`NEXT_WORK_QUEUE` |
| `de8fd1a` | INDEX 36/36 · macro-barrier 시트 스텁 |
| `e2aab8b` … `5f3a9b7` | **Wave C footnotes** C1–C5 (24 slugs) · see [`GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md`](./GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md) |

---

## 3. Trust · 팩트 검증 (확정 정책)

### 3.1 무엇을 검증하는가

| Tier | 내용 | 도구 |
|------|------|------|
| T0 | 형식, 톤, 면책 레이아웃 | `pnpm validate:batch` |
| T1 | fact sheet ↔ KO extract | `pnpm trust:extract` |
| T2 | KO/EN/JA 수치 parity | `pnpm trust:parity` |
| **T3 P0** | 12 slug 대표 claim URL 실측 | `p0-spot-verify.mjs` (**12/12**) |
| T3 (선택) | 단일 slug 심층 | `pnpm trust:verify-sources <slug>` |

### 3.2 하지 않는 것 (의도적)

- 배치 `SKIP_TRUST_VERIFY=0` → 35/35 (한때 **24/35**, 11 slug 미검증 claim ~525)
- `bulk-t3-mark-passing.mjs`로 전 행 `[x]` — **전수 검증 완료로 오해 금지**

**정본:** [`fact-audit/T3_POLICY.md`](./fact-audit/T3_POLICY.md)  
**역사:** [`fact-audit/T3_DEFERRED_11_SLUGS.md`](./fact-audit/T3_DEFERRED_11_SLUGS.md) (아카이브)

### 3.3 일상 명령

```bash
SKIP_VALIDATE_BUILD=1 SKIP_TRUST_VERIFY=1 pnpm validate:batch
TRUST_SKIP_SOURCE_FETCH=1 npx tsx scripts/cursor-phase3-verify-all.mjs
node scripts/p0-spot-verify.mjs
pnpm trust:update-index
```

### 3.4 Phase 3 산출 (참고)

- Parity **35/35** (fetch 생략)
- P0 URL 스팟 **12/12**
- HTML `Factual key indicators` 주석 **0**
- 상세: [`fact-audit/CURSOR_PHASE3_REPORT.md`](./fact-audit/CURSOR_PHASE3_REPORT.md)

---

## 4. 면책 (Disclaimer) 아키텍처

### 4.1 최종 구조

- **위치:** `PostDetails.astro` — `<article>` 시작 직전, **모든 글**에 `PostDisclaimer`
- **문구 SSOT:** [`src/lib/postDisclaimer.ts`](../src/lib/postDisclaimer.ts)

| `resolvePostDisclaimerCategory` | 대상 `category` | 용도 |
|-----------------------------------|-----------------|------|
| `investment` | investment | 투자·부동산·이민·시점·비권유 |
| `safety` | safety | 재난·공식 안내 우선 |
| `general` | life, local, essay, 미지정 | 정보 제공·운영 시점 |

### 4.2 제거한 것

- 마크다운 `## 면책 및 이용 안내` / `## Disclaimer` / `## 免責…` (105 locale 파일)
- macro-barrier **이탤릭** 하단 면책 (KO/EN/JA MDX)
- 레거시 `*Disclaimer:*` 이탤릭 블록 (이전 커밋)

### 4.3 AdSense·규정 (결론)

- 면책 **한 곳(상단)** 만으로 AdSense Publisher 정책상 일반적으로 충분
- 글자 크기: 본문과 동일 `text-base` + 본문 첫 블록 위 여백
- **High-intent CTA** (`Need help with your Japan project?`)는 편집 본문과 분리 · `highIntentCtaDisclosure` 공시 · investment/safety만

---

## 5. 다이어그램 · 차트

### 5.1 문제

- `public/.../svg/*.svg`를 `<img src="…svg">`로 링크 → XML 오류(`&`, `<` in `<text>`) 시 **브라우저 깨짐**
- 예: `japan-corporate-vs-personal-rental-after-tax-sketch`

### 5.2 해결 (표준 파이프라인)

```
svg/ (편집) → pnpm diagrams:sanitize → pnpm diagrams:render → diagrams/*.webp (포스트 링크)
```

| 스크립트 | 역할 |
|----------|------|
| `scripts/sanitize_svg_xml.py` | `<text>` 내 `&`, `<` 이스케이프 |
| `scripts/render-diagrams-to-webp.mjs` | resvg + sharp → WebP |
| `scripts/migrate-svg-refs-to-webp.mjs` | md/mdx 경로 일괄 변경 (완료) |
| `pnpm verify:diagram-posts` | 프로덕션 스모크 |

**문서:** [`CHARTS_AND_VISUALS.md`](./CHARTS_AND_VISUALS.md) §8 · [`DIAGRAM_POST_SMOKE_CHECKLIST.md`](./DIAGRAM_POST_SMOKE_CHECKLIST.md)  
**폐기:** [`SVG_POST_SMOKE_CHECKLIST.md`](./SVG_POST_SMOKE_CHECKLIST.md)

### 5.3 데이터 차트 (macro-barrier 등)

- 시계열·수치 차트: **CSV → Python → WebP** (`scripts/charts/`)
- MDX: `<figure class="supplemental-chart">` + `MacroMicroMatrix` (본문 중간 배치)

---

## 6. 문서 맵 (헷갈릴 때 여기서)

| 질문 | 문서 |
|------|------|
| T3 뭘 해야 해? | [`fact-audit/T3_POLICY.md`](./fact-audit/T3_POLICY.md) |
| 다음에 뭘 해? | [`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md) |
| 전체 trust 로드맵 | [`BLOG_TRUST_AND_QUALITY_ROADMAP.md`](./BLOG_TRUST_AND_QUALITY_ROADMAP.md) |
| slug별 상태 | [`fact-audit/INDEX.md`](./fact-audit/INDEX.md) |
| GSC 수동 | [`GSC_MANUAL_STEPS_20260522.md`](./GSC_MANUAL_STEPS_20260522.md) |
| AdSense | [`ADSENSE_AND_GSC_CHECKLIST.md`](./ADSENSE_AND_GSC_CHECKLIST.md) |
| 수익화 4주 | [`MONETIZATION_EQUITY_MVP.md`](./MONETIZATION_EQUITY_MVP.md) |
| CTA 규칙 | [`HIGH_INTENT_POST_CTA.md`](./HIGH_INTENT_POST_CTA.md) |
| JA SEO 우선 | [`SEO_JA_CLUSTER_FOCUS.md`](./SEO_JA_CLUSTER_FOCUS.md) |

---

## 7. 사용자 결정 (고정)

1. **T3:** P0-only — 11 slug 전수 T3 **재개 안 함**
2. **우선순위:** 기술·문서 housekeeping → GSC/AdSense/MVP **순차**
3. **면책:** 상단만 — 가시성·신뢰
4. **다이어그램:** WebP 배포 — SVG 직링크 금지

---

## 8. 남은 작업 (요약)

[`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md) 체크리스트 — 미완은 전부 **수동·운영**:

1. Search Console (sitemap, 6 URL, JA P0)
2. AdSense (env, 신청, ads.txt, Lighthouse)
3. Affiliate 가입, Buttondown, SNS, 제휴 3편
4. 신규글 DoD, 내부링크, modDatetime freshness
5. (장기) Track2 뉴스 팩토리 · UI v2

---

## 9. 에이전트·AG 핸드오프

- **루트 SSOT (AG 고정):** [`../AGENTS.md`](../AGENTS.md) — Tier 2.5 `AGENTS.md`에 3대 규칙 영구 주입 (2026-05-25)
- **Trust 완료:** 「CI 36/36 · T3 P0-only · 상단 면책 · diagram WebP · main deployed」
- **다음:** 「[`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md) §1 GSC부터」
- **하지 말 것:** `SKIP_TRUST_VERIFY=0` 배치 실패를 회귀로 해석 · 포스트에 `.svg` 링크 · markdown footer 면책 재삽입
- **AG 부트스트랩 프롬프트 (복사용):** [`AG_CONTEXT_BOOTSTRAP_20260525.md`](./AG_CONTEXT_BOOTSTRAP_20260525.md)

---

## 10. 레포 · 경로

| 항목 | 값 |
|------|-----|
| GitHub | `asiaunion/GSF-Blog` |
| 로컬 | `/Users/gsf/dev/Cursor/gsf-blog` (Antigravity scratch symlink 가능) |
| 프로덕션 | https://gsfark.com/ |

---

*Last updated: 2026-05-27 · footnotes through `5f3a9b7` · trust baseline through `de8fd1a`*
