# Social Broadcast 스킬 설계서

> GSF-Blog 포스트를 SNS(X, LinkedIn, Threads)에 반자동으로 발신하는 에이전트 스킬

**작성일**: 2026-05-13  
**상태**: 승인 대기  
**관련 시스템**: GSF-Blog (Astro + Vercel), deploy-blog 스킬, Antigravity Agent

---

## 1. 목적

GSF-Blog의 포스트를 SNS에 요약·공유하여:
- 블로그로의 자연 유입(organic social traffic) 확보
- E-E-A-T 신호 강화 (저자의 활발한 콘텐츠 공유)
- GA4를 통한 채널별 유입 효과 측정
- GSC 색인 촉진 (공유 URL을 Google 봇이 크롤링)

## 2. 핵심 원칙

### 2.1 블로그 무영향 원칙
- 블로그 코드베이스(`src/`)에 **일절 변경 없음**
- 블로그 `.md` 파일을 **읽기 전용**으로만 접근
- AdSense 심사, GSC 색인, 기존 URL 구조에 영향 제로

### 2.2 YMYL 안전 가드레일
GSF-Blog는 투자·세금·부동산 등 YMYL(Your Money Your Life) 콘텐츠를 다루므로, SNS 요약 생성 시 반드시 지켜야 할 규칙:

| 규칙 | 설명 |
|------|------|
| 구체적 수치 금지 | 원문의 "공실률 4.2%", "수익률 3.8%" 같은 숫자를 SNS 요약에 포함하지 않음. 방향성만 언급 |
| 투자 권유 금지 | "매수 적기", "추천 종목" 표현 완전 배제. "판단 프레임을 정리했습니다" 식으로 독자의 자율 판단 유도 |
| 출처는 블로그로 | SNS에서 주장하지 않고, "상세 분석은 블로그에서 확인하세요" + URL로 트래픽 유도 |
| 면책 암시 | 투자 카테고리 포스트는 요약 말미에 "정보 제공 목적" 취지 한 줄 포함 |

### 2.3 정책 적합성
- **AdSense**: 소셜 미디어를 통한 자연 유입은 건전한 트래픽 소스로 간주. 인위적 클릭 유도만 아니면 정책 위반 없음
- **UTM 파라미터**: Google이 직접 만든 표준(Urchin Tracking Module). 개인정보 수집 아님. GA4가 이미 수집하는 트래픽 데이터에 라벨만 추가. GDPR/CCPA 추가 의무 없음
- **X/LinkedIn/Threads 정책**: URL에 쿼리 파라미터 포함 허용. 업계 표준 관행

## 3. 아키텍처

### 3.1 전체 흐름

```
┌─────────────────────────────────────────┐
│           social-broadcast 스킬          │
├─────────────────────────────────────────┤
│                                         │
│  [입력] .md 파일 경로 또는 포스트 slug    │
│     ↓                                   │
│  ① 3개 locale .md 파일 읽기 (EN/KO/JA)  │
│     ↓                                   │
│  ② 플랫폼별 초안 생성 (LLM)              │
│     · X: 훅 + 핵심 인사이트 + URL        │
│     · LinkedIn: 전문적 요약 + CTA        │
│     · Threads: 대화체 + 인사이트          │
│     × 3개 언어 = 최대 9개 초안            │
│     ↓                                   │
│  ③ 아티팩트로 검토용 초안 제시            │
│     ↓                                   │
│  ④ 사용자 검토 + 승인                    │
│     ↓                                   │
│  ⑤ 게시                                 │
│     · X → API 자동 게시                  │
│     · LinkedIn/Threads → 복사용 출력     │
│                                         │
└─────────────────────────────────────────┘
```

### 3.2 파일 구조

```
.agents/skills/social-broadcast/
├── SKILL.md                  # 메인 실행 지침
├── templates/
│   ├── x-template.md         # X 포맷 가이드 + 예시
│   ├── linkedin-template.md  # LinkedIn 포맷 가이드 + 예시
│   └── threads-template.md   # Threads 포맷 가이드 + 예시
└── scripts/
    └── post_to_x.py          # X API v2 포스팅 스크립트 (tweepy)
```

### 3.3 deploy-blog 연동

**느슨한 결합(Loose Coupling)**:
- `deploy-blog` 스킬의 코드는 수정하지 않음
- `deploy-blog` 완료 후 에이전트가 "SNS 초안도 생성할까요?"라고 제안만 함
- 사용자가 승인하면 `social-broadcast`를 별도 호출
- 두 스킬 사이에 코드 의존성 없음 — 각각 독립 실행 가능

## 4. 플랫폼별 상세

### 4.1 X (Twitter)

**게시 방식**: X API v2 자동 게시 (Free tier)  
**글자 제한**: 280자  
**포맷**:
```
🏢 도쿄 5대 오피스 공실률, 구별로 읽으면 보이는 것

도심 오피스 시장을 구 단위로 쪼개서 분석했습니다.
같은 "도쿄"라도 구조가 전혀 다릅니다.

👉 https://gsfark.com/posts/<slug>/?utm_source=x&utm_medium=social

#도쿄부동산 #오피스시장 #GSFBlog
```

**API 설정**:
```env
X_API_KEY=...
X_API_SECRET=...
X_ACCESS_TOKEN=...
X_ACCESS_TOKEN_SECRET=...
```
- X Developer Portal(무료) → 프로젝트 생성 → OAuth 1.0a 키 발급
- `scripts/post_to_x.py`는 `tweepy` 라이브러리로 `POST /2/tweets` 호출
- Free tier: 월 1,500건 (블로그 발행 빈도로 충분)

### 4.2 LinkedIn

**게시 방식**: 초안 생성 + 수동 복사·붙여넣기  
**글자 권장**: 1,300자  
**포맷**:
```
도쿄 도심 5구 오피스 공실률을 구별로 분해해 보았습니다.

동일한 "도쿄 오피스 시장"이라 해도, 千代田·中央·港·渋谷·新宿 각 구의
수요 구조와 공급 파이프라인은 상당히 다릅니다.

이번 포스트에서 다룬 핵심:
• 구별 공실률 격차가 만드는 투자 판단 차이
• 재개발 파이프라인이 수급에 미치는 영향
• 실무적 점검 프레임

상세 분석 →
https://gsfark.com/posts/<slug>/?utm_source=linkedin&utm_medium=social

#TokyoRealEstate #OfficeMarket #JREIT #CrossBorderInvesting
```

**수동 게시 사유**: LinkedIn Community Management API 승인 장벽 높음. 향후 API 확보 시 자동화 전환.

### 4.3 Threads

**게시 방식**: `scripts/post_to_threads.py` 자동 게시 (크리덴셜 설정 시)  
**언어**: **EN (메인, 먼저 게시) + KO (2~3시간 후 시차 게시)**  
**운영 원칙**: 동일 내용을 언어만 달리해 2회 게시. EN/KO 독자층 중복 최소 — 스팸 리스크 없음.  
**포맷 (EN)**:
```
Tokyo office vacancy — reading it ward by ward changes everything.

The same "Tokyo" hides very different supply structures by ward.

Full breakdown on the blog 👇
https://gsfark.com/posts/<slug>/?utm_source=threads&utm_medium=social
```

**포맷 (KO)**:
```
도쿄 오피스 공실률, "도쿄 전체"로만 보면 놓치는 게 있어요.

구별로 쪼개서 분석해봤는데,
같은 도심이라도 구조가 완전 달라요.

블로그에서 정리했습니다 👇
https://gsfark.com/posts/<slug>/?utm_source=threads&utm_medium=social
```

## 5. 콘텐츠 생성 규칙

### 5.1 스마트 기본값

**보장 5건**: X-EN, X-KO, LinkedIn-EN, Threads-EN, Threads-KO  
**선택적 최대 2건 추가**: X-JA, LinkedIn-KO → 총 최대 7건

| 플랫폼 | 기본 언어 | 선택적 추가 | 이유 |
|--------|-----------|------------|------|
| X | EN, KO | JA (선택적) | EN=글로벌 투자자, KO=핵심 독자층. JA는 일본 현지 시장 데이터 포스트일 때만 |
| LinkedIn | EN | KO (선택적) | 글로벌 비즈니스 전문가 대상. KO는 한국 투자자/이민 맥락 포스트일 때만 |
| Threads | EN, KO | - | EN 먼저(메인), KO는 2~3시간 시차 권장 |

### 5.1.1 선택적 언어 자동 판단 기준

에이전트가 Step 1(소스 수집) 시점에 frontmatter + 본문을 분석해 자동 판단. Human Gate에서 근거 표시 후 사용자 오버라이드 가능.

**X JA 추가 조건** (아래 중 하나 이상 해당 시):
- `tags`에 도쿄 지명(千代田, 港区 등), JREIT, オフィス, 不動産 등 일본어 키워드 포함
- `category`가 `real-estate` 또는 `investment`이고 주제가 일본 현지 시장 데이터 분석

**LinkedIn KO 추가 조건** (아래 중 하나 이상 해당 시):
- `tags`에 `Korean`, `한인`, `이민`, `재일교포`, `세금` 등 포함
- 포스트 본문이 한국 투자자/이민자 특화 맥락(세금전략, 한인커뮤니티 등) 중심

**Human Gate 표시 예시**:
```
[언어 선택 근거]
✅ X-JA 포함 — 도쿄 오피스 시장 데이터 중심 포스트
❌ LinkedIn-KO 제외 — 한국 독자 특화 맥락 없음
→ 변경하려면 말씀해 주세요
```

### 5.2 해시태그 전략

| 언어 | 해시태그 예시 | 규칙 |
|------|-------------|------|
| EN | `#TokyoRealEstate #JREIT #JapanInvesting` | 블로그 태그에서 자동 추출 + 영문 변환 |
| KO | `#도쿄부동산 #일본투자 #GSFBlog` | 블로그 태그 그대로 사용 |
| JA | `#東京不動産 #JREIT #日本投資` | 블로그 JA 태그에서 추출 |

플랫폼당 해시태그 3~5개로 제한 (과도한 태그 = 스팸 인식 리스크).

### 5.3 UTM 추적

모든 블로그 링크에 UTM 파라미터 자동 부착:
- `utm_source`: x / linkedin / threads
- `utm_medium`: social
- `utm_campaign`: blog-broadcast

GA4에서 SNS별 유입 효과 측정 가능.

### 5.4 OG 카드

SNS에 URL을 공유하면 각 플랫폼이 자동으로 OG 메타 태그를 읽어 카드를 생성. GSF-Blog는 이미 `Layout.astro`에서 `og:title`, `og:description`, `og:image`를 설정하고 있으므로 추가 작업 불필요.

## 6. 트리거 방식

| 트리거 | 동작 |
|--------|------|
| `deploy-blog` 완료 후 | 에이전트가 "SNS 발신할까요?" 제안 → 승인 시 실행 |
| `$social-broadcast <slug>` | 기존 포스트에 대해 수동 실행 |
| 모바일 `[MOBILE] SNS 초안 만들어줘 <slug>` | 모바일에서도 동일하게 동작, `reply_to_mobile`로 초안 전달 |

## 7. 에러 처리

| 상황 | 대응 |
|------|------|
| X API 키 미설정 | 초안 생성까지만 수행. "X API 키가 설정되지 않았습니다. 복사용 텍스트만 출력합니다" 안내 |
| X API 게시 실패 | 에러 로그 + 복사용 텍스트 폴백 출력 |
| 포스트 slug 없음 | "해당 slug의 포스트를 찾을 수 없습니다" + 유사 slug 제안 |
| 특정 locale 파일 없음 | 해당 언어 건너뛰고 존재하는 locale만 처리 |

## 8. 단계별 확장 로드맵

| 단계 | 내용 | 시점 |
|------|------|------|
| Phase 1 | 스킬 구현 + X API 연동 + 초안 생성 | AdSense 승인 대기 중에 구현 가능 (블로그 무영향) |
| Phase 2 | 기존 30편 포스트에 대해 일괄 초안 생성·게시 | AdSense 승인 후 |
| Phase 3 | LinkedIn/Threads API 확보 시 자동 게시 확장 | API 승인 후 |

## 9. 범위 외 (YAGNI)

다음 항목은 의도적으로 포함하지 않음:
- Instagram 연동 (이미지/영상 중심 플랫폼 — 텍스트 블로그 요약과 부적합)
- 게시 스케줄링 (발행 빈도가 주 1~2편으로 낮아 불필요)
- 댓글/반응 모니터링 자동화 (현 단계에서 과도)
- 블로그 코드 수정 (절대 금지)
