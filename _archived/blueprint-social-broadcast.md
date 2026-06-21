# Social Broadcast Codex Automation Blueprint
> Created: 2026-05-14
> Purpose: Codex implementation blueprint

## 0. Goals and Deliverables

### Primary Goal
GSF-Blog 포스트를 SNS(X, LinkedIn, Threads)에 반자동으로 발신하여 organic social traffic을 확보하고, E-E-A-T 신호를 강화한다.

**Pilot cadence (Phase 1)**: 주 **1–2건** — 상세는 [`docs/SNS_PILOT_CADENCE.md`](docs/SNS_PILOT_CADENCE.md).

### Success Definition
- 포스트 slug 입력 → 플랫폼별·언어별 초안이 아티팩트로 생성됨
- YMYL 가드레일 통과: 구체적 수치·투자 권유 표현이 초안에 포함되지 않음
- UTM 파라미터가 모든 링크에 자동 부착됨
- X API 키 확보 시 자동 게시 가능, 미확보 시 복사용 텍스트 폴백

### Out of Scope
- Instagram 연동 (이미지/영상 중심 — 텍스트 블로그 요약과 부적합)
- 게시 스케줄링 (발행 빈도 주 1~2편으로 불필요)
- 댓글/반응 모니터링 자동화
- 블로그 코드베이스(`src/`) 수정 — 절대 금지
- 일괄 자동 발신 — Phase 2에서도 사용자 건별 승인 필수

## 1. Working Context

### Background
GSF-Blog(gsfark.com)는 Astro + Vercel 기반 다국어(EN/KO/JA) 부동산·투자 블로그로, AdSense 승인을 완료하고 콘텐츠 30편 × 3개 언어를 보유. 현재 SEO 유입만 존재하며, SNS 채널을 통한 트래픽 다각화가 필요하다. YMYL 도메인 특성상 SNS 요약 시 수치 인용·투자 권유 금지 등 엄격한 가드레일이 요구된다.

### Objective
`social-broadcast` Codex 스킬을 구현하여, 포스트 slug를 입력하면 플랫폼별·언어별 SNS 초안을 생성하고, 사용자 승인 후 게시(또는 복사용 텍스트 출력)하는 반자동 워크플로우를 확립한다.

### Scope
- Included: X/LinkedIn/Threads 초안 생성, YMYL 가드레일 검증, UTM 자동 부착, X API 게시(키 확보 후), 복사용 텍스트 출력
- Excluded: 블로그 코드 수정, 자동 스케줄링, 댓글 모니터링, Instagram

### Inputs
| Item | Format | Source | Notes |
|---|---|---|---|
| 포스트 slug | string | 사용자 입력 또는 deploy-blog 완료 후 제안 | 예: `tokyo-office-vacancy` |
| 블로그 .md 파일 (EN/KO/JA) | Markdown | `src/data/blog/{en,ko,ja}/<slug>.md` | 읽기 전용 |
| 플랫폼 템플릿 | Markdown | `.agents/skills/social-broadcast/templates/` | X/LinkedIn/Threads 포맷 가이드 |
| X API 자격증명 | env vars | `.env` 파일 | 선택적 — 미설정 시 복사용 텍스트 폴백 |

### Outputs
| Item | Format | Destination | Notes |
|---|---|---|---|
| SNS 초안 묶음 | Markdown artifact | 대화 내 아티팩트 | 기본 6건(X:EN/KO/JA, LinkedIn:EN/KO, Threads:KO) |
| 게시 결과 | 로그 텍스트 | 대화 내 보고 | X API 게시 성공/실패 + URL |
| 복사용 텍스트 | Plain text | 대화 내 출력 | LinkedIn/Threads 또는 API 미설정 시 |

### Constraints
- **YMYL 가드레일**: 원문의 구체적 수치(공실률, 수익률 등) SNS 요약 포함 금지. 방향성만 언급
- **투자 권유 금지**: "매수 적기", "추천" 표현 배제. "판단 프레임을 정리했습니다" 식 표현
- **AdSense 정책**: 인위적 클릭 유도 금지. 자연 유입 유도만 허용
- **X API Free tier**: 월 1,500건 트윗 (블로그 발행 빈도로 충분)
- **X API 게시 건수**: 사용자가 승인 시 선택한 1건만 자동 게시. 동일 계정에서 3개 언어 동시 게시 = 스팸 리스크
- **블로그 무영향**: `src/` 디렉토리 일절 수정 없음
- **API 키 저장**: `.env` 파일 + `.gitignore`에 등록. Keychain 연동은 향후 옵션
- **Phase 2 건별 승인**: 기존 포스트 발신 시에도 에이전트가 후보 목록 제시 → 사용자가 건별 선택

### Terms
| Term | Definition |
|---|---|
| slug | 블로그 포스트의 URL 식별자 (예: `tokyo-office-vacancy`) |
| YMYL | Your Money Your Life — Google이 높은 정확성을 요구하는 콘텐츠 카테고리 |
| UTM | Urchin Tracking Module — GA4 트래픽 소스 추적용 URL 파라미터 |
| 가드레일 | LLM 초안 생성 시 적용되는 콘텐츠 안전 규칙 |
| 스마트 기본값 | 9건 전체 대신 6건(핵심 조합)만 생성하는 기본 동작 |

## 2. Workflow Definition

### End-to-End Flow
`[slug 입력] -> [Step 01: 소스 수집] -> [Step 02: 초안 생성] -> [Step 03: 가드레일 검증] -> [Step 04: 사용자 검토] -> [Step 05: 게시/출력] -> [완료 보고]`

### LLM vs Code Boundary
| LLM handles | Code handles |
|---|---|
| 포스트 요약·톤 변환 (플랫폼별 문체 조정) | .md 파일 읽기·파싱 (frontmatter 추출) |
| YMYL 가드레일 자기 검증 | UTM 파라미터 URL 조립 |
| 해시태그 선정 (블로그 태그 기반) | X API 호출 (`tweepy`) |
| 언어별 뉘앙스 조정 | 글자 수 제한 검증 (X: 280자) |
| 복사용 텍스트 포맷팅 | 환경변수 로드·검증 |

#### Step 01: Source Collection
1) Step Goal:
대상 포스트의 3개 locale .md 파일을 읽고 메타데이터·본문을 추출한다.

2) Input / Output:
- Input: 포스트 slug (string)
- Output: `{slug, title:{en,ko,ja}, body:{en,ko,ja}, tags:[], category, pubDate}`

3) LLM Decision Area:
없음 — 이 단계는 순수 데이터 수집

4) Code Processing Area:
- `src/data/blog/{en,ko,ja}/` 에서 slug 매칭 파일 탐색
- YAML frontmatter 파싱 (`awk '/^---$/{c++; next} c>=2'` 패턴 — sed 사용 금지, KI 참조)
- 존재하지 않는 locale 건너뛰기

5) Success Criteria:
최소 1개 locale의 title + body 추출 완료

6) Validation Method:
Rule-based — title 비어있지 않음, body 100자 이상

7) Failure Handling:
slug 매칭 실패 → 유사 slug 3개 제안 후 `NEEDS_USER_INPUT` 상태 전환. 전체 locale 누락 → `FAILED`

8) Skills / Scripts:
- Skill: none
- Script: SKILL.md 내 인라인 지침 (별도 스크립트 불필요 — 에이전트가 직접 파일 읽기)

9) Intermediate Artifact Rule:
대화 내 처리. 별도 파일 생성 없음.

#### Step 02: Draft Generation
1) Step Goal:
플랫폼별·언어별 SNS 초안을 생성한다. 스마트 기본값: 6건(X:EN/KO/JA, LinkedIn:EN/KO, Threads:KO).

2) Input / Output:
- Input: Step 01 소스 데이터 + 플랫폼 템플릿 (`templates/*.md`)
- Output: 플랫폼별·언어별 초안 텍스트 묶음

3) LLM Decision Area:
- 포스트 핵심 인사이트 1~2개 선별
- 플랫폼별 톤 변환 (X: 간결+훅, LinkedIn: 전문적, Threads: 대화체)
- 언어별 뉘앙스 조정 (EN: 글로벌 독자, KO: 한국 투자자, JA: 일본 현지)
- 해시태그 3~5개 선정 (블로그 태그 기반)

4) Code Processing Area:
- UTM URL 조립: `https://gsfark.com/posts/<slug>/?utm_source={platform}&utm_medium=social&utm_campaign=blog-broadcast`
- 글자 수 카운트 (X: 280자 제한 검증)
- 스마트 기본값 적용: `--all` 미지정 시 6건 생성 (X:EN/KO/JA, LinkedIn:EN/KO, Threads:KO)

5) Success Criteria:
모든 요청 조합의 초안 생성 완료 + 각 초안에 UTM URL 포함

6) Validation Method:
LLM self-check — 각 초안에 대해 YMYL 가드레일 4개 규칙 자기 검증

7) Failure Handling:
특정 언어 초안 생성 실패 → 해당 언어 건너뛰고 나머지 진행. 전체 실패 → `FAILED`

8) Skills / Scripts:
- Skill: none (LLM 직접 생성)
- Script: none

9) Intermediate Artifact Rule:
대화 내 아티팩트로 직접 제시. 별도 파일 생성 없음.

#### Step 03: Guardrail Validation
1) Step Goal:
생성된 초안이 YMYL 가드레일을 통과하는지 검증한다.

2) Input / Output:
- Input: Step 02 초안 묶음
- Output: 검증 결과 (PASS/FAIL per draft) + 위반 시 수정된 초안

3) LLM Decision Area:
- 구체적 수치 포함 여부 판단 (%, ¥, 건수 등)
- 투자 권유 표현 탐지 ("매수 적기", "추천", "지금이 기회")
- 면책 표현 존재 여부 확인 (투자 카테고리 포스트)

4) Code Processing Area:
- 정규식 기반 숫자 패턴 스캔 (`\d+\.?\d*%`, `¥[\d,]+` 등)
- 금지 키워드 사전 매칭

5) Success Criteria:
모든 초안이 4개 YMYL 규칙 통과

6) Validation Method:
Rule-based (정규식) + LLM self-check (의미적 판단) 이중 검증

7) Failure Handling:
위반 발견 → LLM이 자동 수정 후 재검증 (최대 2회). 2회 실패 → 위반 항목 표시하여 `NEEDS_USER_INPUT`

8) Skills / Scripts:
- Skill: none
- Script: none (SKILL.md 내 검증 규칙으로 처리)

9) Intermediate Artifact Rule:
대화 내 처리. 별도 파일 생성 없음.

#### Step 04: User Review
1) Step Goal:
검증 완료된 초안을 아티팩트로 사용자에게 제시하고 승인/수정/거부를 받는다.

2) Input / Output:
- Input: Step 03 검증 통과 초안
- Output: 사용자 승인된 최종 초안 목록

3) LLM Decision Area:
없음 — 사용자 판단 대기

4) Code Processing Area:
아티팩트 포맷팅 (플랫폼별 섹션 구분, 복사 편의성)

5) Success Criteria:
사용자가 최소 1건 이상 승인

6) Validation Method:
Human review — 사용자 명시적 승인

7) Failure Handling:
전체 거부 → 수정 요청 수렴 후 Step 02 재실행. 부분 승인 → 승인 건만 Step 05 진행

8) Skills / Scripts:
- Skill: none
- Script: none

9) Intermediate Artifact Rule:
대화 내 처리. 별도 파일 생성 없음.

#### Step 05: Publish or Output
1) Step Goal:
승인된 초안을 게시(X API) 또는 복사용 텍스트로 출력한다.

2) Input / Output:
- Input: Step 04 승인 초안 + `.env` 환경변수
- Output: 게시 결과 로그 (X) + 복사용 텍스트 (LinkedIn/Threads)

3) LLM Decision Area:
없음 — 이 단계는 순수 실행

4) Code Processing Area:
- `.env`에서 `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` 로드
- `tweepy`로 `POST /2/tweets` 호출
- 응답에서 tweet URL 추출
- LinkedIn/Threads: 복사용 텍스트 포맷팅 출력

5) Success Criteria:
X: API 응답 200 + tweet URL 반환. LinkedIn/Threads: 복사용 텍스트 출력 완료

6) Validation Method:
Rule-based — X API 응답 코드 확인. 복사용 텍스트는 출력 완료로 판정

7) Failure Handling:
X API 키 미설정 → 복사용 텍스트 폴백 + "X API 키가 설정되지 않았습니다" 안내.
X API 게시 실패 → 에러 로그 + 복사용 텍스트 폴백.
재시도 없음 (rate limit 위험 방지)

8) Skills / Scripts:
- Skill: none
- Script: `.agents/skills/social-broadcast/scripts/post_to_x.py` (tweepy 기반)

9) Intermediate Artifact Rule:
대화 내 처리. 별도 파일 생성 없음.

### State Model
| State | Entry Condition | Exit Condition | Next State |
|---|---|---|---|
| `COLLECTING_REQUIREMENTS` | slug 입력 수신 | 소스 .md 파일 탐색 완료 | `PLANNING` |
| `PLANNING` | 소스 데이터 준비 완료 | 초안 생성 계획 수립 | `RUNNING_SCRIPT` |
| `RUNNING_SCRIPT` | 초안 생성 또는 X API 게시 실행 | 스크립트 성공 또는 실패 | `VALIDATING` or `FAILED` |
| `VALIDATING` | 초안 YMYL 가드레일 검증 | 검증 결과 확정 | `NEEDS_USER_INPUT` or `FAILED` |
| `NEEDS_USER_INPUT` | 초안 사용자 검토 대기 | 사용자 승인/수정/거부 | `RUNNING_SCRIPT` or `PLANNING` or `DONE` |
| `DONE` | 게시 완료 또는 복사용 텍스트 출력 완료 | Terminal | none |
| `FAILED` | slug 미발견, 전체 locale 누락, 복구 불가 오류 | Terminal | none |

## 3. Implementation Spec

### Recommended Folder Structure
```text
/Users/gsf/.gemini/antigravity/scratch/.agents/skills/
  /social-broadcast
    SKILL.md                      # 메인 실행 지침
    /templates
      x-template.md               # X: 톤 가이드 + 구조 규칙 + 예시
      linkedin-template.md        # LinkedIn: 톤 가이드 + 구조 규칙 + 예시
      threads-template.md         # Threads: 톤 가이드 + 구조 규칙 + 예시
    /scripts
      post_to_x.py                # tweepy 기반 X API v2 게시 (Phase 1.5)
  /deploy-blog                    # 기존 스킬 (수정 없음)

# 참조 경로 (읽기 전용)
/projects/GSF-Blog/src/data/blog/{en,ko,ja}/   # 블로그 소스
/projects/GSF-Blog/.env                         # X API 자격증명 (gitignored)
```

### AGENTS.md Responsibilities
- `social-broadcast` 스킬을 `$social-broadcast <slug>` 또는 `SNS 초안 만들어줘` 트리거로 라우팅
- `deploy-blog` 완료 후 "SNS 발신할까요?" 제안 로직은 에이전트 판단에 위임 (코드 결합 없음)
- 블로그 `src/` 디렉토리 읽기 전용 접근만 허용

### Custom Agent Definitions
| Name | Path | Role | Required Fields |
|---|---|---|---|
| none | — | 단일 Codex 에이전트로 충분. 별도 서브에이전트 불필요 | — |

**근거**: 워크플로우가 직선형(5 step sequential)이고, 분기 판단이 단순(YMYL 통과/미통과)하여 단일 에이전트 + 스킬 구조로 충분.

### Skill and Script Inventory
| Name | Type | Role | Trigger Condition |
|---|---|---|---|
| `social-broadcast` | skill | 포스트 SNS 초안 생성 + 게시/출력 | `$social-broadcast <slug>`, `SNS 초안`, `SNS 발신` |
| `post_to_x.py` | script | X API v2 자동 게시 | Step 05에서 X 초안 승인 + API 키 존재 시 |
| `deploy-blog` | skill (기존) | 블로그 배포 — 수정 없음 | 기존 트리거 유지, 느슨한 결합 |

### Skill Creation Rules

> `deploy-blog` SKILL.md를 레퍼런스 규격으로 참조한다.
> 구현 완료 후 스킬 생성 패턴을 KI(Knowledge Item)로 캡슐화한다.

레퍼런스 규격 체크리스트:
1. SKILL.md frontmatter (`name`, `description`) 필수 필드 준수
2. SKILL.md 본문 500줄 이내, 대용량 참조는 `templates/`로 분리
3. 폴더 구조: `SKILL.md` + 선택적 `templates/` + `scripts/`

### Core Artifacts
모든 중간 산출물은 **대화 내 아티팩트**로 처리. 물리적 파일 생성 없음.
한 세션 내에서 시작-완료되는 직선형 워크플로우이므로 파일 잔해 불필요.

## 4. Validation Checklist

- [ ] Every workflow step has all 9 required fields
- [ ] 중간 산출물은 대화 내 아티팩트로 처리 (물리적 파일 없음)
- [ ] LLM vs code responsibilities are separated clearly
- [ ] Human review points are explicit where needed (Step 04)
- [ ] 스킬 경로: `/Users/gsf/.gemini/antigravity/scratch/.agents/skills/social-broadcast/`
- [ ] 서브에이전트 불필요 (justified)
- [ ] 스킬 생성 시 deploy-blog SKILL.md를 레퍼런스로 참조

## 5. Key Decisions

| 결정 | 선택 | 근거 |
|------|------|------|
| API 키 저장 | `.env` + `.gitignore` | 가장 단순, CLI 도구 표준. Keychain은 향후 옵션 |
| Phase 1 범위 | 스킬 + 초안 생성. X API는 키 확보 후 | 블로그 무영향 원칙 유지, 점진적 확장 |
| Phase 2 방식 | 에이전트가 후보 제시 → 사용자 건별 승인 | 일괄 자동 발신 아님. YMYL 도메인 특성상 인간 검토 필수 |
| 단일 에이전트 | 서브에이전트 없음 | 직선형 5-step 워크플로우, 분기 단순 |
| 스마트 기본값 | 6건 (X:EN/KO/JA, LinkedIn:EN/KO, Threads:KO) | X는 일본 최대 SNS. API 게시는 사용자 선택 1건만. `--all`로 9건 확장 가능 |
| deploy-blog 연동 | 느슨한 결합 (코드 의존성 없음) | deploy-blog 완료 후 에이전트가 제안만. 각각 독립 실행 가능 |

## 6. Phased Rollout

| Phase | 내용 | 트리거 |
|-------|------|--------|
| Phase 1 | `social-broadcast` 스킬 구현 + 초안 생성 + 복사용 텍스트 출력 | 즉시 구현 가능 |
| Phase 1.5 | X Developer Portal 키 확보 → `post_to_x.py` 활성화 | API 키 확보 후 |
| Phase 2 | 기존 30편 포스트 후보 목록 → 사용자 건별 선택 → 발신 | AdSense 승인 후 |
| Phase 3 | LinkedIn/Threads API 확보 시 자동 게시 확장 | API 승인 후 |

## 7. Assumptions and Risks

| 항목 | 가정 | 리스크 |
|------|------|--------|
| X API Free tier | 월 1,500건 충분 | X 정책 변경 시 유료 전환 필요 |
| OG 카드 | Layout.astro에 og:title/description/image 이미 설정 | 변경 시 카드 미노출 가능 |
| tweepy | Python 3.x + tweepy 최신 버전 | 의존성 충돌 시 httpx 직접 호출로 대체 |
| sed 사용 금지 | frontmatter 파싱 시 awk 사용 (KI 참조) | sed 패턴 복귀 시 본문 누락 재발 |

## 8. Automation Backlog

| 트리거/시점 | 기대 동작 (Input/Output) | 도입 이유 |
|---|---|---|
| `social-broadcast` 초안 생성 전 | 텍스트 길이를 스크립트로 파싱하여 Threads 500자, X 280자를 초과하는지 사전 검증. 초과 시 오류 반환 또는 LLM에 재요청 | 수동 확인 누락으로 인한 API HTTP 500 에러 및 rate limit 낭비 원천 차단 |
