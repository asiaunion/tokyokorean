# GSF-Ark
## 투자·경제·부동산 분석 블로그

> **프로젝트 코드명:** GSF-Ark  
> **공개 도메인:** gsfark.com  
> **언어:** 한국어 / 영어 / 일본어 (trilingual)  
> **기술 스택:** Astro + TypeScript + Markdown + Vercel  
> **상태:** 🟢 Active (애드센스 심사 중)

---

## 프로젝트 소개

GSF-Ark는 **생명을 보존하는 GSF의 경제 사역**을 구체화합니다.

### 존재 이유
- 가정과 공동체의 경제적 안정을 돕는다
- 투자·부동산·금융에 대한 신실한 분석을 제공한다
- 돈의 관리를 영적·신학적 관점에서 재해석한다

### 3개 축 (GSF-Calling과의 연결)
```
GSF-Calling (헌장)
    ↓
GSFArk: 생명을 보존한다 (경제)
    ├─ 투자 분석 (DART/SEC)
    ├─ 일본 부동산 (도쿄 중심)
    └─ 금융 웰빙 (가정 중심)
```

---

## 콘텐츠 전략

### 블로그 카테고리

| 카테고리 | 목표 | 예시 |
|---------|------|------|
| **Real Estate** | 도쿄 부동산 시장 분석 | 메구로/세타가야 ward 분석 |
| **Investment** | 일본 주식/펀드 가이드 | REINS 데이터 분석 |
| **Finance** | 가정 금융 계획 | 신용카드/보험/세금 |
| **Analysis** | 경제 이슈 심층 분석 | BOJ 금리 × 부동산 |

### 기준 문서
- **GSF-Calling** — 모든 콘텐츠의 신학적 기준
- **WEEKLY_STATUS.md** — 진행 상황 추적

---

## 기술 스택

- **Framework:** Astro 5.x (정적 사이트 생성)
- **언어:** TypeScript
- **스타일:** Tailwind CSS
- **콘텐츠:** Markdown (YML frontmatter)
- **배포:** Vercel
- **SEO:** Sitemap + RSS Feed + Open Graph

### 주요 스크립트

```bash
# 개발
npm run dev          # localhost:4321에서 시작

# 빌드 및 배포
npm run build        # Vercel이 자동 실행
npm run preview      # 빌드 결과 미리보기

# SNS 자동화 (Python)
python sns_scheduler.py    # 예약된 SNS 게시물 등록
python reschedule_all.py   # 전체 포스트 일정 재조정
```

---

## SNS 파이프라인 (2026-06-13 갱신)

### 배포 네트워크
```
Markdown (src/content/blog/*.md)
    ↓ (frontmatter 파싱)
SNS 메타데이터 추출 (title, summary, ogImage, UTM)
    ↓ (Python 자동화)
Buffer API → LinkedIn / Threads / X / Reddit
    ↓
자동 예약 게시 (매일 다른 시간)
```

### 핵심 파일
- `scripts/sns_scheduler.py` — 각 SNS 채널별 포스트 예약
- `scripts/reschedule_all.py` — 전체 포스트 재일정 (위기 대응)
- `scripts/reschedule_patch.py` — 누락된 라운드 패치

### 최근 개선 (2026-06)
- ✅ Threads: 이미지→링크 변환 (메타 정책)
- ✅ LinkedIn: UTM 파라미터 → 정규 URL (추천 알고리즘)
- ✅ 모든 채널: ogImage frontmatter 파싱 추가
- ✅ 34개 포스트 SNS 재일정 완료

---

## 현재 진행 상황

### Phase 1: 기초 구축 ✅ (완료)
- ✅ UI 오버홀 (니혼바시 영감 디자인)
- ✅ 다국어 지원 (KO/EN/JA)
- ✅ SNS 자동화 파이프라인 구축
- ✅ 콘텐츠 17개 발행 (2026년)

### Phase 2: 애드센스 승인 ⏳ (현재 진행 중)
- ⏳ AdSense 기술 심층 분석 진행 (진단: 80% 기술적 결함 가능성)
- ⏳ 재신청 전 6단계 기술 audit 예정 (3~5일)
- ⏳ ads.txt / hreflang / sitemap / 고스트페이지 정리

### Phase 3: 수익화 (애드센스 승인 후)
- 기타 애드 네트워크 (미디어넷, 인포링크)
- 제휴 마케팅 (도쿄 부동산 서비스)
- Premium 뉴스레터 (6개월 후)

---

## 폴더 구조

```
GSF-Ark/
├── README.md                          ← 현재 파일
├── WEEKLY_STATUS.md                   ← 진행 상황 추적
│
├── src/
│   ├── content/
│   │   ├── blog/                      ← 블로그 포스트 (Markdown)
│   │   │   ├── ko/
│   │   │   ├── en/
│   │   │   └── ja/
│   │   └── about/
│   ├── layouts/
│   ├── components/
│   └── styles/
│
├── public/
│   └── images/
│
├── scripts/
│   ├── sns_scheduler.py
│   ├── reschedule_all.py
│   └── reschedule_patch.py
│
├── docs/
│   ├── 00-GSFArk-Spec.md
│   ├── 01-Content-Strategy.md
│   ├── 02-SNS-Pipeline.md
│   └── 03-AdSense-Analysis.md
│
├── package.json
├── astro.config.mjs
└── tsconfig.json
```

---

## 블로그 기준

### 모든 포스트는 다음을 충족해야 함

1. **GSF-Calling 기준과 부합**
   - 단순 정보 제공이 아닌 신앙적·윤리적 관점 포함
   - "왜 이것이 중요한가?"에 대한 설명

2. **다국어 (KO/EN/JA)**
   - 한국어 원문 → 영어 → 일본어 순
   - 각 언어별 문화적 적응 (직역 아님)

3. **데이터 검증**
   - 숫자·통계는 Claude + NotebookLM으로 이중 검증
   - 출처 명시 (DART, 금융감독원, 일본 부동산 협회 등)

4. **SEO 최적화**
   - 메인 키워드 + 롱테일 키워드 포함
   - 제목 구조 (H1 → H2 → H3)
   - 메타 설명 (155자 이내)

5. **SNS 친화적**
   - OG 이미지 (1200x630px)
   - 요약문 (140자 이내)
   - 해시태그 (3~5개, 언어별)

---

## 주요 기준 문서

| 문서 | 위치 | 설명 |
|------|------|------|
| **GSF-Calling** | `scratch/projects/GSF-Calling/` | 신학적 기초 |
| **WEEKLY_STATUS.md** | 이 폴더 | 진행 상황 추적 |
| **Content Strategy** | `docs/01-Content-Strategy.md` | 콘텐츠 전략 상세 |
| **SNS Pipeline** | `docs/02-SNS-Pipeline.md` | SNS 자동화 설명 |
| **AdSense 분석** | `docs/03-AdSense-Analysis.md` | 애드센스 심층 분석 |

---

## 협력 방식

### Claude의 역할
- 콘텐츠 기획 및 검증
- 데이터 분석 및 팩트체크
- 번역 (한→영→일)
- 블로그 게시물 작성

### AG의 역할
- 포스트 배포 (마크다운 → Vercel)
- SNS 자동화 스크립트 관리
- 빌드 및 성능 최적화
- Git 커밋 및 배포

### 승주님의 역할
- 콘텐츠 방향성 결정
- 신앙적·윤리적 검수
- 포스트 최종 승인
- GSF-Calling과 일관성 확인

---

## 다음 단계 (Phase 2)

### 즉시 (1~3일)
1. AdSense 기술 심층 진단 완료
2. 6단계 audit 계획 수립
3. ads.txt / hreflang 재검토

### 다음주 (6월 22~28일)
4. 기술적 결함 수정
5. 애드센스 재신청 준비
6. 신규 포스트 2개 배포

### 장기 (7월 이후)
7. 애드센스 승인 후 수익화 시작
8. 제휴 마케팅 협력사 발굴
9. Premium 콘텐츠 준비

---

## 중요 링크

- **라이브 사이트:** https://gsfark.com
- **Vercel 대시보드:** https://vercel.com/[계정]/gsfark
- **Buffer 스케줄:** https://buffer.com/login
- **Google Search Console:** https://search.google.com/search-console
- **Google Analytics:** https://analytics.google.com

---

## 마지막 업데이트

**2026-06-14** — CLAUDE.md 업데이트와 함께 폴더명 변경 완료 (GSF-Blog → GSF-Ark)
- ✅ README 신규 작성
- ✅ 내부 링크 GSF-Calling 연결
- ✅ 콘텐츠 전략 명확화

**다음 업데이트:** AdSense 기술 audit 완료 후 보고서 등록
