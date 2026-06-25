# AG TASK — 태그 페이지 · 주제 허브 수정
> 생성: 2026-06-24  
> 우선순위: ⭐⭐ (태그/허브 노출 결함 — AdSense 심사 전 해결 권장)

---

## 문제 요약

### 문제 1 — `/tags/` 페이지 빈 화면
**원인:** `src/pages/tags/index.astro` L22에서 locale이 `undefined`이면 `lang = "en"`으로 설정됨.  
그러면 `getCollection("blog", id.startsWith("en/"))` 호출 → en 포스트 없음 → 태그 목록 빈 배열.  
현재 사이트는 ko 단일 운영이므로 이 분기가 잘못됨.

### 문제 2 — `/topics/` 허브 전체 "준비 중" 표시
**원인:** `src/data/topicHubs.ts`에 하드코딩된 슬러그 20개가 **구 사이트(부동산/투자 포커스)** 기준이라  
현재 실제 ko 포스트와 하나도 매핑되지 않음. `getEntry()` 전부 null 반환.

---

## 작업 1 — 태그 페이지 수정

**파일:** `src/pages/tags/index.astro`

**수정 내용:** locale undefined 시 "en" 대신 "ko"로 처리

```diff
- const lang = locale || "en";
+ const lang = (locale === "ko" || locale === "ja") ? locale : "ko";
```

**검증:** 빌드 후 `/tags/` 페이지에 태그 목록이 표시되는지 확인.  
현재 ko 포스트 20편의 태그들이 나와야 함.

---

## 작업 2 — 주제 허브 슬러그 업데이트

**파일:** `src/data/topicHubs.ts`

현재 실제 ko 포스트 20편 슬러그:
```
japan-banking-credit-card
japan-convenience-store-must-buys
japan-elderly-care-frontline
japan-garbage-disposal-rules
japan-healthcare-hospital-visit
japan-korea-work-culture-diff
japan-language-learning-survival-japanese
japan-life-8years-honest
japan-married-to-japanese-culture-diff
japan-seasons-matsuri-culture
nihonbashi-buying-property-foreigner
nihonbashi-hidden-cafes
nihonbashi-history-and-modern-life
nihonbashi-why-i-live-here
tokyo-housing-rental-process
tokyo-korean-community-culture
tokyo-life-cost-of-living
tokyo-public-transportation-tips
tokyo-supermarket-guide
tokyo-weekend-getaway-spots
```

**허브별 배치 (i18n 라벨과 일치시킬 것):**

| 허브 키 | 라벨 (ko) | 배치할 슬러그 |
|---------|-----------|--------------|
| `urbanInvestment` | 일본 생활 실용 정보 | `japan-garbage-disposal-rules`, `japan-banking-credit-card`, `tokyo-housing-rental-process`, `japan-healthcare-hospital-visit`, `tokyo-public-transportation-tips` |
| `macroPolicy` | 한일 문화 비교 | `japan-korea-work-culture-diff`, `japan-married-to-japanese-culture-diff`, `japan-life-8years-honest`, `japan-language-learning-survival-japanese`, `japan-seasons-matsuri-culture` |
| `tokyoLife` | 도쿄 로컬 동네 | `nihonbashi-history-and-modern-life`, `nihonbashi-why-i-live-here`, `nihonbashi-hidden-cafes`, `tokyo-supermarket-guide`, `japan-convenience-store-must-buys`, `tokyo-weekend-getaway-spots` |
| `essay` | 에세이 및 일본어 팁 | `nihonbashi-buying-property-foreigner`, `tokyo-life-cost-of-living`, `tokyo-korean-community-culture`, `japan-elderly-care-frontline` |

**주의:** `as const` 타입 때문에 슬러그 철자가 정확해야 함. 위 목록을 그대로 복사할 것.

---

## 작업 3 (선택) — 허브 라벨/설명 개선

현재 `src/i18n/ui.ts`의 `topicHubs` 라벨이 내용과 잘 맞지 않음.  
허브 키 이름(`urbanInvestment`, `macroPolicy`)이 구 사이트(부동산 투자) 기준.  
**라벨 텍스트만 수정** — 키 이름은 타입 의존성 때문에 변경 금지.

제안:
```ts
urbanInvestment: {
  title: "일본 생활 실용 정보",
  description: "비자·은행·집 구하기·병원·교통 등 일본 정착 실전 가이드.",
},
macroPolicy: {
  title: "한일 문화 비교",
  description: "직장·식문화·결혼·언어까지, 8년 거주자가 느낀 한일 차이.",
},
tokyoLife: {
  title: "도쿄 니혼바시 로컬",
  description: "니혼바시 카페·마트·편의점·근교 여행까지 실거주 생활 정보.",
},
essay: {
  title: "일본 생활 에세이",
  description: "내 집 마련, 생활비, 커뮤니티 등 솔직한 일본 생활 기록.",
},
```
→ 작업 3은 Joseph 확인 후 반영. 먼저 작업 1·2로 기능을 살린 뒤 보고할 것.

---

## 검증 체크리스트

```bash
pnpm run build
# exit 0 확인
```

빌드 후:
- [ ] `/tags/` — 태그 목록 표시 (일본생활, 니혼바시, 도쿄생활 등)
- [ ] `/topics/` — 4개 허브 각각 포스트 카드 표시 (빈 허브 없음)
- [ ] `/tags/일본생활/` 등 개별 태그 페이지 정상 렌더링

---

## 트리거 (복사용)

```
TokyoKorean 태그·주제허브 수정 TASK 시작.
지시서: docs/AG_TASK_2026-06-24_tags-topics-fix.md
작업: 1·2 필수, 3은 결과 보고 후 Joseph 확인
```
