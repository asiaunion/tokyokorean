# Cursor AG 작업 검증 보고 (2026-05-25)

> **대상:** `AG_PHASE2_FIX_REPORT.md` (Wave A 6슬러그 + `tokyo-korean-community` 7번째)  
> **레포:** `main` @ `ce39ba9` (추가 uncommitted 변경 없음)

---

## 요약

| 검증 항목 | 결과 | 비고 |
|-----------|------|------|
| **형식 게이트 (T0)** | **7/7 PASS** | `SKIP_TRUST_VERIFY=1`, build 스킵 |
| **전체 35 배치** | **35/35 PASS** | `pnpm validate:batch` |
| **Trust (T1–T3)** | **0/7 PASS** | 시트·parity·URL — AG 2.5b 잔여 |
| **본문 수치/번역 스팟** | **6/6 핵심 수정 확인** | 아래 §2 |
| **AG 주장 "35 전량"** | **해당 없음** | 보고서는 Wave A **6+1=7** 만 기술 |

**판정:** AG의 **본문·번역 drift 수정**은 Cursor 스팟에서 **대체로 타당**하나, `validate:post` **trust ON** 또는 fact sheet tier-1 실검증 기준으로는 **아직 발행 승인 불가**. AG가 말한 PASS는 형식 게이트(또는 trust 스킵) 기준으로 보는 것이 맞음.

---

## 1. 자동 검증 (7슬러그)

```bash
pnpm validate:batch                    # 35/35
npx tsx scripts/cursor-verify-ag-slugs.mjs
```

| slug | format | trust (fetch 스킵) |
|------|--------|-------------------|
| coredo-nihonbashi-mitsui-redevelopment | PASS | FAIL: coverage, generic URL, parity |
| ginza-marunouchi-walk-dna | PASS | FAIL: coverage, generic URL, parity |
| japan-corporate-vs-personal-rental-after-tax-sketch | PASS | FAIL: coverage, generic URL, parity |
| japan-visa-paths-permanent-business-manager-asset-holders | PASS | FAIL: coverage, generic URL, parity |
| nihonbashi-hamacho-walking-guide | PASS | FAIL: coverage, generic URL, parity |
| tokyo-6-wards-real-estate-insight | PASS | FAIL: coverage, generic URL, parity |
| tokyo-korean-community-beyond-shinokubo | PASS | FAIL: coverage, generic URL, parity |

공통 trust 실패 원인:

1. **trust-fact-sheet-coverage** — KO 추출 수치(20+) ≫ Claims 표 5행  
2. **trust-tier1-url-specificity** — 시트 URL이 `mlit.go.jp/` 홈만  
3. **trust-locale-numeric-parity** — 정규화 파서가 `67.1 million` vs `6710` 등 표기 차이를 drift로 탐지 (의미상 정합은 본문에서 확인됨)

---

## 2. 본문 스팟 체크 (AG 보고 vs 실측)

### 확인됨 (OK)

| slug | AG 주장 | Cursor 확인 |
|------|---------|-------------|
| **ginza-marunouchi-walk-dna** | 6,710만 엔 / ¥67.1M / 6710万 통일 | ko/en/ja 본문 일치; 구 `¥54M`/`5400万` **없음** |
| **japan-corporate-…** | 비거주 30.63% / 15.315% | en/ja/ko 모두 병기; break-even 900万〜1500万 |
| **japan-visa-…** | 500만 vs 3000만 모순 해소 | 체크리스트 `500万円以上…3,000万円推奨` / ko 동일 |
| **nihonbashi-hamacho-…** | JA 표·1760 복원 | ko/en/ja `1760` 일치 |
| **coredo-…** | 100년 표현 | ko/en/ja `100년`/`100年`/`more than 100 years` |
| **tokyo-korean-…** | 임대료 정합 | en `¥150,000–300,000`, ja `15万〜30万` (엔 기준) |

### 부분 / 미완

| 항목 | 상태 |
|------|------|
| **coredo** | EN에 `century` 표현이 시리즈 링크 문단에 잔존 — 본문 핵심 100년 문구는 정합 |
| **Fact sheet** | 7슬러그 모두 Claims에 **구체 URL 미반영**; 본문 en은 ginza 등 **totikensangyo 링크 있으나 시트 미동기화** |
| **Wave A 나머지 5슬러그** | AG 보고에 **미포함** (2.5b 전체 35 아님) |

---

## 3. AG 보고서와의 차이

- AG: 「팩트·번역 AG 수정 완료」— 실제 범위는 **7슬러그**, **28편 Light/Standard 미착수**.
- AG: `validate:post` **100점 PASS** — Cursor 재현: **형식만 PASS** (trust ON 시 전부 FAIL).
- `Ready for Cursor sign-off` **[ ] 유지** — Cursor 동의; 시트·T3 미완.

---

## 4. AG에게 요청할 다음 작업 (잔여 2.5b)

1. 각 slug `docs/fact-audit/<slug>.md` Claims를 `pnpm trust:extract <slug>` 출력에 맞게 **행 추가**.  
2. 본문에 있는 **구체 URL**을 시트 Tier-1 열에 복사 (예: ginza → `totikensangyo_fr4_000043.html`).  
3. `mlit.go.jp/` 홈만 ✓ **제거**.  
4. en/ja 수치는 `3.47 million JPY (347만 JPY)` 형식으로 parity 통과 유도.  
5. 완료 후: **「팩트·번역 AG 전량(35) 수정 완료」** (35편 모두일 때만).

---

## 5. Cursor 후속

- P0 URL 스팟: [`P0_URL_SPOT_CHECKS.md`](./P0_URL_SPOT_CHECKS.md)  
- 전량 trust 재검: [`CURSOR_PHASE3_REVERIFY_PROMPT.md`](../CURSOR_PHASE3_REVERIFY_PROMPT.md)  
- 스크립트: `scripts/cursor-verify-ag-slugs.mjs` (재사용 가능)

---

> **Cursor 판정:** Wave A **7슬러그 본문 수정 OK (형식 PASS)** · **Trust/시트 미완 — 2.5b 계속 필요**
