# AG TASK — 토픽 허브 · 카테고리 뱃지 정렬 (GSF-Ark 잔재 제거)
> 생성: 2026-06-25  
> 작성: Cursor (Joseph 요청)  
> 목적: **4개 토픽 허브 = 4개 카테고리 뱃지** 1:1 정렬, `투자`/`안전` GSF-Ark 뱃지 제거  
> **범위 밖:** 허브 3개 압축 · 포스트 본문 수정 · pubDatetime · 사진 · GSC 색인 · AdSense 신청

---

## 배경

| 레이어 | 현재 문제 |
|--------|-----------|
| `/topics/` 허브 UI | ✅ 이미 TokyoKorean 명칭 (실용정보·문화비교·로컬·에세이) |
| `topicHubs.ts` **내부 키** | ❌ `urbanInvestment`, `macroPolicy` — GSF-Ark 시대 이름 |
| `category` frontmatter | ❌ 4편만 설정, 값이 `investment`/`safety` → Card 뱃지 **「투자」「안전」** |
| 면책문구 | `category`에 묶여 있음 → 뱃지 변경 시 면책까지 general로 뭉개지면 **비권장** |

**결정 (Joseph·Cursor 합의):** 4개 허브 유지 · 허브 키 리네이밍 · category = 뱃지 · 면책은 **slug 기반** 분리.

---

## 목표 구조

### A) 허브 키 리네이밍 (`topicHubs.ts`)

| 구 키 (삭제) | 신 키 | 허브 표시명 (`ui.ts`) | 뱃지 라벨 |
|-------------|-------|----------------------|-----------|
| `urbanInvestment` | `practical` | 일본 생활 실용 정보 | **실용정보** |
| `macroPolicy` | `culture` | 한일 문화 비교 | **문화비교** |
| `tokyoLife` | `local` | 도쿄 니혼바시 로컬 | **로컬** |
| `essay` | `essay` | 일본 생활 에세이 | **에세이** |

**슬러그 배치는 변경하지 않음** — 아래 표 그대로 유지.

### B) category enum (뱃지 전용)

`practical` | `culture` | `local` | `essay`

`investment`, `safety`, `life` — **category에서 제거** (뱃지에 다시 쓰지 않음).

### C) 면책문구 tier (slug 기반, category와 분리)

| tier | 적용 slug (3편) | 이유 |
|------|-----------------|------|
| `investment` | `japan-banking-credit-card`, `tokyo-housing-rental-process`, `nihonbashi-buying-property-foreigner` | YMYL·부동산/금융 실익 |
| `general` | 나머지 17편 (병원 포함) | `japan-healthcare-hospital-visit`의 `safety` tier **폐지** |

---

## STEP 0 — 시작 스냅샷

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean

echo "=== 레거시 hub 키 ==="
rg 'urbanInvestment|macroPolicy|tokyoLife' src/ --glob '!node_modules'

echo "=== 레거시 category frontmatter ==="
rg '^category:' src/data/blog/ko/*.md

echo "=== Card 뱃지 라벨 ==="
rg 'categoryI18n' src/components/Card.astro -A8

npm run build
```

---

## STEP 1 — `topicHubs.ts` 리네이밍

`src/data/topicHubs.ts` — 키만 변경, **슬러그 배열 동일**:

```ts
export const TOPIC_HUB_SLUGS = {
  practical: [
    "japan-garbage-disposal-rules",
    "japan-banking-credit-card",
    "tokyo-housing-rental-process",
    "japan-healthcare-hospital-visit",
    "tokyo-public-transportation-tips",
  ],
  culture: [
    "japan-korea-work-culture-diff",
    "japan-married-to-japanese-culture-diff",
    "japan-life-8years-honest",
    "japan-language-learning-survival-japanese",
    "japan-seasons-matsuri-culture",
  ],
  local: [
    "nihonbashi-history-and-modern-life",
    "nihonbashi-why-i-live-here",
    "nihonbashi-hidden-cafes",
    "tokyo-supermarket-guide",
    "japan-convenience-store-must-buys",
    "tokyo-weekend-getaway-spots",
  ],
  essay: [
    "nihonbashi-buying-property-foreigner",
    "tokyo-life-cost-of-living",
    "tokyo-korean-community-culture",
    "japan-elderly-care-frontline",
  ],
} as const;
```

**추가 (권장):** slug → category 헬퍼 export

```ts
export type HubCategory = "practical" | "culture" | "local" | "essay";

export function hubCategoryForSlug(slug: string): HubCategory | undefined {
  for (const [hub, slugs] of Object.entries(TOPIC_HUB_SLUGS) as [HubCategory, readonly string[]][]) {
    if ((slugs as readonly string[]).includes(slug)) return hub;
  }
  return undefined;
}
```

---

## STEP 2 — i18n · 페이지 hubOrder 동기화

### `src/i18n/ui.ts`

`topicHubs` 객체 키를 `practical`, `culture`, `local`, `essay`로 변경. **title·description 문구는 현행 유지.**

### `src/pages/topics.astro` · `src/pages/index.astro`

```ts
const hubOrder: TopicHubKey[] = ["practical", "culture", "local", "essay"];
```

홈 토픽 카드 앵커: `/topics/#hub-practical` 등 — 키 변경에 맞게 자동 반영.

---

## STEP 3 — 스키마 · Card 뱃지

### `src/content.config.ts`

```ts
/** Editorial hub badge (matches topicHubs.ts) */
category: z.enum(["practical", "culture", "local", "essay"]).optional(),
```

주석에서 investment/safety 언급 삭제.

### `src/components/Card.astro`

```ts
const categoryI18n: Record<string, string> = {
  practical: "실용정보",
  culture: "문화비교",
  local: "로컬",
  essay: "에세이",
};

const categoryColors: Record<string, string> = {
  practical: "bg-sky-500/15 text-sky-400 border-sky-500/25",
  culture: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  local: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  essay: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};
```

`investment`, `safety`, `life` 항목 **삭제**.

---

## STEP 4 — 면책문구 · HighIntent CTA (category 분리)

### `src/lib/postDisclaimer.ts`

- `resolvePostDisclaimerCategory(category)` — **삭제 또는 deprecated**
- 신규:

```ts
export const INVESTMENT_DISCLAIMER_SLUGS = [
  "japan-banking-credit-card",
  "tokyo-housing-rental-process",
  "nihonbashi-buying-property-foreigner",
] as const;

export function resolvePostDisclaimerTier(slug: string): PostDisclaimerCategory {
  if ((INVESTMENT_DISCLAIMER_SLUGS as readonly string[]).includes(slug)) {
    return "investment";
  }
  return "general";
}
```

`safety` tier copy는 파일에 **유지** (향후 재난 포스트용)하되 현재 KO 20편에는 **적용하지 않음**.

### `src/layouts/PostDetails.astro`

```ts
const postDisclaimerCategory = resolvePostDisclaimerTier(postSlug);
```

(`category` frontmatter 사용 중단)

### `src/data/highIntentCta.ts`

Freelance CTA를 category가 아닌 slug로:

```ts
export const HIGH_INTENT_FREELANCE_SLUGS = [
  "japan-banking-credit-card",
  "tokyo-housing-rental-process",
  "nihonbashi-buying-property-foreigner",
] as const;

export function showsFreelanceCta(slug: string): boolean {
  return (HIGH_INTENT_FREELANCE_SLUGS as readonly string[]).includes(slug);
}

export function showsHighIntentBlock(
  category: string | undefined,
  slug: string
): boolean {
  return showsFreelanceCta(slug) || showsLeadMagnetCta(slug);
}
```

### `src/components/HighIntentPostCta.astro`

`showsFreelanceCta(category)` → `showsFreelanceCta(slug)`

---

## STEP 5 — KO 20편 frontmatter `category` 일괄 설정

**hub 소속 = category 값.** 아래 표대로 설정·검증.

| slug | category |
|------|----------|
| japan-garbage-disposal-rules | practical |
| japan-banking-credit-card | practical |
| tokyo-housing-rental-process | practical |
| japan-healthcare-hospital-visit | practical |
| tokyo-public-transportation-tips | practical |
| japan-korea-work-culture-diff | culture |
| japan-married-to-japanese-culture-diff | culture |
| japan-life-8years-honest | culture |
| japan-language-learning-survival-japanese | culture |
| japan-seasons-matsuri-culture | culture |
| nihonbashi-history-and-modern-life | local |
| nihonbashi-why-i-live-here | local |
| nihonbashi-hidden-cafes | local |
| tokyo-supermarket-guide | local |
| japan-convenience-store-must-buys | local |
| tokyo-weekend-getaway-spots | local |
| nihonbashi-buying-property-foreigner | essay |
| tokyo-life-cost-of-living | essay |
| tokyo-korean-community-culture | essay |
| japan-elderly-care-frontline | essay |

일괄 검증:

```bash
for slug in $(python3 -c "
from pathlib import Path
import re
# ... 또는 hubCategoryForSlug 스크립트
"); do echo $slug; done

rg '^category:' src/data/blog/ko/*.md | wc -l   # 기대: 20
rg '^category: (investment|safety)' src/data/blog/ko/ && echo FAIL || echo OK
```

---

## STEP 6 — Admin 동기화 (필수, 범위 작음)

category enum 변경 시 admin 깨짐 방지:

| 파일 | 변경 |
|------|------|
| `src/admin/config.ts` | `categories: ["practical","culture","local","essay"]` |
| `src/admin/schemas/api-schemas.ts` | `categorySchema` 동일 4값 |
| `src/admin/schemas/db.sql` | CHECK 제약 4값 (주석·마이그레이션 메모만 — DB 미사용 시 스키마 파일만) |
| `src/admin/components/FrontmatterEditor.tsx` | select 옵션 4개 |
| `src/admin/components/PostList.tsx` | `categoryLabels` · filter 옵션 |
| `src/admin/components/Editor.tsx` | default category `practical` |

---

## STEP 7 — 빌드 · 라이브 검증

```bash
npm run build
```

### dist 샘플

```bash
# 은행: 뱃지 실용정보 + 면책 investment KO
rg '실용정보' dist/posts/japan-banking-credit-card/index.html
rg '개인적 분석' dist/posts/japan-banking-credit-card/index.html
rg '투자' dist/posts/japan-banking-credit-card/index.html | rg -v '투자 상품' || true  # 뱃지「투자」0건

# 병원: 뱃지 실용정보 + 면책 general (재해·안전 문구 없음)
rg '실용정보' dist/posts/japan-healthcare-hospital-visit/index.html
rg '재해·안전' dist/posts/japan-healthcare-hospital-visit/index.html && echo FAIL || echo OK

# 부동산 에세이: 뱃지 에세이 + 면책 investment
rg '에세이' dist/posts/nihonbashi-buying-property-foreigner/index.html
```

### 라이브 (배포 후)

| # | URL | 확인 |
|---|-----|------|
| 1 | `/posts/` | 카드에 **실용정보·문화비교·로컬·에세이** 뱃지, **투자·안전 0건** |
| 2 | `/posts/japan-banking-credit-card/` | 뱃지 실용정보 · 면책 투자 tier KO |
| 3 | `/posts/japan-healthcare-hospital-visit/` | 뱃지 실용정보 · 면책 general |
| 4 | `/posts/nihonbashi-buying-property-foreigner/` | 뱃지 에세이 · 면책 investment tier |
| 5 | `/topics/` | 4섹션 id=`hub-practical` 등 · 앵커 동작 |
| 6 | `/` 토픽 카드 | 4카드 · `/topics/#hub-*` 링크 200 |

---

## STEP 8 — 커밋 · push · _handoff

### 커밋 메시지 (예시)

```
refactor: align topic hub keys and category badges for TokyoKorean

- Rename hub keys practical/culture/local/essay (drop GSF-Ark names)
- Set category on all 20 KO posts; Card badges match hubs
- Decouple disclaimer tier from category (slug-based investment tier)
```

### _handoff.md 템플릿

```markdown
## [YYYY-MM-DD HH:MM] AG 배포 완료 (Topic · Category 정렬)
- 작업 내용: 허브 키 리네이밍 · category 뱃지 20편 · 면책 slug 분리 · GSF 투자/안전 뱃지 제거
- 커밋 해시: ______
- 배포 URL: https://tokyokorean.net
- 특이사항: /posts/·/topics/ 라이브 검증 PASS. 면책 investment 3편 유지.
```

---

## 하지 말 것

| 금지 | 이유 |
|------|------|
| 4허브 → 3허브 압축 | Joseph·Cursor 4축 유지 결정 |
| 포스트를 hub 간 이동 | 슬러그 배치 이미 확정 |
| 본문·pubDatetime·tags 수정 | 범위 밖 |
| 면책 investment 3편을 general로 통일 | AdSense YMYL |
| `EDITORIAL_TOPIC_POLICY.md` 대규모 개편 | 선택 — hub 표 1블록만 갱신 가능 |

---

## 완료 보고 형식 (Joseph에게)

```
TokyoKorean Topic·Category 정렬 완료.

커밋: ______
배포: https://tokyokorean.net

라이브:
- /posts/ 뱃지 투자·안전 0건: PASS/FAIL
- 은행(실용정보+투자면책): PASS/FAIL
- 병원(실용정보+general면책): PASS/FAIL
- 부동산에세이(에세이+투자면책): PASS/FAIL
- /topics/ 4허브 앵커: PASS/FAIL

build: exit 0
```

---

## Joseph → AG 시작 메시지 (복사용)

```
TokyoKorean 토픽 허브·카테고리 뱃지 정렬 시작해줘.
지시서: docs/AG_TASK_2026-06-25_topic-category-align.md

핵심:
1) topicHubs 키 → practical/culture/local/essay (슬러그 배치 유지)
2) KO 20편 category 일괄 설정 (표 참조)
3) Card 뱃지 실용정보·문화비교·로컬·에세이
4) 면책은 slug 기반 (은행·임대·부동산매입 3편만 investment tier)
5) admin category enum 동기화

범위 밖: 3허브 압축, 본문 수정, 사진, GSC, AdSense 신청.
완료 후 build, push, 라이브 6항목, _handoff 기록.
```

---

*선행 완료: AdSense Prep (`e88d3d3`) · 콘텐츠 보강 (`a87afab`)*
