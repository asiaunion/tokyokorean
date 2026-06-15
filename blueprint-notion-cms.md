# Notion CMS Content Pipeline Codex Automation Blueprint
> Created: 2026-05-31
> Purpose: Codex implementation blueprint

## 0. Goals and Deliverables

### Primary Goal

Notion을 1차 CMS로 사용하는 콘텐츠 파이프라인을 구축한다. 작성자(GSF, 아내)가 Notion에서 글을 쓰면 → 자동으로 변환·번역·배포되어 → Vercel/CF Pages에 라이브된다. 역으로 Git에 병합된 변경사항도 Notion으로 자동 동기화된다.

### Success Definition

- 작성자가 Notion에서 status: "발행요청" 변경 후 **5분 이내** Vercel Preview URL이 Notion 페이지에 기록된다.
- 작성자가 status: "발행승인" 변경 후 **main merge → 라이브 배포**까지 파이프라인이 인간 개입 없이 완료된다.
- Git main에 병합된 KO 포스트 변경이 **Notion 페이지에 역동기화**된다.
- SHA 충돌 감지 시 파이프라인이 자동 중단되고 Notion 코멘트로 알림이 전송된다.
- 아내 블로그(mayumiphoebe.com)에 동일 인프라가 적용된다.

### Out of Scope

- Admin CMS (Milkdown 에디터, Turso DB) 경로는 이 Blueprint 범위 밖. 두 경로는 공존.
- `citeSources` 필드의 Notion 관리 (Phase 4 — 이 Blueprint에선 AG 전용 유지).
- 아내 블로그 Admin CMS (아내 블로그는 Notion 전용 CMS).
- EN/JA 포스트의 역동기화 본문 (상태 표시만).
- 실시간(< 1분) 동기화.

---

## 1. Working Context

### Background

GSF-Blog는 Astro 기반, Vercel 배포. KO 원문 → EN/JA 번역 2-Pass 파이프라인을 deploy-blog 스킬로 운영 중. 현재 KO 포스트 38개. 이미 `@vercel/blob`, GitHub API SHA 기반 수정 로직(`src/admin/lib/github.ts`)이 구현되어 있다.

아내 블로그(mayumiphoebe.com)는 신규 Astro 프로젝트, CF Pages 호스팅, JA 원문 → KO 번역 방향.

### Objective

1. Notion DB polling(CF Worker) → GitHub Actions workflow_dispatch로 파이프라인 자동 실행
2. deploy-from-notion 스킬: Notion 블록 → KO `.md` 변환 → deploy-blog 위임
3. 역동기화: Git main merge 이벤트 → Notion 페이지 업데이트 (SHA Conflict Detection 포함)
4. Preview URL 자동 기록 → 발행승인 플로우

### Scope

- Included: GSF-Blog 1단계, 아내 블로그 2단계 인프라 확장
- Excluded: Admin CMS 경로, citeSources Notion 관리, 실시간 polling

### Inputs

| Item | Format | Source | Notes |
|---|---|---|---|
| Notion 페이지 (KO 원문) | Notion Block Tree | 작성자 Notion 워크스페이스 | 텍스트 + 이미지 블록 |
| Notion DB Properties | JSON | Notion API | status, slug, voiceRewriteSkip 등 |
| `notion-page-map.json` | JSON | scripts/ | slug ↔ Notion Page ID 매핑 |
| Git KO .md 파일 | Markdown | src/data/blog/ko/ | 역동기화 입력 |
| `GITHUB_SHA` (commit) | string | GitHub Actions env | Conflict Detection용 |

### Outputs

| Item | Format | Destination | Notes |
|---|---|---|---|
| KO .md 파일 | Markdown | `.blog-agent-stage/{slug}.ko.md` → `src/data/blog/ko/` | 변환 결과 |
| EN .md 파일 | Markdown | `src/data/blog/en/{slug}.md` | Pass 2 번역 결과 |
| JA .md 파일 | Markdown | `src/data/blog/ja/{slug}.md` | Pass 2 번역 결과 |
| Notion `previewUrl` | URL string | Notion page property | Vercel Preview URL |
| Notion `gitSha` | string | Notion page property | Conflict Detection용 |
| Notion comment | string | Notion page | 파이프라인 상태 알림 |
| `notion-page-map.json` | JSON | scripts/ | 부트스트랩 후 유지 |

### Constraints

- **Notion API Rate Limit**: 3 req/sec → 스크립트 단계에서 333ms 간격 필수
- **Vercel Blob**: `@vercel/blob` 패키지 이미 설치됨. Notion S3 presigned URL은 만료(1시간) 전 처리 필수
- **citeSources Zod 교차검증**: `content.config.ts`의 `citeSources URL ⊆ sources` 검증. Notion 변환 시 위반 시 Astro 빌드 실패
- **description 필수 필드**: `content.config.ts`에서 `description: z.string()` 필수. Notion DB에 반드시 property 추가
- **CF Worker 1분 cron 지연**: 최대 1분 delay 수용. 수동 트리거 fallback 필요
- **Admin CMS 동시 편집 금지**: 같은 slug를 Admin CMS + Notion 양쪽에서 동시 편집 시 충돌 발생 → 운영 규약으로 제어
- **CF Worker 환경변수 크기 제한**: `BLOGS_CONFIG` JSON 배열이 Cloudflare Workers 환경변수 크기 제한(64KB) 내에 있어야 함
- **GitHub Actions secret**: `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `VERCEL_TOKEN`, `CF_WORKER_GITHUB_TOKEN` 사전 등록 필요

### Terms

| Term | Definition |
|---|---|
| `발행요청` | Notion status 값. CF Worker가 감지하면 GitHub Actions 트리거 |
| `발행승인` | Notion status 값. CF Worker가 감지하면 main merge 실행 |
| `발행완료` | Notion status 값. main merge 후 자동 설정 |
| `처리중` | Notion status 값. 중복 트리거 방지용 중간 상태 |
| `gitSha` | Notion page property. 마지막으로 동기화된 Git commit SHA |
| `voiceRewriteSkip` | Notion Checkbox property. Pass 1 건너뛰기 여부 |
| `notion-page-map.json` | slug ↔ Notion Page ID 매핑 테이블 |
| feature branch | `notion/publish-{slug}-{timestamp}` 형식의 임시 브랜치 |
| BLOGS_CONFIG | CF Worker 환경변수. 다중 블로그 설정 JSON 배열 |

---

## 2. Workflow Definition

### End-to-End Flow

```
[Notion 작성] → [CF Worker polling] → [GitHub Actions trigger]
→ [Step 01: Notion→MD 변환] → [Step 02: 이미지 Blob 업로드]
→ [Step 03: Voice Rewrite (조건부)] → [Step 04: EN/JA 번역]
→ [Step 05: feature branch push] → [Vercel Preview 생성]
→ [Step 06: Preview URL → Notion 기록]
→ [작성자 발행승인] → [Step 07: main merge]
→ [Step 08: 역동기화 + SHA 갱신]
```

역동기화 독립 플로우:
```
[Git main push (KO)] → [Step 08: sync-git-to-notion]
→ [SHA Conflict Detection] → [일치: Notion 업데이트 | 불일치: 중단 + 알림]
```

### LLM vs Code Boundary

| LLM handles | Code handles |
|---|---|
| Pass 1 Voice Rewrite (GSF Voice 5대 규칙 적용) | Notion API 블록 fetch 및 MD 변환 |
| Pass 2 EN/JA 번역 (voice-consistent) | 이미지 URL 감지 + Vercel Blob 업로드 |
| frontmatter 생성 (category, description 판단) | Notion Properties → frontmatter 키 매핑 |
| Conflict 상황 설명 코멘트 작성 | SHA 비교 로직 (deterministic) |
| 번역 품질 자체 검증 (LLM self-check) | content.config.ts Zod 스키마 검증 |
| - | CF Worker cron, GitHub Actions 실행 |
| - | Notion status 업데이트, Preview URL 기록 |

---

#### Step 01: Notion 블록 → KO Markdown 변환

1) Step Goal:
Notion Page ID를 받아 블록 트리를 fetch하고, Astro content.config.ts 호환 KO Markdown을 생성한다.

2) Input / Output:
- Input: Notion Page ID, slug (GitHub Actions inputs)
- Output: `.blog-agent-stage/{slug}.ko.md` (frontmatter + 본문)

3) LLM Decision Area:
- description 필드 생성 (Notion property 없을 시 본문에서 추출)
- frontmatter category enum 검증 및 fallback 결정

4) Code Processing Area:
- `@notionhq/client` SDK로 블록 트리 fetch
- 블록 타입 → Markdown 변환 (heading_2→`##`, bulleted_list_item→`-`, image→`![alt](url)`, etc.)
- Notion Properties → frontmatter YAML 매핑
- voiceRewriteSkip boolean → `--skip-voice-rewrite` 플래그로 전달
- `notion-page-map.json` 조회/업데이트

5) Success Criteria:
- `.blog-agent-stage/{slug}.ko.md` 파일 생성됨
- frontmatter에 필수 필드(`title`, `description`, `pubDatetime`, `lang: ko`) 모두 포함
- `content.config.ts` Zod 스키마 dry-run 통과

6) Validation Method:
- `npx tsx scripts/notion-to-md.ts --validate {slug}` — Zod 스키마 검증 실행
- 필수 필드 누락 시 에러 목록 출력

7) Failure Handling:
- Notion API 404 → 즉시 abort. Notion 코멘트: "❌ 페이지를 찾을 수 없습니다. Page ID를 확인하세요."
- Zod 검증 실패 → abort + Notion 코멘트에 실패 필드 목록 기재. 자동 재시도 없음.
- Rate limit (429) → 333ms 대기 후 최대 3회 retry. 3회 초과 시 abort + 알림.

8) Skills / Scripts:
- Script: `scripts/notion-to-md.ts`
- Script: `scripts/notion-bootstrap.ts` (초기 38개 포스트 부트스트랩 전용)

9) Intermediate Artifact Rule:
`output/step01_{slug}_ko.md`

---

#### Step 02: 이미지 Vercel Blob 영구 업로드

1) Step Goal:
Step 01 출력 MD에서 Notion S3 presigned URL을 감지하고, Vercel Blob에 영구 업로드 후 URL 교체.

2) Input / Output:
- Input: `.blog-agent-stage/{slug}.ko.md` (Notion 이미지 URL 포함)
- Output: `.blog-agent-stage/{slug}.ko.md` (Blob 영구 URL로 교체됨)

3) LLM Decision Area:
- 없음 (완전 deterministic)

4) Code Processing Area:
- MD에서 `![...](https://prod-files-secure.s3...)` 패턴 추출 (regex)
- `fetch` → 이미지 버퍼 취득
- `@vercel/blob` `put()` 호출 → 영구 URL 취득
- MD 내 원본 URL → 영구 URL 치환

5) Success Criteria:
- MD 내 Notion S3 URL이 0개
- 모든 이미지 URL이 `blob.vercel-storage.com` 도메인

6) Validation Method:
- regex로 Notion S3 URL 잔존 여부 체크
- Blob URL HTTP 200 응답 확인

7) Failure Handling:
- 이미지 fetch 실패(404/403) → 해당 이미지 URL을 원본 유지 + 경고 코멘트 추가 후 진행
- Vercel Blob 업로드 실패 → 최대 3회 retry. 초과 시 abort + Notion 코멘트 알림
- Notion presigned URL 만료 (1시간 제한) → 파이프라인 시작 시 바로 처리하므로 만료 위험 낮음. 만료 감지(403) 시 abort + 알림.

8) Skills / Scripts:
- Script: `scripts/notion-to-md.ts` (이미지 처리 함수 포함)

9) Intermediate Artifact Rule:
`output/step02_{slug}_blob_replaced.md`

---

#### Step 03: Voice Rewrite (Pass 1, 조건부)

1) Step Goal:
`voiceRewriteSkip=false`인 경우 KO 초안에 GSF Voice 5대 규칙을 적용해 재작성한다.

2) Input / Output:
- Input: `.blog-agent-stage/{slug}.ko.md`, `voiceRewriteSkip` flag
- Output: 재작성된 KO 본문 (frontmatter 무변경, 본문만 교체)

3) LLM Decision Area:
- GSF Voice 5대 규칙 적용 (전문 용어 해설, 문장 단순화, 1인칭 경험 삽입, 저자 의견 추가, 오프닝 훅)
- 사실·구조·수치 무변경 여부 자체 검증

4) Code Processing Area:
- `voiceRewriteSkip=true` 시 Step 03 전체 skip → Step 04로 직진
- Gemini API 호출 (LLM inference)
- 재작성 전/후 diff 생성 (선택적 로깅)

5) Success Criteria:
- 재작성된 KO 본문에 5대 규칙 각각 최소 1회 적용됨 (LLM self-check)
- frontmatter 필드 무변경
- 본문 길이 ±20% 이내

6) Validation Method:
- LLM self-check: "5대 규칙 체크리스트 점검 후 합격/불합격 판단"
- 불합격 시 재작성 1회 재시도

7) Failure Handling:
- Gemini API timeout/오류 → 최대 2회 retry. 실패 시 원본 KO 유지하고 Step 04 진행 + 경고 Notion 코멘트
- LLM self-check 2회 실패 → 원본 KO 유지 + 경고 코멘트 후 진행 (abort하지 않음)

> **⚠️ 인터페이스 명세 (deploy-blog SKILL.md 수정 필요)**
> deploy-blog의 Step 1 "Pass 1"은 현재 사용자 확인 게이트를 포함한다.
> GitHub Actions 자동화 경로에서는 사용자 게이트 없이 진행해야 한다.
> → deploy-blog에 `--automated` 플래그 추가: 플래그 있을 시 Pass 1 후 사용자 확인 생략.

8) Skills / Scripts:
- Skill: `deploy-from-notion` (Codex 실행 경로)
- Script: `scripts/voice-rewrite.ts` (GitHub Actions 자동화 경로)

9) Intermediate Artifact Rule:
`output/step03_{slug}_voice_rewritten.md`

---

#### Step 04: EN/JA 번역 (Pass 2)

1) Step Goal:
승인된 KO를 기반으로 EN/JA 번역 파일을 생성한다.

2) Input / Output:
- Input: `.blog-agent-stage/{slug}.ko.md` (Voice Rewrite 완료 또는 원본)
- Output: `src/data/blog/en/{slug}.md`, `src/data/blog/ja/{slug}.md`

3) LLM Decision Area:
- EN: 뉴스레터 톤, 1인칭 필수, 전문 용어 em dash 해설
- JA: 경어체(〜です・〜ます), 전문 용어 괄호 병기, 친절한 컨설턴트 톤

4) Code Processing Area:
- frontmatter `lang` 필드만 변경 (`en` / `ja`)
- 나머지 frontmatter 키(pubDatetime, tags, category 등) 그대로 복사
- `sources` URL 배열 무변경 유지

5) Success Criteria:
- EN/JA 파일 생성됨
- frontmatter Zod 검증 통과
- `sources` URL 배열이 KO와 동일

6) Validation Method:
- Astro `content.config.ts` dry-run 빌드 (`astro check`)
- frontmatter 필수 필드 누락 여부 regex 검사

7) Failure Handling:
- Gemini API 오류 → 최대 2회 retry. 초과 시 abort + Notion 코멘트
- Zod 검증 실패 → LLM에게 수정 지시 후 1회 재생성. 실패 시 abort + 오류 필드 목록 알림.

8) Skills / Scripts:
- Skill: `deploy-blog` (Pass 2 위임, `--automated` 플래그)
- Script: `scripts/translate.ts` (GitHub Actions 자동화 경로)

9) Intermediate Artifact Rule:
`output/step04_{slug}_en.md`, `output/step04_{slug}_ja.md`

---

#### Step 05: feature branch push

1) Step Goal:
변환·번역된 3개 파일을 feature branch에 push하고 Vercel Preview를 트리거한다.

2) Input / Output:
- Input: `src/data/blog/ko/{slug}.md`, `en/{slug}.md`, `ja/{slug}.md`
- Output: GitHub feature branch `notion/publish-{slug}-{timestamp}` 생성됨

3) LLM Decision Area:
- 없음

4) Code Processing Area:
- `git checkout -b notion/publish-{slug}-{timestamp}`
- `git add src/data/blog/`
- `git commit -m "feat(notion): [{slug}] Notion 발행 파이프라인 자동 생성 (ko/en/ja)"`
- `git push origin notion/publish-{slug}-{timestamp}`
- GitHub Actions: `blog-validate.yml` 자동 실행됨 (push 이벤트)

5) Success Criteria:
- feature branch가 원격에 존재함
- `blog-validate.yml` CI 통과

6) Validation Method:
- GitHub API로 branch 존재 여부 확인
- `blog-validate.yml` 워크플로우 상태 polling (최대 10분)

7) Failure Handling:
- `blog-validate.yml` 실패 → push 유지 + Notion 코멘트: "❌ CI 실패 — [로그 URL]"
- git push 실패(권한 오류) → abort + Notion 코멘트 + GitHub Actions 로그 URL 기재
- CI 타임아웃(10분 초과) → 경고 코멘트 후 다음 단계 진행 (Preview URL 취득 시도)

8) Skills / Scripts:
- Script: GitHub Actions `notion-publish.yml` Step 내 shell commands

9) Intermediate Artifact Rule:
없음 (Git 상태가 artifact)

---

#### Step 06: Preview URL 취득 → Notion 기록

1) Step Goal:
Vercel Preview URL을 취득하여 Notion 페이지 property와 comment에 기록한다.

2) Input / Output:
- Input: feature branch 이름, `VERCEL_TOKEN` secret
- Output: Notion `previewUrl` property, Notion comment "✅ Preview: {url}"

3) LLM Decision Area:
- 없음

4) Code Processing Area:
- `vercel ls --token=$VERCEL_TOKEN` 또는 Vercel API polling으로 Preview URL 취득
- Polling 주기: 30초 × 최대 10회 (5분 타임아웃)
- Notion PATCH API: `previewUrl` property 업데이트
- Notion POST `/comments`: "✅ Preview 준비됨: {url}" 코멘트

5) Success Criteria:
- Notion 페이지 `previewUrl` property가 `https://` URL로 채워짐
- Notion 코멘트 전송 완료

6) Validation Method:
- Notion API GET으로 `previewUrl` property 값 확인

7) Failure Handling:
- Vercel Preview URL 5분 내 미생성 → Notion 코멘트: "⚠️ Preview URL을 아직 가져오지 못했습니다. 잠시 후 직접 확인해주세요." 후 종료
- Notion API 쓰기 실패 → 최대 3회 retry. 실패 시 GitHub Actions 로그에 URL 출력.

8) Skills / Scripts:
- Script: GitHub Actions `notion-publish.yml` Step 내 Vercel CLI + Notion API 호출

9) Intermediate Artifact Rule:
없음

---

#### Step 07: 발행승인 → main merge

1) Step Goal:
작성자가 Notion에서 status: "발행승인" 변경 시 CF Worker가 감지하고 GitHub API로 feature branch를 main에 merge한다.

2) Input / Output:
- Input: CF Worker가 감지한 "발행승인" 이벤트, feature branch 이름
- Output: main branch merge commit, Vercel 라이브 배포

3) LLM Decision Area:
- 없음

4) Code Processing Area:
- CF Worker: Notion DB polling → status="발행승인" 감지
- GitHub API: `POST /repos/{repo}/merges` 또는 `PUT /repos/{repo}/pulls/{pull_number}/merge`
  - **주의**: feature branch에 대한 PR을 먼저 생성한 후 merge하는 방식 권장 (audit trail)
- status → "발행완료" 자동 변경
- 기존 `blog-content-integrity.yml` 자동 실행됨 (main push 이벤트)

5) Success Criteria:
- main branch에 merge commit 존재
- Vercel 라이브 배포 완료 (HTTPS 200)
- Notion status = "발행완료"

6) Validation Method:
- Vercel API 또는 curl로 라이브 URL HTTP 200 확인
- Notion property 확인

7) Failure Handling:
- Merge conflict 발생 → abort + Notion 코멘트: "❌ Merge 충돌 발생. 수동으로 해결 후 재승인해주세요."
- `blog-content-integrity.yml` 실패 → merge commit 유지 + Notion 코멘트: "⚠️ 콘텐츠 무결성 검사 실패 — [로그 URL]"
- Vercel 배포 실패 → Notion 코멘트: "⚠️ 배포 오류 발생. Vercel 대시보드 확인 필요."

8) Skills / Scripts:
- Script: CF Worker (`workers/notion-poller/`)의 "발행승인" 처리 분기

9) Intermediate Artifact Rule:
없음

---

#### Step 08: 역동기화 (Git → Notion) + SHA Conflict Detection

1) Step Goal:
main branch에 KO 파일이 변경될 때 Notion 페이지에 역동기화하고, SHA 기반 충돌을 감지한다.

2) Input / Output:
- Input: 변경된 KO `.md` 파일, `GITHUB_SHA` (current commit), `notion-page-map.json`
- Output: Notion page 블록 업데이트, `gitSha` property 갱신, `translationStatus: "completed"`

3) LLM Decision Area:
- 없음 (완전 deterministic)

4) Code Processing Area:
- `git diff $BEFORE_SHA $GITHUB_SHA -- src/data/blog/ko/` 로 변경 파일 목록 취득
- 각 파일 frontmatter 파싱 (gray-matter)
- `notion-page-map.json`에서 Notion Page ID 조회
- **SHA Conflict Detection**:
  1. Notion `gitSha` property 읽기
  2. `git log --ancestry-path {notion_gitSha}..{current_sha}` 로 ancestry 확인
  3. notion_gitSha가 current_sha의 ancestor → 정상 → 업데이트 진행
  4. ancestor가 아님 → **즉시 중단** + Notion 코멘트: "⚠️ 충돌 감지: Git SHA와 Notion 기록이 불일치합니다. 수동 확인 필요."
- 정상 경로: KO 본문 블록 전체 교체 + properties 업데이트 + `gitSha` 갱신

5) Success Criteria:
- Notion 페이지 본문이 Git KO 파일과 동일
- `gitSha` = 현재 commit SHA
- `translationStatus` = "completed"

6) Validation Method:
- Notion GET으로 `gitSha` property 값 = `GITHUB_SHA` 확인

7) Failure Handling:
- SHA 불일치 → 즉시 중단 + Notion 코멘트 알림 (재시도 없음, 사람이 해결)
- `notion-page-map.json`에 slug 없음 (신규 포스트) → 신규 Notion 페이지 생성 후 map 업데이트
- Notion API 쓰기 실패 → 최대 3회 retry. 초과 시 GitHub Actions 로그 기록 + 알림.

8) Skills / Scripts:
- Script: `scripts/sync-git-to-notion.ts`
- Workflow: `.github/workflows/notion-sync.yml`

9) Intermediate Artifact Rule:
`output/step08_{slug}_sync_result.json`

---

### State Model

| State | Entry Condition | Exit Condition | Next State |
|---|---|---|---|
| `COLLECTING_REQUIREMENTS` | 작성자가 Notion에서 content 작성 중 | status="발행요청" 선택 | `PLANNING` |
| `PLANNING` | CF Worker가 "발행요청" 감지 | GitHub Actions workflow_dispatch 트리거 성공 | `RUNNING_SCRIPT` |
| `RUNNING_SCRIPT` | GitHub Actions 실행 중 (Step 01~06) | 모든 스텝 완료 또는 실패 | `VALIDATING` or `FAILED` |
| `VALIDATING` | Preview URL Notion 기록 완료 | 작성자가 Preview 확인 | `NEEDS_USER_INPUT` |
| `NEEDS_USER_INPUT` | 작성자가 Preview 검토 중 | status="발행승인" 또는 수정 요청 | `RUNNING_SCRIPT` (재발행) or `DONE` |
| `DONE` | main merge + Vercel 라이브 확인 완료 | (terminal) | none |
| `FAILED` | 복구 불가 오류 (SHA 충돌, Merge 충돌 등) | 사람이 수동 개입 | none |

역동기화 State Model:

| State | Entry Condition | Exit Condition | Next State |
|---|---|---|---|
| `RUNNING_SCRIPT` | main branch push (KO 변경) 이벤트 | sync-git-to-notion.ts 실행 완료 | `VALIDATING` or `FAILED` |
| `VALIDATING` | Notion gitSha 검증 | gitSha 일치 확인 | `DONE` |
| `FAILED` | SHA 불일치 또는 API 오류 | 사람 개입 | none |
| `DONE` | Notion 역동기화 완료 | (terminal) | none |

---

## 3. Implementation Spec

### Recommended Folder Structure

```text
/GSF-Blog (project root)
  AGENTS.md
  blueprint-notion-cms.md        ← 이 문서
  /.agents
    /skills
      /deploy-blog/              ← [MODIFY] --automated 플래그, .blog-agent-stage/ 우선 탐색 추가
        SKILL.md
      /deploy-from-notion/       ← [NEW] Codex 실행 경로 (AG가 수동 트리거 시)
        SKILL.md
        /scripts/
        /references/
  /scripts
    notion-bootstrap.ts          ← [NEW] 38개 포스트 부트스트랩
    notion-to-md.ts              ← [NEW] 공통 Notion→MD 변환 유틸
    sync-git-to-notion.ts        ← [NEW] 역동기화 + SHA Conflict Detection
  /workers
    /notion-poller/              ← [NEW] CF Worker 별도 프로젝트
      wrangler.toml
      src/index.ts
  /.github
    /workflows
      notion-publish.yml         ← [NEW] 발행 파이프라인
      notion-sync.yml            ← [NEW] 역동기화
  /.blog-agent-stage/            ← [NEW] 스테이징 디렉토리 (gitignore)
  /output/                       ← 중간 산출물 (gitignore)
```

### AGENTS.md Responsibilities

현재 `AGENTS.md`에 Notion 파이프라인 관련 내용 없음. 구현 완료 후 아래 내용 추가 필요:
- Notion 파이프라인 경로 설명 (CF Worker → GitHub Actions)
- Admin CMS와의 역할 분리 규약
- Conflict Detection 발생 시 처리 절차
- `notion-page-map.json` 위치 및 업데이트 규칙

### Custom Agent Definitions

| Name | Path | Role | Required Fields |
|---|---|---|---|
| 없음 | - | 단일 Codex agent + skills/scripts로 충분 | - |

> 멀티에이전트 구조는 미적용. CF Worker와 GitHub Actions가 오케스트라 역할을 하므로 Codex 수준의 커스텀 에이전트 불필요.

### Skill and Script Inventory

| Name | Type | Role | Trigger Condition |
|---|---|---|---|
| `deploy-from-notion` | skill | Notion → KO .md 변환 + deploy-blog 위임 (Codex 경로) | AG 대화에서 Notion 포스트 배포 요청 시 |
| `deploy-blog` | skill (MODIFY) | Pass 1 Voice Rewrite + Pass 2 번역 + git push | deploy-from-notion 위임 또는 직접 호출 |
| `scripts/notion-bootstrap.ts` | script | 38개 기존 포스트 → Notion DB 일괄 등록 | 1회성 초기화 |
| `scripts/notion-to-md.ts` | script | Notion 블록 → MD 변환 유틸 (Step 01~02) | GitHub Actions 및 deploy-from-notion 공용 |
| `scripts/sync-git-to-notion.ts` | script | 역동기화 + SHA Conflict Detection (Step 08) | `.github/workflows/notion-sync.yml` |
| `workers/notion-poller/` | CF Worker | Notion DB polling + GitHub Actions dispatch | Cloudflare 1분 cron |
| `.github/workflows/notion-publish.yml` | GitHub Actions | 발행 파이프라인 실행 (Step 01~06) | CF Worker workflow_dispatch |
| `.github/workflows/notion-sync.yml` | GitHub Actions | 역동기화 트리거 (Step 08) | main branch KO 파일 push |

### Skill Creation Rules

> 이 설계서에 정의된 모든 스킬은 구현 시 반드시 `skill-creator` 스킬(`/skill-creator`)을 사용하여 생성할 것.
> 직접 SKILL.md를 수동 작성하지 말 것 — 규격 불일치 및 트리거 실패의 원인이 됨.

skill-creator가 보장하는 규격:
1. SKILL.md frontmatter (`name`, `description`) 필수 필드 준수
2. `description`의 트리거 정확도 최적화 (eval 기반 optimization loop)
3. 스킬 저장 위치 `.agents/skills/<skill-name>/` 규격 준수
4. 폴더 구조 (`SKILL.md` + `scripts/` + `references/`) 규격 준수
5. Progressive disclosure: SKILL.md 본문 500줄 이내, 대용량 참조는 `references/`로 분리
6. 테스트 프롬프트 실행 및 품질 검증 완료

### Core Artifacts

| Path | Format | Producer | Purpose |
|---|---|---|---|
| `scripts/notion-page-map.json` | JSON | notion-bootstrap.ts | slug ↔ Notion Page ID 매핑 (영구 유지) |
| `output/step01_{slug}_ko.md` | Markdown | notion-to-md.ts | Step 01 중간 산출물 |
| `output/step02_{slug}_blob_replaced.md` | Markdown | notion-to-md.ts | Step 02 중간 산출물 |
| `output/step03_{slug}_voice_rewritten.md` | Markdown | voice-rewrite.ts | Step 03 중간 산출물 |
| `output/step04_{slug}_en.md` | Markdown | translate.ts | Step 04 EN 중간 산출물 |
| `output/step04_{slug}_ja.md` | Markdown | translate.ts | Step 04 JA 중간 산출물 |
| `output/step08_{slug}_sync_result.json` | JSON | sync-git-to-notion.ts | 역동기화 결과 로그 |

---

## 4. Key Design Decisions & Edge Cases

### KD-1: deploy-blog 스킬 인터페이스 확장

현재 `deploy-blog`의 Pass 1 완료 후 사용자 확인 게이트가 존재한다.
GitHub Actions 자동화 경로에서는 이 게이트가 파이프라인을 멈춘다.

**해결책**: `--automated` 플래그 추가.
- `--automated` 없음 (Codex 대화 경로): 기존 사용자 확인 게이트 유지
- `--automated` 있음 (GitHub Actions 경로): Pass 1 → Pass 2 자동 진행

추가로 `.blog-agent-stage/` 디렉토리를 Step 0-B 탐색 경로에 추가해야 한다.

### KD-2: SHA Conflict Detection의 정확한 범위

현재 `src/admin/lib/github.ts`의 `getFileSha()`는 **파일 blob SHA**를 반환한다. 이는 commit SHA와 다르다.

`sync-git-to-notion.ts`에서 사용할 SHA는 **commit SHA**여야 한다:
- Notion `gitSha` property = "이 포스트가 마지막으로 Notion과 동기화된 시점의 commit SHA"
- Conflict 판단: `git log --ancestry-path` 로 ancestry 확인 (단순 SHA 비교 아님)
- `getFileSha()` 재활용 불가 → `sync-git-to-notion.ts`에서 별도로 commit SHA 관리

### KD-3: CF Worker에서 GitHub Token 관리

CF Worker는 `actions: write` 권한의 Fine-grained PAT을 사용한다.
- 이 토큰은 **CF Worker Secret**으로 저장 (`wrangler secret put CF_WORKER_GITHUB_TOKEN`)
- GitHub Actions `GITHUB_TOKEN`과 별개
- BLOGS_CONFIG의 `githubToken` 필드에 토큰 직접 삽입 금지 → Secret 참조 방식 사용

### KD-4: "발행승인" → merge 방식

단순 `POST /repos/{repo}/merges` 대신 **PR 생성 후 merge** 방식 권장:
- Audit trail (누가 언제 승인했는지 Git history에 기록)
- `blog-content-integrity.yml`의 PR 이벤트 트리거와 연계 가능
- CF Worker: `POST /repos/{repo}/pulls` → `PUT /repos/{repo}/pulls/{number}/merge`

### KD-5: notion-page-map.json 동기화 문제

`notion-page-map.json`은 GitHub에 commit된다.
신규 포스트 추가 시 `sync-git-to-notion.ts`에서 새 Notion 페이지 생성 후 map을 업데이트하고 commit해야 한다.
→ `notion-sync.yml` 워크플로우에서 map 업데이트 commit 단계 추가 필요.

### KD-6: Admin CMS 동시 편집 충돌

SHA Conflict Detection은 **Notion 경로와 Git 경로 간 충돌**을 감지하지만, Admin CMS와 Notion이 동시에 같은 slug를 편집하는 경우는 **운영 규약**으로 제어해야 한다:
- `AGENTS.md`에 "같은 포스트를 Admin CMS + Notion에서 동시 편집 금지" 명시
- 장기적으로: Notion `gitSha`를 "현재 편집 잠금 보유자" 표시에 활용 가능

### KD-7: 아내 블로그 파이프라인 차이점

| 항목 | GSF-Blog | 아내 블로그 |
|---|---|---|
| 원문 언어 | KO | JA |
| Voice Rewrite | 조건부 (checkbox) | 없음 (항상 skip) |
| 번역 방향 | KO → EN/JA | JA → KO |
| 이미지 스토리지 | Vercel Blob | Cloudflare R2 |
| 호스팅 | Vercel | CF Pages |
| Notion 토큰 | `NOTION_TOKEN` | `WIFE_NOTION_TOKEN` |
| content.config.ts | sources/citeSources 포함 | 단순화 버전 |

2단계 구현 시 `workers/notion-poller/`의 BLOGS_CONFIG 배열에 항목 추가만으로 확장 가능.

---

## 4. Validation Checklist

- [ ] Every workflow step has all 9 required fields
- [ ] Intermediate artifacts use the `output/stepNN_<name>.<ext>` rule
- [ ] LLM vs code responsibilities are separated clearly
- [ ] Human review points are explicit where needed
- [ ] Codex skill paths use `.agents/skills/...`
- [ ] Codex custom subagents use `.codex/agents/*.toml`
- [ ] Skill additions or updates mention `skill-creator`
- [ ] 구현 전 확인 필요: Notion Integration Token 발급 (`NOTION_TOKEN`, `NOTION_DATABASE_ID`)
- [ ] 구현 전 확인 필요: CF Worker GitHub Fine-grained PAT 발급 (`actions: write`)
- [ ] 구현 전 확인 필요: GitHub Actions secrets 등록 (`VERCEL_TOKEN`, `NOTION_TOKEN` 등)
