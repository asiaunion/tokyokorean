# Spec: GSC 잔여 404 — archive + 레거시 태그 슬러그 308 (코딩 전용)

> **대상:** 안티그래비티 Gemini 에이전트  
> **작성:** Cursor (2026-05-18)  
> **목표:** Search Console `찾을 수 없음(404)` 샘플 URL 중 **아직 404인 태그·archive 경로**만 서버 308으로 정리  
> **범위:** **코딩만** — `vercel.json`만 수정. 분석·문서·애드센스·GSC 콘솔 작업 금지.

---

## 1. 한 줄 요약

이전 작업(태그 `/2/` 페이지네이션 6규칙, 커밋 `e81ceea`·`a175179`)은 **완료·배포됨 — 재작업 금지**.

**이번 작업:** `vercel.json`에 **§4.1 archive 3규칙** + **§4.2 레거시 슬러그 고정 308**만 추가.  
삽입 위치: WP 와일드카드 블록(3행) **직후**, **기존 태그 페이지네이션 6규칙보다 위** (먼저 매칭되도록).

배포 후 **사이트 소유자**가 GSC 404 수정 검증·URL 검사·2~4주 대기 (에이전트 작업 아님).

---

## 2. 배경 (읽기 전용)

GSC 404 샘플 55건 중:

| 상태 | 예시 | 이번 작업 |
|------|------|-----------|
| 이미 308/200 | `/ko/tags/nihonbashi/2/`, `/ja/tags/travel/`, WP `wp-*` | **건드리지 않음** |
| 308 → 최종 404 | `/tags/니혼바시/2/` → `/tags/니혼바시/` (404) | **§4.2** 으로 canonical로 직접 308 |
| 계속 404 | `/ja/tags/archive/`, `/tags/旅行/`, `/ko/tags/贈与税/` | **§4.1·§4.2** |

**사이트 규칙 (추정 금지):**

- 기본 locale `/tags/{slug}/` → 영문 slug (`nihonbashi`, `travel`, `hotel` …)
- 한국어 전용 slug → `/ko/tags/{slug}/` (예: `부동산`, `투자`, `도쿄-6-구`)
- 일부 일본어 slug → `/ja/tags/{slug}/` (예: `都心ライフ`, `贈与税`, `東京ライフ`)
- **§4.2 destination은 표에 적힌 URL만 사용.** 임의로 `/tags/` 홈만 보내지 말 것 (Soft 404 위험).

---

## 3. 작업 범위

### ✅ IN SCOPE

1. `vercel.json` — §4.1 + §4.2 규칙 **그대로** 추가
2. `node -e "JSON.parse(...)"` 로 JSON 유효성 확인
3. §5 `curl` 스모크 (최소 5건)
4. 커밋 1개: `fix(seo): 308 redirect GSC legacy tag slugs and tags/archive`

### ❌ OUT OF SCOPE (절대 금지)

| 금지 | 이유 |
|------|------|
| 기존 **태그 페이지네이션 6규칙** 수정·삭제·순서 변경 | `e81ceea`/`a175179` 완료 |
| WP `/author/`, `/wp-*`, `/feed/` 재추가 | 3행에 이미 존재 |
| `/ko/posts/...` → `/posts/...` 리다이렉트 | KO canonical·hreflang 손상 |
| `astro.config.ts`, `remark-gfm`, noindex, 사이트맵 | 범위 외 |
| `/(.*)/[0-9]+` 등 **와일드카드 일괄** 규칙 | 과매칭·Vercel 한도 위험 |
| §4.2 표 **없는** URL 임의 추가·삭제 | GSC 샘플 기준만 |
| 새 `.md` 보고서·애드센스 재신청 안내·GSC 클릭 | 코딩만 |
| `vercel.json` 기존 674+ cross-locale 규칙 **병합·재생성** | 1024 한도·회귀 위험 |
| NOINDEX 제거·태그 페이지 noindex 해제 | V8 thin-content 정책 |

---

## 4. 구현 지시

### 4.1 삽입 위치 (필수)

```
redirects[0]  = WP 와일드카드 1줄 (기존 유지)
redirects[1…] = 【이번에 추가】 §4.1 + §4.2  ← 여기
redirects[…]  = 【기존 유지】 태그 페이지네이션 6규칙 (:page)
redirects[…]  = 【기존 유지】 /en/:path, 한글 포스트, cross-locale 태그 …
```

- WP 3행 **내용 변경 금지**
- 페이지네이션 6규칙 **아래로 내리거나 삭제하지 말 것** — 위에 새 규칙만 **삽입**

### 4.2 §4.1 — `tags/archive` (필수 3규칙)

```json
{"source":"/tags/archive/","destination":"/tags/","permanent":true},
{"source":"/ko/tags/archive/","destination":"/ko/tags/","permanent":true},
{"source":"/ja/tags/archive/","destination":"/ja/tags/","permanent":true}
```

### 4.3 §4.2 — 레거시 슬러그 (필수 48규칙)

각 행마다 **trailing slash 있음·없음 2규칙** 추가.  
`"permanent": true` (308) 유지.

| # | source (trailing `/` 유무 둘 다) | destination |
|---|----------------------------------|-------------|
| 1 | `/tags/니혼바시/` | `/tags/nihonbashi/` |
| 2 | `/ja/tags/니혼바시/` | `/tags/nihonbashi/` |
| 3 | `/tags/日本橋/` | `/tags/nihonbashi/` |
| 4 | `/tags/부동산/` | `/ko/tags/부동산/` |
| 5 | `/ja/tags/부동산/` | `/ko/tags/부동산/` |
| 6 | `/tags/투자/` | `/ko/tags/투자/` |
| 7 | `/tags/旅行/` | `/tags/travel/` |
| 8 | `/ko/tags/旅行/` | `/tags/travel/` |
| 9 | `/tags/호텔/` | `/tags/hotel/` |
| 10 | `/ja/tags/호텔/` | `/tags/hotel/` |
| 11 | `/ko/tags/贈与税/` | `/ja/tags/贈与税/` |
| 12 | `/tags/都心ライフ/` | `/ja/tags/都心ライフ/` |
| 13 | `/ko/tags/都心ライフ/` | `/ja/tags/都心ライフ/` |
| 14 | `/tags/東京ライフ/` | `/ja/tags/東京ライフ/` |
| 15 | `/ko/tags/東京ライフ/` | `/ja/tags/東京ライフ/` |
| 16 | `/tags/kスタートアップ/` | `/ko/tags/k-스타트업/` |
| 17 | `/ko/tags/kスタートアップ/` | `/ko/tags/k-스타트업/` |
| 18 | `/tags/도쿄-6-구/` | `/ko/tags/도쿄-6-구/` |
| 19 | `/ja/tags/도쿄-6-구/` | `/ko/tags/도쿄-6-구/` |
| 20 | `/tags/토쿄토치/` | `/ko/tags/토쿄토치/` |
| 21 | `/ja/tags/토쿄토치/` | `/ko/tags/토쿄토치/` |
| 22 | `/tags/완전가이드/` | `/ko/tags/완전가이드/` |
| 23 | `/ja/tags/완전가이드/` | `/ko/tags/완전가이드/` |
| 24 | `/tags/니혼바시/:page(\\d+)/` | `/tags/nihonbashi/` |
| 25 | `/ja/tags/니혼바시/:page(\\d+)/` | `/tags/nihonbashi/` |
| 26 | `/tags/日本橋/:page(\\d+)/` | `/tags/nihonbashi/` |
| 27 | `/tags/부동산/:page(\\d+)/` | `/ko/tags/부동산/` |
| 28 | `/ja/tags/부동산/:page(\\d+)/` | `/ko/tags/부동산/` |
| 29 | `/tags/투자/:page(\\d+)/` | `/ko/tags/투자/` |

**§4.3 작성 규칙:**

- 표 #1–23: `source`를 `/path/` 와 `/path` 두 객체로 (archive와 동일 패턴).
- 표 #24–28: **페이지네이션 전용** — `:page(\\d+)` 와 `:page(\\d+)/` 각 1객체 (총 10객체). destination은 **페이지 번호 없는 canonical**.
- JSON `source`에 **UTF-8 한·일 문자 그대로** 사용 (기존 `vercel.json` 한글 포스트 규칙과 동일).
- 표에 없는 slug **추가하지 말 것**.

**예시 (표 #1 한 쌍):**

```json
{"source":"/tags/니혼바시/","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/니혼바시","destination":"/tags/nihonbashi/","permanent":true}
```

**예시 (표 #24 한 쌍):**

```json
{"source":"/tags/니혼바시/:page(\\d+)/","destination":"/tags/nihonbashi/","permanent":true},
{"source":"/tags/니혼바시/:page(\\d+)","destination":"/tags/nihonbashi/","permanent":true}
```

**추가 규칙 수:**

- archive: 3  
- #1–23 slug root: 23 × 2 = 46  
- #24–29 pagination override: 6 × 2 = 12  
- **합계: 61 rules** (이 개수를 정확히 맞출 것)

### 4.4 308 vs 301

- `"permanent": true` 유지 (사이트 전역 308과 일치). **301로 바꾸지 말 것.**

### 4.5 JSON·한도

- 쉼표 누락 없이 valid JSON
- redirects 총 개수 **1024 미만** 유지 (현재 ~688 + 61 ≈ 749 — 안전)

---

## 5. 검증 (배포 후 필수)

아래는 **최종 URL이 200 또는 308→200** 이어야 함 (`curl -sI -L`).

```bash
# archive
curl -sI https://gsfark.com/ja/tags/archive/ | grep -iE 'HTTP/|location:'
# 기대: 308 → /ja/tags/

# 레거시 slug
curl -sI -L https://gsfark.com/tags/니혼바시/2/ | grep -iE '^HTTP/'
# 기대: 최종 200 (nihonbashi)

curl -sI -L https://gsfark.com/tags/부동산/2/ | grep -iE '^HTTP/'
# 기대: 최종 200 (ko/tags/부동산)

curl -sI https://gsfark.com/tags/旅行/ | grep -iE 'HTTP/|location:'
# 기대: 308 → /tags/travel/

curl -sI https://gsfark.com/ko/tags/贈与税/ | grep -iE 'HTTP/|location:'
# 기대: 308 → /ja/tags/贈与税/

# 회귀 — 이미 되던 것
curl -sI https://gsfark.com/ko/tags/nihonbashi/2/ | grep -iE 'HTTP/|location:'
# 기대: 308 → /ko/tags/nihonbashi/ (변경 없음)
```

**실패 시:** 규칙 순서(§4.1 삽입 위치), source 오타, destination 404 여부만 확인. **표 밖 추측 규칙 추가 금지.**

---

## 6. Definition of Done

- [ ] §4.1 archive 3규칙 추가
- [ ] §4.2 표 #1–29 규칙 **61개** 추가 (개수 일치)
- [ ] WP 3행·페이지네이션 6규칙·기존 cross-locale 규칙 **무수정**
- [ ] JSON 파싱 OK
- [ ] §5 curl 5건 이상 성공 (커밋 본문에 결과 1줄씩)
- [ ] **§3 OUT OF SCOPE 항목 0건**

---

## 7. 배포 후 — 사이트 소유자 (코딩 아님, 실행 금지)

1. Vercel 배포 완료 대기  
2. GSC → **찾을 수 없음(404)** 만 **수정 검증** (NOINDEX 등 다른 카테고리 검증 시작하지 말 것)  
3. URL 검사: `…/ja/tags/archive/`, `…/tags/니혼바시/2/`, `…/tags/旅行/` 등 **색인 생성 요청**  
4. **2~4주 대기** 후 404 건수 감소 확인  
5. 그 후 애드센스 재신청  

---

## 8. 관련 문서 (읽기만, 수정 금지)

- `spec-gsc-tag-pagination-redirects-20260518.md` — 이전 작업(완료)
- `spec-search-console-analysis-20260518.md` — Gemini 원본 분석

---

## 9. 안티그래비티에 붙일 프롬프트 (복사용)

```
GSF-Blog: docs/antigravity-context/spec-gsc-legacy-tag-redirects-20260518.md 를 읽고 코딩만 수행하라.

- vercel.json redirects: WP 3행 직후에 §4.1 archive 3규칙 + §4.2 표 #1–29 (총 61규칙)을 삽입한다. 기존 태그 페이지네이션 6규칙은 그 아래에 두고 수정하지 않는다.
- §4.2 destination URL은 표와完全一致. 추측·일괄 /tags/ 폴백·표 외 slug 추가 금지.
- astro.config, noindex, WP 규칙 재추가, /ko/posts 리다이렉트, 애드센스, GSC 작업, 새 md 작성 금지.
- 배포 후 §5 curl 5건 이상 확인. 커밋: fix(seo): 308 redirect GSC legacy tag slugs and tags/archive
- 계획된 61규칙 이외 작업을 하면 실패로 간주한다.
```
