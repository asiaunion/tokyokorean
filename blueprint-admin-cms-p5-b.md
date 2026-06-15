# Admin CMS Phase 5-B Codex Automation Blueprint
> Created: 2026-05-30
> Purpose: Codex implementation blueprint

## 0. Goals and Deliverables

### Primary Goal
GSF-Blog Admin CMS의 보안을 강화하고 최종 모니터링 체계를 점검하는 페이즈 5-B(Phase 5-B) 작업을 에이전트(Codex)가 최적의 방법론으로 안전하게 수행하도록 자동화된 워크플로우를 설계합니다.

### Success Definition
- 모든 Admin API(POST/PUT/DELETE)에 CSRF 검사 및 Rate Limiting이 누락 없이 적용됨.
- Astro Middleware를 통한 글로벌 보안 헤더 주입 완료.
- Audit Log(감사 로그) 조회 시 리소스 고갈을 방지하는 Limit 적용 완료.
- `npm run build` 결과 0 Error 보장.

### Out of Scope
- 새로운 Admin UI 페이지 추가
- 기존 `post_memos`, `posts` 테이블 스키마 변경
- 프로덕션 DB 리셋

## 1. Working Context

### Background
Phase 5-A(메모 살붙이기 연동)까지 완료된 GSF-Blog Admin CMS는 현재 인증 및 기본 보안 헬퍼(`security.ts`)는 마련되어 있으나, 각 API 엔드포인트에 실질적인 CSRF 및 Rate Limiting 검사 코드가 부분적으로 누락되어 있습니다. 글로벌 보안 헤더(X-Frame-Options 등) 또한 설정되지 않았습니다.

### Objective
에이전트가 코드를 정적 분석하여 보안 정책 누락 지점을 식별하고, 미들웨어 및 API 라우트에 보안 로직을 일관되게 주입하며, 빌드 검증까지 완수해야 합니다.

### Scope
- Included: `src/pages/admin/api/**/*.ts` 일괄 검사 및 수정, `src/middleware.ts` 신규 작성 및 반영.
- Excluded: 클라이언트 사이드(React) 로직 변경.

### Inputs
| Item | Format | Source | Notes |
|---|---|---|---|
| Admin API 라우트 파일 | .ts | src/pages/admin/api/ | 현재 프로젝트 소스코드 |
| security.ts 헬퍼 | .ts | src/admin/lib/ | 보안 유틸리티 함수 |

### Outputs
| Item | Format | Destination | Notes |
|---|---|---|---|
| Middleware 코드 | .ts | src/middleware.ts | 보안 헤더 주입용 |
| 수정된 API 코드 | .ts | src/pages/admin/api/ | CSRF & Rate limit 추가 |

### Constraints
- Astro SSR 환경 및 Vercel Edge 런타임 호환성을 유지해야 함.
- CSRF 검사는 GET/OPTIONS 요청에는 적용하지 않아야 함.

### Terms
| Term | Definition |
|---|---|
| Rate Limiting | 짧은 시간 내 과도한 API 호출을 차단하는 속도 제한 기법 |
| CSRF | 크로스 사이트 요청 위조 |

## 2. Workflow Definition

### End-to-End Flow
`[API Files] -> [Step 01] -> [Step 02] -> [Step 03] -> [Final Output]`

### LLM vs Code Boundary
| LLM handles | Code handles |
|---|---|
| 각 API의 성격에 맞는 Rate Limit 임계값 할당 및 코드 작성 | AST 분석 또는 파일 검색을 통한 대상 API 색인 (`grep_search`), 빌드 에러 검증 (`npm run build`) |

#### Step 01: Audit Context Analysis
1) Step Goal:
보안이 누락된 API 엔드포인트 리스트를 수집하고 어떤 정책(Rate Limit 설정값 등)을 적용할지 식별합니다.

2) Input / Output:
- Input: `src/pages/admin/api/` 디렉토리 목록
- Output: 적용 대상 API 리스트 및 설계

3) LLM Decision Area:
각 엔드포인트가 GET인지 POST인지 구분하고, `checkRateLimit` 및 `isCsrfAttack` 누락 여부 판단.

4) Code Processing Area:
파일 읽기(`view_file`), 리스트 검색(`run_command find`)

5) Success Criteria:
적용 대상 API 파일 경로 목록 도출

6) Validation Method:
Self-check (누락된 .ts 파일이 없는지 확인)

7) Failure Handling:
에러 시 재검색

8) Skills / Scripts:
- Skill: none
- Script: none

9) Intermediate Artifact Rule:
`output/step01_audit_analysis.json`

#### Step 02: Middleware & API Code Injection
1) Step Goal:
`src/middleware.ts` 생성 및 대상 API에 방어 코드를 안전하게 주입합니다.

2) Input / Output:
- Input: `output/step01_audit_analysis.json`
- Output: 수정된 `.ts` 파일들

3) LLM Decision Area:
기존 로직을 해치지 않고 `try-catch` 및 응답 흐름의 적절한 위치(초입 부분)에 보안 헬퍼 로직을 삽입.

4) Code Processing Area:
`multi_replace_file_content` 또는 `write_to_file` 실행

5) Success Criteria:
지정된 모든 API 라우트 코드 변경 완료

6) Validation Method:
Human review (사용자 중간 승인 권장) 및 Syntax 확인

7) Failure Handling:
특정 파일 변경 실패 시 해당 파일만 롤백 후 재시도

8) Skills / Scripts:
- Skill: none
- Script: none

9) Intermediate Artifact Rule:
`output/step02_injection_results.json`

#### Step 03: Build & Verification
1) Step Goal:
코드 변경 후 타입스크립트 및 Astro 빌드 정합성을 확인합니다.

2) Input / Output:
- Input: 수정된 전체 소스코드
- Output: `npm run build` 결과

3) LLM Decision Area:
에러 메시지 발생 시 원인 분석 후 코드 자동 패치.

4) Code Processing Area:
`npm run build` 터미널 실행

5) Success Criteria:
Exit code 0 (빌드 성공)

6) Validation Method:
CLI 실행 반환값 확인

7) Failure Handling:
에러 시 코드 롤백 또는 Step 02로 회귀하여 버그 수정

8) Skills / Scripts:
- Skill: none
- Script: none

9) Intermediate Artifact Rule:
`output/step03_build_log.txt`

### State Model
| State | Entry Condition | Exit Condition | Next State |
|---|---|---|---|
| `COLLECTING_REQUIREMENTS` | 요구사항 파악 중 | 설계서 준비됨 | `PLANNING` |
| `PLANNING` | 설계 작성 및 승인 대기 | 계획 확정 | `RUNNING_SCRIPT` |
| `RUNNING_SCRIPT` | 코드 분석 및 삽입 실행 | 처리 완료 | `VALIDATING` |
| `VALIDATING` | 빌드 및 에러 검증 | 결과 도출 | `DONE` or `FAILED` |
| `NEEDS_USER_INPUT` | 승인 또는 결정 필요 시 | 응답 받음 | `PLANNING` or `DONE` |
| `DONE` | 최종 작업 완료 | Terminal | none |
| `FAILED` | 치명적 에러 발생 | Terminal | none |

## 3. Implementation Spec

### Recommended Folder Structure
```text
/projects/GSF-Blog
  AGENTS.md
  /output
    step01_audit_analysis.json
```

### AGENTS.md Responsibilities
- 본 보안 패치 작업은 1회성 스크립트보다는 에이전트의 LLM 맥락 추론(어떤 API에 어떤 limit이 적합한지)이 필요하므로 Codex가 직접 코드를 편집합니다.

### Custom Agent Definitions
| Name | Path | Role | Required Fields |
|---|---|---|---|
| none | none | | |

### Skill and Script Inventory
| Name | Type | Role | Trigger Condition |
|---|---|---|---|
| skill-creator | skill | 요구사항에 따른 신규 스킬 생성 (이번 작업에선 불필요) | none |

### Skill Creation Rules
> 이 설계서에 정의된 모든 스킬은 구현 시 반드시 `skill-creator` 스킬(`/skill-creator`)을 사용하여 생성할 것.

### Core Artifacts
| Path | Format | Producer | Purpose |
|---|---|---|---|
| `output/step01_audit_analysis.json` | json | Codex | 대상 분석 |
| `output/step02_injection_results.json` | json | Codex | 변경 내역 트래킹 |
| `output/step03_build_log.txt` | text | System | 빌드 검증 |

## 4. Validation Checklist

- [ ] Every workflow step has all 9 required fields
- [ ] Intermediate artifacts use the `output/stepNN_<name>.<ext>` rule
- [ ] LLM vs code responsibilities are separated clearly
- [ ] Human review points are explicit where needed
- [ ] Codex skill paths use `.agents/skills/...`
- [ ] Codex custom subagents use `.codex/agents/*.toml`
- [ ] Skill additions or updates mention `skill-creator`
