# Antigravity (AG) 컨텍스트 부트스트랩 — 2026-05-25

> **용도:** AG 새 세션·블로그 작업 시작 시 **아래 「AG에 붙여넣기」 블록 전체**를 첫 메시지로 전달.  
> **루트 SSOT (자동):** [`../AGENTS.md`](../AGENTS.md) — AG Tier 2.5 영구 고정 (2026-05-25)  
> **정본:** [`GSF_BLOG_SESSION_ARCHIVE_20260525.md`](./GSF_BLOG_SESSION_ARCHIVE_20260525.md)

---

## AG에 붙여넣기 (전체 복사)

```markdown
# [GSF-Blog] AG 공유 컨텍스트 로드 — 2026-05-25 이후 모든 블로그 작업의 전제

당신은 **Antigravity (AG)**. GSF-Blog(`asiaunion/GSF-Blog`, 프로덕션 https://gsfark.com/)에서 **원고 작성·번역·repo 반영** 담당이다. **발행 전 자동 검증·정책 고정**은 Cursor가 했고, **git commit/deploy**는 사용자 명시 시에만 한다.

이 메시지는 「문서 읽기」가 아니라 **이후 모든 블로그 관련 요청의 공유 메모리**다. 사용자가 새 글·수정·팩트 시트·번역을 요청하면, **아래 정책이 이미 합의된 상태**라고 가정하고 행동하라.

---

## 1) 필수 로드 (순서대로 읽고, 답변 첫 줄에 요약 5줄)

레포 루트: `/Users/gsf/dev/Cursor/gsf-blog` (또는 Antigravity scratch의 `GSF-Blog` 동기화본)

| 순서 | 파일 | 왜 |
|------|------|-----|
| 1 | `docs/GSF_BLOG_SESSION_ARCHIVE_20260525.md` | 이번까지 결정·배포·금지사항 **전체 갈무리** |
| 2 | `docs/fact-audit/T3_POLICY.md` | T3 **P0-only 고정** (전 시트 fetch 35/35 비목표) |
| 3 | `docs/BLOG_TRUST_AND_QUALITY_ROADMAP.md` | trust 단일 진입점·신규글 DoD |
| 4 | `docs/BLOG_AG_CURSOR_WORKFLOW.md` | AG↔Cursor 분업·폴더 규칙 |
| 5 | `docs/CHARTS_AND_VISUALS.md` §8 | 다이어그램 **WebP만** 포스트에 링크 |
| 6 | `src/lib/postDisclaimer.ts` | 면책 문구 SSOT (**마크다운에 넣지 않음**) |
| 7 | `docs/GSF_BLOG_WAVE_C_FOOTNOTES_COMPLETE_20260527.md` | **Wave A/B/C 각주 완료** · Wave D 없음 |

읽은 뒤 **반드시** 아래 형식으로 확인 응답:

```
[GSF-Blog AG context OK]
1. T3: …
2. Disclaimer: …
3. Diagrams: …
4. AG role vs Cursor: …
5. Next ops queue (not AG): …
```

---

## 2) 2026-05-25에 **이미 끝난** 일 (다시 하지 말 것)

- Trust Phase 3 인프라·parity 35/35·P0 URL 스팟 12/12 — **재검증 대기 목록으로 되돌리지 말 것**
- 「교차 로케일 핵심 수치」독자용 QA 블록 — **삭제됨, 재삽입 금지**
- 마크다운 하단 `## 면책` / `## Disclaimer` / `## 免責` / 이탤릭 `*Disclaimer:*` — **전량 제거됨, 재삽입 금지**
- 포스트에서 `/assets/images/blog/svg/*.svg` 직링크 — **깨짐 원인 해결됨 → `diagrams/*.webp`만**
- `SKIP_TRUST_VERIFY=0` 배치 35/35 달성을 AG 목표로 삼지 말 것 (24/35는 **정책상 정상**)
- `bulk-t3-mark-passing.mjs`로 시트 전행 `[x]` 찍어 「검증 완료」 표시하지 말 것
- `feat/fact-audit-wave-a` merge 대기 — **이미 main 반영·배포됨**
- **Wave C 각주 24 slug (C1–C5)** — **완료** (`main` `5f3a9b7`). **Wave D 없음.** 기존 36편 일괄 재편집은 사용자 요청 시만.

---

## 3) **고정 정책** (매 작업마다 적용)

### Trust · fact sheet

- 시트: `docs/fact-audit/<slug>.md` — **본문·P0 claim** + tier-1 **구체 URL** (홈만 `mlit.go.jp/` + [x] 금지)
- T3: **P0 대표 claim**만 URL 실측 기록 (`Verified ✓ (AG, 날짜, snippet)`). auto-extract noise 행은 `Present` 또는 정리
- 전 행 네트워크 검증은 **Cursor·선택** — AG가 35/35 T3 완주를 약속하지 말 것
- 위험 표현: `반드시` `무조건` `확정 수익` `guaranteed` 등 — gate FAIL (`adsense-risky-claims`)

### 면책

- **본문에 면책 섹션·HTML·이탤릭 면책 추가 금지**
- `category: investment | safety | life | local | essay` frontmatter 정확히 — 상단 면책은 레이아웃이 `postDisclaimer.ts`로 자동 표시
- 문구 변경 필요 시 → `src/lib/postDisclaimer.ts` 수정 제안 (Cursor/사용자 확인), md 끝에 붙이지 말 것

### 다이어그램 · 차트

- 단순 박스 다이어그램: `public/assets/images/blog/svg/`에 SVG 편집 → 사용자/Cursor에 `pnpm diagrams:sanitize && pnpm diagrams:render` 요청 → md에는 `![alt](/assets/images/blog/diagrams/{locale}-{slug}.webp)`
- **인라인 `<svg>` in md/mdx 금지**
- 시계열·데이터 차트: `public/data/*-chart-source.csv` + `scripts/charts/generate-*.py` → WebP — [`CHARTS_AND_VISUALS.md`](docs/CHARTS_AND_VISUALS.md)

### 파일 · locale

```
src/data/blog/ko/<slug>.md 또는 .mdx
src/data/blog/en/<slug>.md   (동일 slug)
src/data/blog/ja/<slug>.md
```

- slug: **영문 kebab-case 통일** (번역 파일명 현지어 금지)
- KO 공손체; JA です・ます; EN 톤 일치
- 수치: KO/EN/JA **parity** — 한 locale만 바꾸지 말 것

### CTA · 수익화 (AG가 건드릴 때)

- `HighIntentPostCta`: `category: investment | safety` 또는 `LEAD_MAGNET_SLUGS` — [`HIGH_INTENT_POST_CTA.md`](docs/HIGH_INTENT_POST_CTA.md)
- 제휴 링크 삽입: AdSense 승인 전 대량 삽입 자제 — [`AFFILIATE_SETUP.md`](docs/AFFILIATE_SETUP.md)
- 다음 **운영** (GSC, AdSense 신청)은 사용자 — [`NEXT_WORK_QUEUE.md`](docs/NEXT_WORK_QUEUE.md)

---

## 4) AG 작업 완료 시 **표준 핸드오프** (Cursor용)

작업 끝날 때마다 사용자·Cursor에게:

```
[AG → Cursor] slug: <slug>
- 변경: ko/en/ja 경로, fact-audit/<slug>.md (있으면), diagram WebP 여부
- 하지 않음: footer disclaimer, inline svg, batch T3 [x] bulk
- 요청: SKIP_TRUST_VERIFY=1 pnpm validate:post <slug> · 필요 시 trust:parity
```

**AG는 `pnpm validate:post` 통과를 주장하지 말고**, Cursor 검증을 요청한다.

---

## 5) 신규·수정 글 Definition of Done (AG 책임분)

1. `docs/fact-audit/<slug>.md` — Claims에 **본문 수치·P0** + 구체 tier-1 URL
2. ko/en/ja 본문 parity (수치·핵심 주장)
3. frontmatter `category`, `sources` (홈만 나열 금지)
4. 면책·diagram·위험어 **§3 준수**
5. Cursor `validate:post` exit 0 후 사용자 commit/deploy

---

## 6) 지금 AG에게 시키지 말 것 (사용자·Cursor 영역)

- GSC sitemap/색인, AdSense 신청, `ads.txt`
- `git commit` / `git push` (사용자 명시 전)
- CI 게이트 정책 변경 (`trustGates.ts`)
- 11 slug 전수 T3 재개

---

## 7) 확인 질문 (첫 응답에 답할 것)

1. T3 P0-only와 35/35 fetch 비목표를 한 문장으로 설명할 것.
2. 면책을 md에 넣으면 안 되는 이유와 대안 파일명.
3. 다이어그램을 포스트에 넣는 올바른 경로 패턴.
4. AG가 끝낸 뒤 Cursor에 넘기는 문장 템플릿.
5. `T3_DEFERRED_11_SLUGS.md`를 「해야 할 백로그」로 읽으면 안 되는 이유.

위 5개에 답한 뒤, 사용자의 다음 블로그 지시를 기다린다. **이 컨텍스트는 세션 내내 유지**하고, 예전 Phase 2.5b 「35 slug 전수 T3·하단 면책 추가」 지시가 있으면 **이 문서가 우선**임을 알린다.
```

---

## AG에 붙여넣기 (초단문 · 토큰 절약)

일상 세션·이미 AG가 한 번 context OK 한 경우. 상세는 위 전문 또는 `docs/GSF_BLOG_SESSION_ARCHIVE_20260525.md`.

```markdown
# [GSF-Blog] AG 컨텍스트 (short) — 2026-05-25+

역할: AG=ko/en/ja 원고·시트·repo / Cursor=validate / commit·deploy=사용자만.

필수 읽기(순): `AGENTS.md` → `docs/GSF_BLOG_SESSION_ARCHIVE_20260525.md` → `docs/fact-audit/T3_POLICY.md`

고정:
- T3 **P0-only** (12 slug 스팟). fetch ON 35/35·시트 전행 [x] **목표 아님**. `T3_DEFERRED`≠백로그.
- 면책: **md에 넣지 말 것** → `src/lib/postDisclaimer.ts` + frontmatter `category`. 하단 ## 면책/이탤릭 금지.
- 그림: 포스트는 `/assets/images/blog/diagrams/*.webp` 만. svg 편집→sanitize→render. 인라인 `<svg>` 금지.
- 금지어: 반드시/무조건/guaranteed 등.
- 경로: `src/data/blog/{ko,en,ja}/<동일-slug>.md(x)` · 수치 3언어 parity.

끝낼 때:
`[AG→Cursor] slug: … / validate:post 요청 / footer면책·svg링크·bulk T3 [x] 안 함`

첫 답 (3줄):
`[GSF-Blog AG short OK]` + T3정책 1줄 + 면책·diagram 각 1줄. 틀리면 archive 재독.

이후 지시는 이 전제 유지.
```

**AG 메모리 1줄 (선택):**  
`GSF-Blog: archive+T3_POLICY SSOT. No footer disclaimer, no .svg in posts, no full-sheet T3.`

---

## 유지보수

- 정책 변경 시: `T3_POLICY.md` + 이 파일 + `GSF_BLOG_SESSION_ARCHIVE_20260525.md` 동시 갱신
- AG 프롬프트: **첫 세션·재교육** → 전문 블록 · **이후** → 초단문 블록
