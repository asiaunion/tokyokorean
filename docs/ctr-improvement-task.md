# CTR 개선 작업 지시서
> 작성: 2026-06-10 | 목적: Google 검색 클릭률 향상 → 트래픽 증대 → AdSense 승인 가속

## 배경

Search Console 3개월 데이터:
- 총 노출 538회, 클릭 3회, **평균 CTR 0.6%**, 평균 게재순위 25.3위
- 노출이 있어도 클릭이 없는 이유: 제목/메타 설명이 검색 의도와 불일치

## CTR 개선 대상 포스트 (노출 높고 클릭 0인 우선순위 순)

| 순위 | URL slug | 노출 | 클릭 | CTR | 게재순위 |
|------|----------|------|------|-----|---------|
| 1 | tokyo-ward-guide-series-prologue | 123 | 0 | 0% | 52.8 |
| 2 | tokyo-core-3-wards-chiyoda-chuo-minato | 106 | 0 | 0% | 13.7 |
| 3 | tokyo-real-estate-investment-complete-guide (EN) | 35 | 0 | 0% | 11.3 |
| 4 | tokyo-6-wards-real-estate-insight | 33 | 0 | 0% | 7.0 |
| 5 | japan-rate-hike-cycle-j-reit-three-lessons | 22 | 0 | 0% | 7.1 |
| 6 | nihonbashi-hamacho-supermarket-peacock-city-life | 21 | 0 | 0% | 7.0 |
| 7 | tokyo-shinjuku-shibuya-bunkyo | 17 | 0 | 0% | 45.1 |
| 8 | nihonbashi-mitsui-redevelopment-pipeline-three | 15 | 0 | 0% | 7.2 |

## 작업 내용

각 포스트의 EN/KO/JA 모든 locale MD 파일에서 아래 두 frontmatter 필드를 개선한다.

```
title: "..."
description: "..."
```

### 개선 원칙

1. **title**
   - 검색 키워드를 앞으로 배치 (예: "Tokyo Core 3 Wards Guide" → "Chiyoda, Chuo, Minato: Tokyo's Premium 3 Wards Explained")
   - 숫자, 연도, 구체적 수치 포함 시 CTR 상승 (예: "2026", "3 Wards", "5 Lessons")
   - 질문형 또는 "Guide/Analysis/Comparison" 같은 명확한 의도 단어 포함
   - 60자 이내 유지

2. **description**
   - 검색자가 얻을 수 있는 구체적 이익 명시 (예: "Learn which ward to invest in based on vacancy rates, price trends, and developer pipelines")
   - 행동 유도 표현 포함 (예: "Find out", "See the data", "Discover")
   - 120~155자 유지 (160자 초과 시 truncation)
   - YMYL 준수: 구체적 수익률/투자 권유 표현 금지

### 포스트별 개선 방향

#### 1. tokyo-ward-guide-series-prologue (노출 123, 순위 52.8위)
- 현재 문제: 순위가 53위로 낮아 노출 대비 클릭 없음. 제목을 더 구체적으로 개선해 순위 상승 유도
- 타겟 키워드: "tokyo wards guide", "tokyo 23 wards"
- 개선 방향: "Tokyo 23 Wards Complete Guide: Where to Live & Invest [2026]"

#### 2. tokyo-core-3-wards-chiyoda-chuo-minato (노출 106, 순위 13.7위)
- 현재 문제: 순위 14위로 1페이지 진입 직전. CTR 개선 시 즉시 클릭 발생 가능
- 타겟 키워드: "chiyoda chuo minato", "tokyo premium wards"
- 개선 방향: "Chiyoda, Chuo & Minato: Tokyo's 3 Premium Wards — Price, Vacancy & Investment Data"

#### 3. tokyo-real-estate-investment-complete-guide (EN, 노출 35, 순위 11.3위)
- 현재 문제: 순위 11위, 1페이지 하단. 설명문 개선으로 CTR 상승 가능
- 타겟 키워드: "tokyo real estate investment guide", "japan real estate investing"
- 개선 방향: description에 "step-by-step", "2026 data" 포함

#### 4. tokyo-6-wards-real-estate-insight (노출 33, 순위 7.0위)
- 현재 문제: 순위 7위로 좋지만 CTR 0%. 제목이 검색 의도와 불일치
- 타겟 키워드: "tokyo wards real estate", "tokyo investment wards"
- 개선 방향: "Tokyo's 6 Key Wards: Real Estate Data & Investment Insights [2026]"

#### 5. japan-rate-hike-cycle-j-reit-three-lessons (노출 22, 순위 7.1위)
- 타겟 키워드: "japan rate hike reit", "j-reit investment"
- 개선 방향: "Japan Rate Hike & J-REIT: 3 Lessons from the 2024-2026 Cycle"

#### 6. nihonbashi-hamacho-supermarket-peacock-city-life (노출 21, 순위 7.0위)
- 타겟 키워드: "nihonbashi hamacho living", "peacock store tokyo"
- 개선 방향: description에 생활 편의성 구체적 언급

#### 7. tokyo-shinjuku-shibuya-bunkyo (노출 17, 순위 45.1위)
- 현재 문제: 순위 45위로 매우 낮음. 제목 대폭 개선 필요
- 타겟 키워드: "shinjuku shibuya bunkyo", "tokyo west wards"
- 개선 방향: "Shinjuku, Shibuya & Bunkyo: Tokyo's Creative & Academic Wards Guide"

#### 8. nihonbashi-mitsui-redevelopment-pipeline-three (노출 15, 순위 7.2위)
- 타겟 키워드: "nihonbashi redevelopment", "mitsui tokyo"
- 개선 방향: "Nihonbashi Mitsui Redevelopment: 3 Projects That Will Reshape Tokyo's Core"

## 실행 절차

### Step 1: 각 포스트 EN/KO/JA MD 파일 읽기
경로: `src/data/blog/{en,ko,ja}/{slug}.md`

### Step 2: 현재 title/description 확인 후 개선안 작성
- EN: 위 개선 방향 기반으로 영어 최적화
- KO: 한국어 검색 의도 반영 (예: "도쿄 구별 부동산", "일본 리트 투자")
- JA: 일본어 검색 의도 반영 (예: "東京 不動産投資", "日本橋 再開発")

### Step 3: frontmatter title/description만 수정
- 본문 절대 수정 금지
- pubDatetime, modDatetime 등 다른 필드 수정 금지
- 수정 완료 후 변경된 파일 목록 보고

### Step 4: 완료 보고
수정한 파일 경로와 변경 전/후 title, description을 표로 정리해서 보고

## 주의사항
- YMYL 가드레일 준수: 구체적 수익률, 투자 권유 표현 금지
- 제목에 gsfark.com 브랜드 포함 불필요 (Google이 자동 표시)
- 한 번에 모든 포스트 처리 후 보고 (중간 보고 불필요)
- `src/` 디렉토리 외 파일 수정 금지
