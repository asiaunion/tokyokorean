# Spec: vercel.json 레거시 블록 중복 리다이렉트 제거 (코딩 전용)

> **대상:** 안티그래비티 Gemini  
> **작성:** Cursor (2026-05-18)  
> **전제:** `04bf59a` (핫픽스) 동작 **유지** — URL 동작은 바꾸지 않고 **중복 객체만 삭제**  
> **범위:** `vercel.json`만 · **삭제 6객체** (추가 0)

---

## 1. 한 줄 요약

`04bf59a` 핫픽스 과정에서 레거시 블록(`feed` 다음 ~ `tags/:tag/:page` 직전)에 **완전 동일한 source+destination 규칙 6개**가 중복 들어갔다.  
**아래 6개만 삭제**한다. 나머지 759−6=753개 규칙·순서·내용은 유지.

---

## 2. 삭제 대상 (정확히 6개)

`redirects` 배열에서 **source + destination + permanent 가 모두 동일한 두 번째 이후 항목**을 제거한다.  
(검색 키: 아래 `source` 문자열 — **첫 번째 매칭은 유지**, **두 번째만 삭제**)

| # | 삭제할 `source` (두 번째 등장분) | `destination` |
|---|----------------------------------|---------------|
| 1 | `/tags/%e6%97%a5%e6%9c%ac%e6%a9%8b/:page(\\d+)/` | `/tags/nihonbashi/` |
| 2 | `/tags/%e6%97%a5%e6%9c%ac%e6%a9%8b/:page(\\d+)` | `/tags/nihonbashi/` |
| 3 | `/tags/%EB%8B%88%ED%98%BC%EB%B0%94%EC%8B%9C/` | `/tags/nihonbashi/` |
| 4 | `/tags/%EB%8B%88%ED%98%BC%EB%B0%94%EC%8B%9C` | `/tags/nihonbashi/` |
| 5 | `/tags/%EB%8B%88%ED%98%BC%EB%B0%94%EC%8B%9C/:page(\\d+)/` | `/tags/nihonbashi/` |
| 6 | `/tags/%EB%8B%88%ED%98%BC%EB%B0%94%EC%8B%9C/:page(\\d+)` | `/tags/nihonbashi/` |

### 위치 힌트 (`04bf59a` 기준, 삭제만 — 재정렬 금지)

- **#1–2:** `%e6%97%a5…/:page` 규칙이 **연속 4개** 있음 → **아래 2개** 삭제 (위 2개 유지).
- **#3–6:** `%eb%8b%88…` 소문자 4규칙 **바로 다음**에 있는 **대문자 `%EB%8B%88…` 4개 전체** 삭제.  
  (대문자 root·page는 **블록 앞쪽**·**pagination 구간**에 이미 있음.)

### 유지해야 할 것 (삭제 금지)

| 유지 | 이유 |
|------|------|
| `/tags/%EB%8B%88…/` root (블록 상단, archive 다음) | 첫 등장 |
| `/tags/%EB%8B%88…/:page(\\d+)` (ja 포함, pagination 구간) | 첫 등장 |
| `/tags/%eb%8b%88…/` 소문자 4규칙 (투자 pagination 다음) | 핫픽스 C절 |
| `/tags/%e6%97%a5…/:page` **위쪽 2개** | 日本橋 pagination |
| archive 3, slug 46, 부동산·투자 pagination, WP 8, 페이지네이션 6 | 전부 유지 |

---

## 3. OUT OF SCOPE (절대 금지)

- 규칙 **추가** (0개)
- destination·`permanent`·source **수정**
- WP·cross-locale·페이지네이션 6·archive·slug 블록 **재작성**
- `astro.config`, noindex, GSC, 애드센스, 새 md
- 전역 중복 스캔 후 **6개 외** 임의 삭제
- `vercel.json` **포맷 전체 재정렬** (Prettier 일괄)

---

## 4. 검증

```bash
# 중복 0 (레거시 블록 내 source+dest 쌍)
node -e "
const j=JSON.parse(require('fs').readFileSync('vercel.json'));
const f=j.redirects.findIndex(x=>x.source==='/feed/');
const p=j.redirects.findIndex(x=>x.source==='/tags/:tag/:page(\\\\d+)');
const b=j.redirects.slice(f+1,p);
const k=b.map(r=>r.source+'|'+r.destination);
const d=k.filter((x,i)=>k.indexOf(x)!==i);
console.log('legacy size',b.length,'dups',d.length);
"

# 기대: legacy size 65, dups 0
# redirects 총 753

grep -c '%5Cd' vercel.json   # 0

curl -sI -L "https://gsfark.com/tags/니혼바시/2/" | tail -1 | grep 200
curl -sI -L "https://gsfark.com/tags/日本橋/2/" | tail -1 | grep 200
```

---

## 5. Definition of Done

- [ ] 위 **6개 객체 삭제**만 수행
- [ ] 레거시 블록 **65규칙**, 전체 **753 redirects**
- [ ] §4 curl·`%5Cd` 회귀 통과
- [ ] 커밋: `chore(seo): remove duplicate vercel legacy tag redirects`

---

## 6. 안티그래비티 프롬프트 (복사용)

```
GSF-Blog: docs/antigravity-context/spec-vercel-redirect-dedup-20260518.md 만 읽고 코딩하라.

- vercel.json에서 §2 표의 중복 6규칙만 삭제. 추가 0, 수정 0.
- 첫 번째 등장은 유지, 두 번째 등장만 삭제. %eb%8b%88 블록 다음 대문자 EB%8B%88 4개 전체 삭제. %e6%97%a5 page 4개 중 아래 2개 삭제.
- WP·archive·slug·pagination 6·cross-locale 재작성 금지.
- 배포 후: legacy 65규칙·curl 니혼바시/2·日本橋/2 최종 200. grep '%5Cd' → 0.
- 커밋: chore(seo): remove duplicate vercel legacy tag redirects
- 6개 외 삭제·추가는 실패.
```
