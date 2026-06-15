# Cursor 지시: AG Phase 2.5 이후 3차 재검증

> **Status (2026-05-25):** Phase 3 **완료**. 운영 정책: [`fact-audit/T3_POLICY.md`](./fact-audit/T3_POLICY.md). 다음: [`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md).  
> 아래 프롬프트는 **역사 보관** — 새 배치 T3 35/35 목표로 쓰지 말 것.

> **용도:** AG가 fact-audit 시트 기준으로 md를 수정한 뒤, Cursor에 **붙여넣기**할 재검증 프롬프트.  
> **선행:** [`AG_PHASE2_CONTENT_FIX_PROMPT.md`](./AG_PHASE2_CONTENT_FIX_PROMPT.md) 완료 + `AG_PHASE2_FIX_REPORT.md`  
> **정본 레포:** `/Users/gsf/dev/Cursor/gsf-blog`

---

## Cursor에 붙여넣기 (전체 배치)

```markdown
# [GSF-Blog] Cursor 3차 — AG Phase 2.5 수정분 재검증

## 상황
- AG 1차: `docs/fact-audit/*` 감사 초안
- Cursor 2차: validate 35/35, 면책·게이트·일부 팩트 ([CURSOR_PHASE2_REPORT.md](./fact-audit/CURSOR_PHASE2_REPORT.md))
- AG 2.5: 시트 기준 ko/en/ja 수정 + tier-1 검증 (`AG_PHASE2_FIX_REPORT.md`)

## 역할
**재검증·잔여 수정·보고만.** 사용자가 요청하기 전까지 **git commit/push 금지.**

## 절차

### 1) 변경 범위 파악
```bash
cd /Users/gsf/dev/Cursor/gsf-blog
git status
git diff --stat
```
- `docs/fact-audit/AG_PHASE2_FIX_REPORT.md` 에서 수정 slug 목록 추출
- 없으면 `git diff --name-only src/data/blog/` 로 slug 유도

### 2) 슬러그별 검증 (수정된 slug 전부 + Wave A P0 잔여)
각 slug에 대해:

**A. 시트 대조**
- `docs/fact-audit/<slug>.md` Claims ✓ vs KO 본문 수치
- AG가 ✓ 한 URL을 **직접 열어** 1~2개 스팟 체크 (전수는 P0만)
- Factual drift 표 — ko/en/ja 숫자·단위·고유명사 일치

**B. 자동 게이트**
```bash
pnpm validate:post <slug>          # build 포함, 최종 PASS 기준
# 빠른 스캔만:
SKIP_VALIDATE_BUILD=1 node scripts/batch-validate-posts.mjs
```

**C. 번역 스팟**
- EN: **I** not We (T1 slug)
- JA: です・ます, 표에 한글 없음
- 이미지 경로 ko=en=ja 동일, 캡션 사실·블러 문구

**D. 최소 수정**
- validate FAIL → `validationGates.ts` / runbook 기준 최소 md 수정
- AG ✓가 오류면 시트에서 ✓ 제거 + 본문 완화
- 시트 `Ready for Cursor sign-off` [x] 후 `pnpm validate:post` exit 0 확인 시 Sign-off의 validate [x]

### 3) 배치 요약 (전수 — AG 35개 재작업 후)
```bash
SKIP_VALIDATE_BUILD=1 node scripts/batch-validate-posts.mjs
pnpm run build
```
- **35/35** 게이트 + **build 1회** (slug마다 build 반복 금지)
- FAIL slug는 2) 반복; PASS여도 **P0/P1은 Claims 스팟 1건** 이상 URL 확인
- `docs/fact-audit/INDEX.md` validate 열 **실측으로 전량 덮어쓰기** (AG 메모와 불일치 시 Cursor 기준)

### 4) 보고서
`docs/fact-audit/CURSOR_PHASE3_REPORT.md` 작성:

| 항목 | 내용 |
|------|------|
| validate | PASS x/35, FAIL 목록·게이트 |
| AG 수정 검수 | 슬러그별 OK / 재수정 / 시트 ✓ 철회 |
| 잔여 P0 | tier-1 미확인 클레임 |
| Cursor가 고친 파일 | 경로 목록 |

`docs/fact-audit/INDEX.md` 상단 상태 문구 갱신.

### 5) 완료 문구
**「Cursor 3차 재검증 완료 — validate N/35, 커밋 대기」**

## 우선순위
1. `AG_PHASE2_FIX_REPORT.md`에 열거된 slug
2. INDEX **P0** / fact drift **N**
3. 나머지 35 slug 배치 validate

시작: `git diff --stat` 후 AG가 건드린 첫 slug부터 `pnpm validate:post` 실행.
```

---

## Cursor에 붙여넣기 (단일 slug)

```markdown
AG가 `<slug>` ko/en/ja 수정함. Cursor 3차:
1. `docs/fact-audit/<slug>.md` vs 본문 클레임 대조 (AG ✓ 스팟 검증)
2. ko/en/ja 드리프트
3. `pnpm validate:post <slug>` exit 0
4. 시트 Sign-off validate [x], INDEX 갱신
commit 없이 결과만 보고.
```

---

## Cursor에 붙여넣기 (AG 보고만 있고 diff 없을 때)

```markdown
`docs/fact-audit/AG_PHASE2_FIX_REPORT.md`만 있고 repo diff가 없다.
- 보고서 slug 목록으로 fact-audit 시트만 검토할지, AG 재실행을 권할지 판단해줘.
- 있으면 3차 절차, 없으면 Wave A P0 slug 5개만 `pnpm validate:post` 재확인.
```

---

## 도구 참고

| 명령 | 용도 |
|------|------|
| `pnpm validate:post <slug>` | 최종 PASS (build 포함) |
| `SKIP_VALIDATE_BUILD=1 node scripts/batch-validate-posts.mjs` | 35 slug 빠른 스캔 |
| `node scripts/ko-length-report.mjs` | KO 길이 SHORT/LONG |
| `node scripts/apply-phase2-gates.mjs` | 면책·위험어 (이미 적용 시 idempotent) |

---

## 루프 다시 돌릴 때

| 단계 | 담당 | 트리거 문구 |
|------|------|-------------|
| AG 2.5 | Antigravity | `AG_PHASE2_CONTENT_FIX_PROMPT.md` 붙여넣기 |
| Cursor 3차 | Cursor | 이 문서 붙여넣기 |
| AG 2.5b (선택) | Antigravity | 「Cursor 3차 FAIL 목록만 AG에 재수정」— `CURSOR_PHASE3_REPORT.md`의 FAIL 표 첨부 |
| Cursor 3차b | Cursor | 동일 프롬프트, slug FAIL만 |

---

## Related

- [`BLOG_AG_CURSOR_WORKFLOW.md`](./BLOG_AG_CURSOR_WORKFLOW.md)
- [`BLOG_FACT_CHECK_WORKFLOW.md`](./BLOG_FACT_CHECK_WORKFLOW.md)
