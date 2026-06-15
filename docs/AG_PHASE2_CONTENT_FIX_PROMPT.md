# AG 지시: 팩트 시트 기반 본문·번역 수정 (Phase 2.5)

> **용도:** Cursor 2차 게이트 통과 후, AG가 **클레임·번역·출처**를 실제로 고치는 단계.  
> **다음 단계:** AG 완료 → **Cursor 3차 재검증** ([`CURSOR_PHASE3_REVERIFY_PROMPT.md`](./CURSOR_PHASE3_REVERIFY_PROMPT.md))  
> **정본 레포:** `/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog`  
> **선행 산출물:** `docs/fact-audit/INDEX.md`, `docs/fact-audit/<slug>.md`, [`CURSOR_PHASE2_REPORT.md`](./fact-audit/CURSOR_PHASE2_REPORT.md)

---

## 루프 요약

```
[완료] AG 1차 — fact-audit 초안 (md 미수정)
[완료] Cursor 2차 — validate 35/35, 면책·게이트·일부 팩트
    ↓
[지금] AG 2.5 — 시트 기준 md 수정 + tier-1 검증 + 시트 ✓ 갱신
    ↓
[다음] Cursor 3차 — validate·드리프트·시트 대조·보고
    ↓
사용자 — commit / deploy (요청 시)
```

---

## AG에 붙여넣기 (시작)

```markdown
# [GSF-Blog] Phase 2.5 — fact-audit 기반 ko/en/ja 수정 + tier-1 클레임 검증

## 역할
GSF-Blog Track 1. Cursor 2차까지 **validate 게이트 35/35 PASS** 상태.
너의 작업은 `docs/fact-audit/` 시트를 **실행 계획**으로 삼아 **본문·번역·출처를 고치고**, 시트에 검증 결과를 반영하는 것.

**Cursor 3차 재검증·최종 보고·git commit/push/deploy는 하지 않는다.**

## Knowledge / 정책
- `gsf_blog_content_source_integrity` — 출처 없는 수치 금지, YMYL 완화 표현
- `docs/BLOG_FACT_CHECK_WORKFLOW.md`
- `docs/templates/blog-fact-sheet.md`
- `docs/templates/blog-translation-audit.md`
- `Blog_Agent/spec-blog-agent.md` — EN **I** / JA **です・ます**
- `BLOG_IMAGE_RULES_1PAGE.md` — 이미지·캡션·블러 (산책 글)
- `docs/fact-audit/CURSOR_PHASE2_REPORT.md` — 이미 적용된 항목 중복 작업 금지

## 프로젝트
- Repo: `/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog`
- 포스트: `src/data/blog/{ko,en,ja}/<slug>.md`
- 시트: `docs/fact-audit/<slug>.md`
- **제외:** `_integrity-example-*`, `_template-*`

## 절대 금지
1. `git commit` / `git push` / Vercel 배포
2. 출처 확인 없이 수치 **확정** 또는 시트에 ✓ 표시
3. `pnpm validate:post` FAIL을 **통과시켰다**고 보고 (Cursor가 3차에서 확인)
4. 면책 블록 삭제·톤 게이트 역행 (KO 격식체, EN informational purposes, JA 情報提供)

## 허용·권장
- `src/data/blog/{ko,en,ja}/<slug>.md` **수정**
- `docs/fact-audit/<slug>.md` **갱신** (✓, URL, Fix notes, Sign-off 체크)
- `docs/fact-audit/INDEX.md` **P/T/validate 열 갱신** (AG 수정 후 예상 상태만, PASS는 Cursor가 확정)
- frontmatter `sources` / `references` 정리 (`references ⊆ sources`)

---

## 슬러그당 작업 순서

### 1) 시트 읽기
`docs/fact-audit/<slug>.md` 에서:
- Claims 표 — `[검토 필요]` / fact drift **N**
- Translation audit — T0~T3, EN/JA 이슈
- INDEX의 **P0/P1**, **T0/T1** 우선

### 2) Tier-1 검증 (팩트)
각 수치·법적 임계값마다:
1. 시트 URL을 **브라우저로 열어** 본문 수치와 대조
2. 일치 → 시트 `Verified ✓` 체크, `sources`에 **구체 URL**(목록 페이지만이면 해당 통계·조항 딥링크로 교체)
3. 불일치·미확인 → KO/EN/JA에서 **완화** (`약`, `〜`, `당시 조사 기준`) 또는 삭제; 시트에 `Fix applied` 메모

**금지:** `https://www.mlit.go.jp/` 만 달고 ✓ 찍기

### 3) md 수정 (최소 diff)
| 유형 | 조치 |
|------|------|
| **T0 / P0** | 수치·단위·연도 ko=en=ja 정합 (예: 원/엔 혼동, 7년 규칙, 비자 요건) |
| **T1** | EN We→**I**, JA だ→ですます, JA 표 한글 제거 |
| **T2** | 캡션·표·alt KO 사실과 맞춤, 블러 문구 |
| **드리프트** | 세 locale 동일 숫자·고유명사 |
| **출처** | 본문 인용과 `sources` 일치, tier-1 도메인 |
| **광고 리스크** | `반드시` `무조건` `확정 수익` 제거·완화 |

이미지 변경 시: hero≠body, 프라이버시(얼굴 블러·모자이크 금지), `BLOG_IMAGE_RULES_1PAGE.md` 준수.

### 4) 로컬 확인 (읽기·기록만)
```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog
pnpm validate:post <slug>
```
- `failed` 목록을 시트 **Automation** 섹션에 복사 (PASS라도 Cursor가 다시 돌림)
- **네가 FAIL을 전부 해결했다고 주장하지 말 것**

### 5) 시트 Sign-off 갱신
`docs/fact-audit/<slug>.md` 하단:
- [ ] All claims verified or softened — AG가 한 만큼만 체크
- [ ] `pnpm validate:post` exit 0 — **비워 둠** (Cursor 3차)
- [ ] Ready for Cursor sign-off — AG 완료 시 [x]

---

## 배치 우선순위

**Wave A — P0 + T0 (12 slug, INDEX 기준)**  
`coredo-nihonbashi-mitsui-redevelopment`, `ginza-marunouchi-walk-dna`, `japan-corporate-vs-personal-rental-after-tax-sketch`, `japan-visa-paths-permanent-business-manager-asset-holders`, `nihonbashi-hamacho-walking-guide`, `tokyo-6-wards-real-estate-insight`, `tokyo-korean-community-beyond-shinokubo`, `tokyo-mansion-tsubo-chiyoda-chuo-minato`, `tokyo-real-estate-investment-complete-guide`, `tokyo-shinjuku-shibuya-bunkyo`, `tokyo-ward-guide-series-prologue`, `weak-yen-korean-japan-asset-allocation-fx-scenarios`

**Wave B — T1 (4 slug)**  
`korea-japan-inheritance-gift-tax-cross-border-basics`, `nihonbashi-hamacho-supermarket-peacock-city-life`, `one-failure-three-lessons-postmortem`, `why-warm-investing-holds`

**Wave C — 나머지 (19 slug)**  
INDEX·시트에 T2/T3·drift **Y**만 남은 산책·에세이·가이드 — **Light pass** (아래 참고)

**권장:** 5~7 slug/회. Wave A 잔여 5개 → Wave B 4개 → Wave C.

---

## 전체 35개 재작업 (merge 전 권장 — 사용자 결정 2026-05-25)

Wave A **6개만** 끝낸 상태에서 **main merge 전**에는 **35개 전수**를 AG→Cursor 루프로 도는 편이 낫다.  
단, **35개를 동일 깊이로 “처음부터 전부 다시 쓰기”**는 비효율이다. 아래 **3단 깊이**를 지킨다.

| 깊이 | 대상 | AG가 할 일 | 건너뛰기 |
|------|------|-----------|----------|
| **Deep** | Wave A **잔여 5** + INDEX **P0/T0 FAIL** + drift **N** | tier-1 URL 열기, 수치 ko=en=ja, 시트 ✓·구체 URL | — |
| **Standard** | Wave B **T1** 4개 + P1 | EN **I**, JA ですます·한글 혼입, 표·캡션 | — |
| **Light** | Wave C **T2/T3** + 이미 Deep/Standard 완료 7개 | drift 표·면책·인용 URL 점검; Claims는 **변경 시만** ✓ | **7개 Deep 완료분**은 본문 전면 재작성 금지 — **스팟 재확인만** |

**완료 정의 (전체):** 35 slug 모두 시트에 `Factual drift` 정리, `Translation` 잔여 없음 또는 사유, INDEX `AG: gates PASS` 기록.  
마무리 문구: **「팩트·번역 AG 전량(35) 수정 완료, Cursor 3차 전수 재검증 대기」**

### AG에 붙여넣기 (전체 재작업 시작)

```markdown
# [GSF-Blog] Phase 2.5b — 전체 35 slug (Deep/Standard/Light)

이전 세션 Wave A 6개 완료. 이번 세션부터:
1. Wave A 잔여 5 (Deep): tokyo-mansion-tsubo-*, tokyo-real-estate-investment-complete-guide, tokyo-shinjuku-shibuya-bunkyo, tokyo-ward-guide-series-prologue, weak-yen-korean-japan-asset-allocation-fx-scenarios
2. Wave B 4 (Standard): korea-japan-inheritance-*, nihonbashi-hamacho-supermarket-*, one-failure-three-lessons-*, why-warm-investing-holds
3. Wave C 나머지 (Light, 5~7개/회) — 완료된 7 slug는 스팟만, 전면 재작성 금지

시트 mlit.go.jp 일괄 ✓ 금지. 비자→moj.go.jp, 지가→mlit 딥링크, REIT→reins/jpx 등.

`AG_PHASE2_FIX_REPORT.md`에 Wave 2.5b 섹션 누적.
완료 시: 「팩트·번역 AG 전량(35) 수정 완료, Cursor 3차 전수 재검증 대기」
```

---

## 산출물

### 1) `docs/fact-audit/AG_PHASE2_FIX_REPORT.md` (회차마다 누적)

```markdown
## Wave N (날짜)
- 수정 slug: …
- 주요 팩트 수정: (slug — 무엇을, 어떤 URL로)
- 번역 수정: …
- validate (AG 기록, 비공식): PASS n / FAIL m — 실패 slug·게이트 목록

## AG 미배포 확인
- [ ] git push 없음
- [ ] Cursor 3차 대기 문구 삽입
```

### 2) 슬러그별 시트
- Claims ✓ / URL 구체화
- Factual drift → **Y** 또는 Fix note
- Translation 이슈 → **Resolved** 또는 잔여 항목

### 3) INDEX.md
- `review-needed` 열 감소
- validate 열은 `AG: expected PASS` / `FAIL (gate names)` 정도만 (최종 PASS는 Cursor)

---

## 완료 정의 (AG)

- Wave A~C에서 시트에 남은 **P0/T0/T1** 항목을 md·시트에 반영했거나, 불가 시 **사유·[검토 필요]** 유지
- `AG_PHASE2_FIX_REPORT.md` 작성
- 보고 말미 **정확히** 다음 한 줄:

**「팩트·번역 AG 수정 완료, Cursor 3차 재검증 대기」**

---

Wave A 첫 slug `tokyo-korean-community-beyond-shinokubo` 부터 시작해줘.
(또는: `docs/fact-audit/INDEX.md`에서 P0만 골라 5 slug 먼저 처리해줘.)
```

---

## Cursor에게 넘길 때 (한 줄)

AG 작업 후 Cursor 채팅에:

```text
AG Phase 2.5 수정 완료. docs/fact-audit/AG_PHASE2_FIX_REPORT.md 와 변경된 slug 기준으로 Cursor 3차 재검증 실행해줘. docs/CURSOR_PHASE3_REVERIFY_PROMPT.md 절차 따르고, commit은 하지 마.
```

---

## 참고

| 문서 | 내용 |
|------|------|
| [`AG_BATCH_FACT_CHECK_PROMPT.md`](./AG_BATCH_FACT_CHECK_PROMPT.md) | 1차 감사만 (md 금지) |
| [`CURSOR_PHASE3_REVERIFY_PROMPT.md`](./CURSOR_PHASE3_REVERIFY_PROMPT.md) | AG 수정 후 Cursor 재검증 |
| [`BLOG_AG_CURSOR_WORKFLOW.md`](./BLOG_AG_CURSOR_WORKFLOW.md) | 전체 역할 분담 |
