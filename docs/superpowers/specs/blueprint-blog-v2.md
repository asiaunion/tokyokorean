# Blog V2 Two-Track Codex Automation Blueprint
> Created: 2026-04-14
> Purpose: Codex implementation blueprint for Blog V2 (Main Redesign & News Factory)

## 0. Goals and Deliverables

### Primary Goal
기존 다국어 GSF-Blog의 미니멀리즘(개인 브랜딩) UI 전면 개편과 함께, 승주님의 개입 없이 스스로 일본 부동산 및 금융 정보를 수집·번역·배포하는 100% 무인 팩토리 블로그(제2 블로그)를 신축합니다.

### Success Definition
- **Track 1**: `GSF-Blog` 로컬 폴더에서 UI 개선 코드가 작성된 후 `pnpm build` 시 에러 0건.
- **Track 2**: 무인화 팩토리용 Python 스크립트가 로컬에서 구동 시, 지정된 일본 웹사이트의 최신 글을 `.md` 파일(한/영/일)로 떨어뜨릴 것.

### Out of Scope
- 무인화 팩토리의 구체적 대상 Vercel 호스팅 도메인 연결(이는 승주님이 GitHub 연결을 통해 수동 1회 처리 요망).
- 노션(Notion)이나 복잡한 동적 DB 연동(속도를 위해 확정 배제).

## 1. Working Context

### Background
GSF 본진 블로그는 권위 있고 빠르며 정제된 정보를 담아야 하는 반면, 매일 쏟아지는 방대한 글로벌/일본 금융 시황은 수동으로 처리하기에 에이전트 및 승주님의 리소스가 낭비됩니다.

### Objective
본진 블로그의 레이아웃을 Tailwind CSS 기반 미니멀 포트폴리오 형태로 다듬고(Track 1), 별도의 폴더에 무인 스크래핑-번역-푸시 스크립트 체계(Track 2)를 구축합니다.

### Scope
- Included: 
  1) `GSF-Blog`의 `src/layouts` 및 홈페이지 UI 변경.
  2) `GSF-Factory` (가칭) 신규 폴더 생성 및 Python 크롤링/번역 봇 로직 작성. Github Actions 매니페스트(`.yml`) 작성.
- Excluded: 복잡한 외부 CMS(Content Management System) 연동 플랫폼 사용 배제.

### Inputs
| Item | Format | Source | Notes |
|---|---|---|---|
| 일본 부동산 RSS/API | xml/json | 외부 웹 | 공장 블로그의 원천 데이터 |
| `GSF-Blog` 템플릿 | astro | 로컬 시스템 | 메인 블로그 리팩토링 원천 파일 |

### Outputs
| Item | Format | Destination | Notes |
|---|---|---|---|
| `news_bot.py` | script | `GSF-Factory/` | 팩토리 자동화 봇 |
| `main.yml` | yaml | `.github/workflows/` | 매일 아침 구동될 스케줄러 |

### Constraints
- Astro V5 프레임워크의 자바스크립트 완전 배제(0 JavaScript) 원칙을 디자인 전 영역에서 준수할 것.

### Terms
| Term | Definition |
|---|---|
| Two-Track | 1트랙: GSF 메인 브랜딩 블로그 / 2트랙: 자동 수집 뉴스 팩토리 블로그 |

## 2. Workflow Definition

### End-to-End Flow
`[Track 1 UI Design] -> [Track 2 Factory Scripting] -> [Track 2 Automation Setup] -> [Final Output]`

### LLM vs Code Boundary
| LLM handles | Code handles |
|---|---|
| Tailwind CSS 활자 중심 디자인 생성, 일본어 기사에 대한 한국어/영어 번역 판단 | Github Actions Cron 스케줄 실행, RSS XML 파싱, Markdown 파일 생성 |

#### Step 01: GSF-Blog UI Redesign (Track 1)
1) Step Goal:
메인 블로그를 미니멀리즘 및 개인 브랜딩 특화 디자인으로 개편.

2) Input / Output:
- Input: `src/pages/index.astro`, `src/layouts/Layout.astro`
- Output: Modified Astro & Tailwind 코드가 담긴 새 UI.

3) LLM Decision Area:
색상 제거, 여백 극대화, 가장 읽기 편한 Noto Sans / Serif 계열의 폰트 조합 설계. 3종 시안 중 최적 모델 자동 판단 적용.

4) Code Processing Area:
Tailwind 유틸리티 클래스 적용.

5) Success Criteria:
`pnpm build` 실패 없이 페이지 생성 완료.

6) Validation Method:
Local terminal compile.

7) Failure Handling:
에러 로그 기반으로 자체 CSS 문법 복구.

8) Skills / Scripts:
- Skill: none
- Script: none

9) Intermediate Artifact Rule:
`output/step01_blog_redesign.zip`

#### Step 02: News Factory Scripting (Track 2)
1) Step Goal:
뉴스 및 시황을 크롤링하고 AI번역 API를 태워 마크다운으로 변환하는 `news_bot.py` 작성.

2) Input / Output:
- Input: 지정 대상 RSS 피드 URL 
- Output: `news_bot.py` 및 생성된 `{date}-market-news.md`

3) LLM Decision Area:
일본어 시황 뉴스의 주요 내용(3줄 요약) 및 한국어/영어 매끄러운 번역.

4) Code Processing Area:
크롤러 `BeautifulSoup` 파싱, `.md` Frontmatter 포맷팅 및 파일 저장.

5) Success Criteria:
스크립트를 1회 테스트 구동했을 때, 3개 국어 번역 마크다운 파일이 지정 폴더에 정상 저장됨.

6) Validation Method:
Python script test run.

7) Failure Handling:
크롤링 차단 시 타겟 RSS 변경 또는 User-Agent 추가.

8) Skills / Scripts:
- Skill: none
- Script: none

9) Intermediate Artifact Rule:
`output/step02_news_bot.py`

### State Model
| State | Entry Condition | Exit Condition | Next State |
|---|---|---|---|
| `COLLECTING_REQUIREMENTS` | deep-dive 완료 상태 | Specs 의존성 없음 | `PLANNING` |
| `PLANNING` | 진행 중 | Blueprint 작성 완료 | `RUNNING_SCRIPT` |
| `RUNNING_SCRIPT` | UI 개편 혹은 크롤링 봇 스크립트 생성 시 | 봇 작성 완료 혹은 UI 반영 완료 | `VALIDATING` |
| `VALIDATING` | 작성된 봇 로컬 실행 및 Build 실행 | 성공 혹은 실패 결과 분기 | `DONE` or `FAILED` |
| `NEEDS_USER_INPUT` | Github Secrets 세팅이 필요할 때 | 승주님의 Github 세팅 확인 | `DONE` |
| `DONE` | Two-Track 시스템 설치 전면 성공 | Terminal | [none] |
| `FAILED` | 복구 불가능한 프레임워크 에러 | Terminal | [none] |

## 3. Implementation Spec

### Recommended Folder Structure
```text
/project-root
  /GSF-Blog (기존, Track 1)
  /GSF-Factory (신규, Track 2)
    .github/workflows/main.yml
    news_bot.py
    src/data/blog/ (자동 생성될 타겟)
```

### AGENTS.md Responsibilities
해당사항 없음

### Custom Agent Definitions
해당사항 없음

### Skill and Script Inventory
해당사항 없음

### Skill Creation Rules
> 이 설계서에 정의된 모든 스킬은 구현 시 반드시 `skill-creator` 스킬(`/skill-creator`)을 사용하여 생성할 것.

### Core Artifacts
| Path | Format | Producer | Purpose |
|---|---|---|---|
| `blueprint-blog-v2.md` | md | Tim | 블로그 투트랙 고도화 아키텍처 |

## 4. Validation Checklist
- [ ] Every workflow step has all 9 required fields
- [ ] Intermediate artifacts use the `output/stepNN_<name>.<ext>` rule
- [ ] LLM vs code responsibilities are separated clearly
- [ ] Human review points are explicit where needed
- [ ] Codex skill paths use `.agents/skills/...`
- [ ] Codex custom subagents use `.codex/agents/*.toml`
- [ ] Skill additions or updates mention `skill-creator`
