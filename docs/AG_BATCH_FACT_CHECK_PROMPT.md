# AG 배치 지시: 기발행 전체 포스트 팩트·번역 품질 1차 감사

> **용도:** 아래 `## AG에 붙여넣기` 블록을 Antigravity에 **그대로 복사**해 실행한다.  
> **역할:** 1차 조사·팩트 시트 + **번역 감사 초안**만. **Cursor가 2차 재검증·md 수정·배포.**  
> **정본 레포:** `/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog`

---

## AG에 붙여넣기 (시작)

```markdown
# [GSF-Blog] 기발행 전체 포스트 — 팩트·번역 품질 1차 감사 (초안만)

## 역할
GSF-Blog Track 1 담당. **이미 발행된** ko/en/ja 마크다운 **35 slug 전체**에 대해:
1. **팩트 시트 초안** (수치·출처·사실 드리프트)
2. **번역 품질 감사 초안** (EN/JA 톤·가독성·locale 오염)

**2차 검증·본문 수정·validate 통과·git commit/push/Vercel 배포는 Cursor·사용자** — 너는 **조사·초안·보고만**.

## Knowledge / 정책 (반드시 준수)
- Knowledge `gsf_blog_content_source_integrity` — 출처 없는 수치 금지
- `docs/BLOG_FACT_CHECK_WORKFLOW.md`
- `docs/templates/blog-fact-sheet.md` — 팩트
- `docs/templates/blog-translation-audit.md` — **번역 (신규)**
- `Blog_Agent/spec-blog-agent.md` — EN `I` / JA です・ます 톤
- `BLOG_AGENT_AUTOMATION_RUNBOOK.md` § Gate failure remediation

## 프로젝트 경로
- Repo: `/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog`
- 포스트: `src/data/blog/{ko,en,ja}/<slug>.md`
- **제외:** `_integrity-example-*`, `_template-*`

## 절대 금지
1. **ko/en/ja md 수정** — Cursor 전까지
2. `git commit` / `git push` / 배포
3. 출처 없이 수치 **확정** 또는 “검증·번역 완료” 보고
4. validate FAIL을 네가 **고쳤다**고 주장

---

## 슬러그당 작업

### A. 기계 스캔 (읽기만)
```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog
pnpm validate:post <slug>
```
`failed` / `scoreChecks` 중 아래 **번역·톤 관련**을 fact-audit에 복사:
- `ko-formal-tone`, `ja-formal-tone`
- `translation-duplication-feel` (en-ja similarity 수치)
- `disclaimer-present`
- `title-body-alignment` (KO 제목-본문)
- `reference-subset-*`

### B. 팩트 시트 초안
- 경로: `docs/fact-audit/<slug>.md` (템플릿: `docs/templates/blog-fact-sheet.md`)
- KO 본문의 **모든 수치·날짜·법적 주장** + tier-1 URL 또는 `[검토 필요]`

### C. sources / references 감사
- `references ⊆ sources`, 무관 URL, 본문 미지원 URL

### D. 사실 드리프트 (ko ↔ en ↔ ja)
**숫자·날짜·고유명사·법 조항·장소명**만 표로 정리 (`## Factual drift`).

### E. 번역 품질 감사 초안 (필수)
- 같은 파일 하단에 `## Translation audit` 섹션 추가  
  또는 `docs/fact-audit/translations/<slug>.md` (템플릿: `docs/templates/blog-translation-audit.md`)

**반드시 ko·en·ja 세 파일을 나란히 읽고** 아래를 점검:

#### E-1. 사실 정합 (번역이 사실을 바꾸는지)
- KO의 수치·연도·고유명사가 EN/JA에서 **동일**한지
- 다르면 D와 중복 표시하되, **번역 오류인지 의도인지** 구분

#### E-2. EN 품질 (`src/data/blog/en/<slug>.md`)
| 점검 | 기준 |
|------|------|
| 주어 | **I** 일관 (We/our/corporate 피함) |
| 톤 | 개인 투자·산책 인사이트, 기관 보고서체 아님 |
| 직역 | 어색한 한국식 직역·장황한 문장 → `calque`로 표기 |
| 구조 | KO와 **동일한 ## 섹션** (누락·순서 뒤바뀜) |
| 이미지 | `![]()` 경로 동일, 캡션·alt **사실·블러 설명** KO와 맞음 |
| 면책 | `informational purposes` 류 문구 존재 |

#### E-3. JA 품질 (`src/data/blog/ja/<slug>.md`)
| 점검 | 기준 |
|------|------|
| 종결 | **です・ます** (だ・である 체 **금지**) |
| 문자 | JA 본문·표에 **한글·영문 단락 혼입** 없음 |
| 오역 | 잘못된 외래 (예: イニシアチブ) → 자연스러운 일본어 후보 제시 |
| 표·시간 | `10月` not `10월`, `土・日・祝` 등 locale 표기 |
| 구조·이미지·면책 | EN과 동일 원칙 (`情報提供` 등) |

#### E-4. EN–JA 관계
- `translation-duplication-feel` similarity **≥ 0.92** 이면 “거의 복붙” 의심 → T1
- EN/JA가 KO보다 **짧게 크게 누락**된 절 있는지

#### E-5. 번역 심각도 (슬러그당 1개)
| 코드 | 의미 |
|------|------|
| **T0** | 잘못된 수치·사실 번역 |
| **T1** | 톤 게이트·대량 직역·locale 오염 |
| **T2** | 캡션·표·단락 누락·경미한 calque |
| **T3** | 양호 |

### F. 종합 위험 등급 (슬러그당)
| 등급 | 기준 |
|------|------|
| **P0** | 무출처 YMYL 수치 또는 **T0** |
| **P1** | 구식 팩트·**T1** 번역 |
| **P2** | 게이트 FAIL·**T2** |
| **P3** | 경미 |

---

## 우선순위

**Wave 1 — 팩트+번역 모두 중요**  
`tokyo-korean-community-beyond-shinokubo`, `korea-japan-inheritance-gift-tax-cross-border-basics`, `japan-visa-paths-*`, `japan-corporate-vs-personal-rental-*`, `tokyo-real-estate-investment-complete-guide`, `tokyo-6-wards-*`, `tokyo-office-vacancy-*`, `weak-yen-*`, `three-things-when-fx-shakes`, `reading-korea-japan-markets-together`, `j-reit-*`, `hotel-reit-*`, `japan-rate-hike-*`, `japan-real-estate-three-things`

**Wave 2 — 산책·가이드 (번역·캡션·장소명 중요)**  
`ginza-weekend-walking-guide`, `ginza-marunouchi-walk-dna`, `nihonbashi-*`, `coredo-*`, `tokyo-ward-guide-*`, `tokyo-five-sophisticated-spots`, `tsukiji-*`, `tokyo-museums-*`, `why-warm-investing-holds`, 기타

## 전체 slug (35)

```
coredo-nihonbashi-mitsui-redevelopment
ginza-marunouchi-walk-dna
ginza-weekend-walking-guide
hotel-reit-vs-office-reit-post-covid
j-reit-five-things-to-know
japan-corporate-vs-personal-rental-after-tax-sketch
japan-rate-hike-cycle-j-reit-three-lessons
japan-real-estate-three-things
japan-visa-paths-permanent-business-manager-asset-holders
korea-japan-inheritance-gift-tax-cross-border-basics
nihonbashi-hamacho-supermarket-peacock-city-life
nihonbashi-hamacho-walking-guide
nihonbashi-mitsui-redevelopment-pipeline-three
nihonbashi-the-origin-of-japan
one-failure-three-lessons-postmortem
reading-korea-japan-markets-together
three-things-when-fx-shakes
tokyo-6-wards-real-estate-insight
tokyo-buying-process-step-by-step
tokyo-core-3-wards-chiyoda-chuo-minato
tokyo-earthquake-vulnerable-five-areas
tokyo-five-sophisticated-spots
tokyo-korean-community-beyond-shinokubo
tokyo-mansion-tsubo-chiyoda-chuo-minato
tokyo-moving-contracts-two-notes
tokyo-museums-with-kids-five-picks
tokyo-office-vacancy-five-wards-2026
tokyo-real-estate-investment-complete-guide
tokyo-shinjuku-shibuya-bunkyo
tokyo-small-rental-yield-vs-capital-gain-breakeven
tokyo-ward-guide-series-prologue
tokyo-yokohama-fuji-transport-pass
tsukiji-to-toyosu-morning-tokyo
weak-yen-korean-japan-asset-allocation-fx-scenarios
why-warm-investing-holds
```

---

## 산출물

### 1) `docs/fact-audit/INDEX.md`

| slug | P | validate | claims | review-needed | fact drift | **T0–T3** | **trans issues** | sheet |
|------|---|----------|--------|---------------|------------|-----------|------------------|-------|

### 2) 슬러그별 `docs/fact-audit/<slug>.md`
- 팩트 시트 + `## Translation audit` (또는 `translations/<slug>.md`)

### 3) `docs/fact-audit/AG_PHASE1_REPORT.md`

```markdown
## 요약
- slug: N/35
- P0: … | T0 번역: … | T1: …
- validate PASS/FAIL, 번역 관련 FAIL 상위 목록

## Cursor 2차
1. P0 + T0 slug
2. ja-formal-tone / disclaimer / ko-formal-tone 일괄
3. EN I-voice, JA ですます, 한글 혼입 제거

## AG 미수정 확인
- [ ] ko/en/ja md 미변경
- [ ] git push 없음
```

## 작업 방식
- **5~7 slug/회**, Wave 순서
- 번역은 **세 locale 파일 동시 오픈** 후 비교

## 완료 정의
- 35 slug INDEX + fact sheet + **translation audit 초안**
- 보고 말미: **「팩트·번역 1차 초안 완료, Cursor 재검증 대기」** (발행 가능 금지)

`docs/fact-audit/` 폴더 만들고 Wave 1 첫 slug부터 시작해줘.
```

---

## Cursor 2차 지시 (AG 1차 완료 후) — **완료 시 3차 루프로**

1차(감사만) → Cursor 2차(게이트) → **AG 2.5(본문 수정)** → **Cursor 3차(재검증)**

| 단계 | 붙여넣을 문서 |
|------|----------------|
| Cursor 2차 (1차 직후) | 아래 블록 또는 `CURSOR_PHASE2` 완료 보고 참고 |
| **AG 2.5 (지금 권장)** | [`AG_PHASE2_CONTENT_FIX_PROMPT.md`](./AG_PHASE2_CONTENT_FIX_PROMPT.md) |
| **Cursor 3차 (AG 2.5 후)** | [`CURSOR_PHASE3_REVERIFY_PROMPT.md`](./CURSOR_PHASE3_REVERIFY_PROMPT.md) |

```markdown
AG 1차 팩트·번역 감사 완료. `docs/fact-audit/INDEX.md` 기준으로:
1. P0·T0 slug — URL·수치·번역 사실 오류 수정
2. T1 — EN I-voice, JA ですます, 한글 혼입, disclaimer
3. slug마다 `pnpm validate:post` exit 0
커밋은 내가 요청할 때만.
```

**AG 2.5 완료 후 Cursor 3차 (복사용):**

```markdown
AG Phase 2.5 수정 완료. docs/fact-audit/AG_PHASE2_FIX_REPORT.md 와 변경 slug 기준 Cursor 3차 재검증. docs/CURSOR_PHASE3_REVERIFY_PROMPT.md 절차. commit 금지.
```

---

## 참고 (validate 스캔 2026-05-25)

35/35 slug 당시 `validate:post` **FAIL** 다수 (`ko-formal-tone`, `ja-formal-tone`, `disclaimer-present` 등). AG는 기록만, 수정은 Cursor.
