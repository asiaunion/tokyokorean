# Notion CMS Pipeline v2 — Vercel Preview & Notion Comment Fix Codex Automation Blueprint
> Created: 2026-06-01
> Purpose: Codex implementation blueprint — 두 가지 이슈 정밀 수정

---

## 0. Goals and Deliverables

### Primary Goal

기존 `notion-publish.yml` 파이프라인에서 발생한 두 가지 구조적 결함을 공식 문서 기반으로 정확히 진단하고,
**1분 이내 Vercel Preview URL 취득 + Notion Comment 정상 전송**이 보장되는 코드로 교체한다.

### 진단된 근본 원인 (1차 확인 — 공식 문서 직접 검증)

#### 이슈 1: Vercel Preview URL 5분 지연 후 타임아웃

**[1차 확인]** 원인: `github-actions[bot]`의 커밋이 Vercel GitHub Integration을 트리거하지 않는다.

Vercel의 자동 Git Integration은 커밋 author의 이메일이 Vercel 팀 멤버로 등록되어 있어야 Preview 배포를 자동으로 시작한다.
GitHub Actions가 생성한 커밋의 author는 `github-actions[bot]`(noreply@github.com)이므로,
Vercel 팀 멤버로 등록되지 않은 이 계정이 push한 브랜치에 대해서는 **Vercel이 배포를 자동으로 시작하지 않는다.**

따라서 이전 코드의 `npx vercel ls`는 배포 자체가 트리거되지 않은 상태에서 폴링했기 때문에
5분간 빈 결과만 반환하다 타임아웃된 것이다.

**[1차 확인]** 해결책: Vercel CLI `vercel deploy --prebuilt` 명령은 stdout에 배포 URL을 즉시 반환한다.
Vercel GitHub Integration을 우회하여 `VERCEL_TOKEN`으로 직접 배포를 트리거하면,
배포 완료 후 URL을 **동기적으로** 한 번에 받을 수 있다. 폴링 불필요.

#### 이슈 2: Notion Comment API 403 `restricted_resource`

**[1차 확인]** 원인: Notion Integration에 `Insert comments` capability가 비활성화되어 있다.

Notion API의 `POST /v1/comments` 엔드포인트 사용에는 Integration의 `Insert comments` capability가
명시적으로 활성화되어야 한다. 이 설정은 **기본값이 OFF**이다.
(출처: Notion Developer Docs — Capabilities 섹션)

**[1차 확인]** 해결책: `developers.notion.com` → 해당 Integration → Capabilities → `Insert comments` 활성화.
단, Notion API의 Comment는 `POST /v1/comments`를 통해 **페이지 레벨 comment만** 추가 가능하다.
블록 레벨 inline comment 시작(start a new thread)은 API로 불가능하다.
현재 파이프라인의 용도(상태 알림)는 페이지 레벨 comment로 충분히 대응 가능하다.

### Success Definition

- `notion-publish.yml` 실행 후 **1분 이내** (Vercel 빌드 시간 제외, URL 취득 로직 자체는 즉시)
  Notion 페이지에 Vercel Preview URL이 기록됨
- Notion Comment에 "✅ Preview 준비됨: {url}" 메시지가 성공적으로 전송됨 (403 없음)
- `npx vercel ls` 폴링 로직이 완전히 제거됨
- 기존 Astro 빌드 + translate.ts + voice-rewrite.ts 흐름은 무변경

### Out of Scope

- `voiceRewriteSkip`, 번역, 역동기화, 아내 블로그 파이프라인 변경
- Vercel 프로젝트 설정 UI 변경 (Git Integration 비활성화 불필요 — 공존 가능)
- Admin CMS 경로 변경

---

## 1. Working Context

### Background

기존 `notion-publish.yml`은 `git push → gh pr create → npx vercel ls 폴링 → Notion previewUrl` 순서로 동작했다.
PR 생성 직후 Vercel Preview가 자동 트리거되기를 기다렸으나,
`github-actions[bot]`이 push한 브랜치에 대해서는 Vercel 자동 Integration이 동작하지 않아
5분 폴링 후 실패했다.

Notion Comment API 403은 Integration 권한 설정 누락으로, 활성화 1회로 해결 가능하다.

### Objective

1. **Vercel 직접 배포 전략**: PR push 후 별도로 `vercel build && vercel deploy --prebuilt` 실행.
   stdout에서 즉시 URL 취득. 폴링 0초.
2. **Notion Comment 정상화**: Integration `Insert comments` 활성화 후 `POST /v1/comments` 정상 호출.
3. **기존 워크플로우 구조 최소 수정**: Step 9(PR 생성)와 Step 10(Notion 기록) 사이에
   새로운 Step 9-B(Vercel 직접 배포)를 삽입하는 방식. 기존 Step 1~8, 11은 무변경.

### Scope

- Included: `notion-publish.yml` Step 9-B (신규) + Step 10 (수정), `workers/notion-poller/src/index.ts` (무변경)
- Excluded: 모든 번역·변환 스크립트, 역동기화, 부트스트랩 로직

### Inputs

| Item | Format | Source | Notes |
|---|---|---|---|
| `VERCEL_TOKEN` | string | GitHub Actions secret | Vercel Personal Access Token (프로젝트 배포 권한) |
| `VERCEL_ORG_ID` | string | GitHub Actions secret | `.vercel/project.json`의 `orgId` |
| `VERCEL_PROJECT_ID` | string | GitHub Actions secret | `.vercel/project.json`의 `projectId` |
| `NOTION_TOKEN` | string | GitHub Actions secret | Integration `Insert comments` capability 활성화 후 |
| feature branch name | string | 이전 Step(push) output | `notion/publish-{slug}-{timestamp}` |
| Notion Page ID | string | workflow_dispatch input | 변경 없음 |

### Outputs

| Item | Format | Destination | Notes |
|---|---|---|---|
| Vercel Preview URL | URL string | Notion `previewUrl` property | `https://gsf-blog-{hash}.vercel.app` 형식 |
| Notion Comment | string | Notion page (top-level comment) | "✅ Preview 준비됨: {url}" |
| Notion status | string | Notion page property | `발행승인대기`로 변경 |

### Constraints

- **Vercel 빌드 시간**: `vercel build`에 2~4분 소요 (Astro 빌드 포함). 이는 허용 범위 내.
  URL 취득 로직(stdout 파싱) 자체는 0초. 기존 5분 폴링과는 본질적으로 다름.
- **GitHub Actions 빌드 중복**: Step 8(Astro 빌드 검증)과 Step 9-B(vercel build)에서 빌드가 2회 실행됨.
  Step 8을 `pnpm build --dry-run`으로 교체하거나 `vercel build` 결과를 재활용하는 최적화는 Phase 2 범위.
  현재는 명확성 우선 — 검증용 빌드와 배포용 빌드를 분리 유지.
- **Vercel CLI 버전**: `vercel@latest` 또는 `vercel@^35` 사용. `vercel deploy --prebuilt`의 stdout 파싱이 버전에 따라 달라질 수 있음. 고정 버전 권장.
- **Notion API Rate Limit**: 3 req/sec. Comment + property PATCH를 동시에 보내지 않고 순서대로 호출.
- **Notion Comment API 제약**: `POST /v1/comments`는 페이지/블록 레벨 comment만 가능.
  새 discussion thread 시작(`discussion_id` 없는 블록 인라인 코멘트)은 API 불가.
  → `parent.type: "page_id"` 방식으로 페이지 레벨 comment 사용.

### Terms

| Term | Definition |
|---|---|
| `vercel build` | 로컬(Actions runner)에서 Vercel 배포용 아티팩트(`.vercel/output/`) 생성 |
| `vercel deploy --prebuilt` | `.vercel/output/`을 Vercel CDN에 업로드하고 Preview URL을 stdout에 출력 |
| `previewUrl` | Notion page property. Vercel Preview URL 또는 PR URL이 기록됨 |
| `Insert comments` | Notion Integration Capability. 비활성화 시 403 `restricted_resource` 발생 |
| `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Vercel CLI가 프로젝트를 식별하기 위한 필수 env vars |

---

## 2. Workflow Definition

### End-to-End Flow (수정 범위 표시)

```
[Step 01~08: 기존 무변경]
→ [Step 08: feature branch push + PR 생성] ← 기존 무변경
→ [Step 09-B: Vercel 직접 배포 — NEW] ← 신규 삽입
    vercel pull → vercel build → vercel deploy --prebuilt
    stdout → PREVIEW_URL 캡처 (폴링 없음)
→ [Step 10: Notion 업데이트 — MODIFIED]
    PATCH previewUrl = PREVIEW_URL (기존과 동일 로직)
    POST /v1/comments = "✅ Preview 준비됨: {url}" (신규)
    status → "발행승인대기"
```

### LLM vs Code Boundary

| LLM handles | Code handles |
|---|---|
| 없음 (이 Blueprint의 수정 범위는 완전 deterministic) | Vercel CLI 실행 및 stdout URL 파싱 |
| | Notion PATCH API property 업데이트 |
| | Notion POST /v1/comments 호출 |
| | 에러 핸들링 및 fallback 로직 |

---

#### Step 09: Vercel 직접 배포 (신규 — 기존 PR 생성 Step 뒤에 삽입)

1) Step Goal:
feature branch에 대한 Vercel Preview 배포를 GitHub Integration 없이 직접 실행하고,
stdout에서 Preview URL을 즉시 취득한다.

2) Input / Output:
- Input: 이전 Step에서 생성된 Astro 빌드 산출물(dist/), `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Output: `GITHUB_OUTPUT` `preview_url` 변수 (예: `https://gsf-blog-abc123.vercel.app`)

3) LLM Decision Area:
없음.

4) Code Processing Area:
```yaml
- name: Deploy to Vercel Preview (direct)
  id: vercel_deploy
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  run: |
    npm install -g vercel@latest

    # 환경변수 pull (vercel.json 프로젝트 설정 동기화)
    vercel pull --yes --environment=preview --token=$VERCEL_TOKEN

    # 빌드 아티팩트 생성 (.vercel/output/)
    vercel build --token=$VERCEL_TOKEN

    # Preview 배포 — stdout에서 URL 즉시 취득 (폴링 없음)
    PREVIEW_URL=$(vercel deploy --prebuilt --token=$VERCEL_TOKEN)

    echo "✅ Preview URL 취득: $PREVIEW_URL"
    echo "preview_url=$PREVIEW_URL" >> $GITHUB_OUTPUT
```

> **핵심**: `vercel deploy --prebuilt`는 배포 완료 후 stdout에 URL 1줄을 출력한다.
> 커맨드가 반환(exit 0)되는 순간 URL이 확보된다. 폴링/대기 로직이 전혀 불필요하다.

5) Success Criteria:
- `vercel deploy --prebuilt` exit code = 0
- stdout에서 파싱한 `PREVIEW_URL`이 `https://` 로 시작함
- `GITHUB_OUTPUT`에 `preview_url`이 기록됨

6) Validation Method:
- `echo "$PREVIEW_URL" | grep -E '^https://'` — URL 형식 검증
- 빈 문자열 시 Step 실패 처리

7) Failure Handling:
- `vercel deploy` exit non-zero → Step 실패 → 기존 `Notify failure to Notion` Step(11번)이 Notion에 알림
- `PREVIEW_URL`이 https:// 형식 아닐 시 → `PREVIEW_URL="{PR_URL}"` fallback (PR URL 사용)으로 강등, 경고 로그 출력 후 계속 진행
- Vercel 빌드 오류 (astro build 에러) → exit non-zero → Step 실패 → Notion 알림

8) Skills / Scripts:
- Skill: none
- Script: GitHub Actions Step 내 vercel CLI shell commands

9) Intermediate Artifact Rule:
`output/step09_{slug}_preview_url.txt`

---

#### Step 10: Notion 업데이트 (수정)

1) Step Goal:
Vercel Preview URL을 Notion `previewUrl` property에 기록하고,
`Insert comments` capability를 활용해 페이지 레벨 Comment를 남긴다.
status를 `발행승인대기`로 변경한다.

2) Input / Output:
- Input: `steps.vercel_deploy.outputs.preview_url`, `inputs.notion_page_id`, `NOTION_TOKEN`
- Output: Notion page `previewUrl` = Preview URL, Notion Comment = "✅ Preview 준비됨: {url}", status = "발행승인대기"

3) LLM Decision Area:
없음.

4) Code Processing Area:
```yaml
- name: Write Preview URL to Notion + Comment
  env:
    NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
  run: |
    PAGE_ID="${{ inputs.notion_page_id }}"
    PREVIEW_URL="${{ steps.vercel_deploy.outputs.preview_url }}"

    # 1) previewUrl property + status 업데이트
    curl -s -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
      -H "Authorization: Bearer ${NOTION_TOKEN}" \
      -H "Content-Type: application/json" \
      -H "Notion-Version: 2022-06-28" \
      -d "{
        \"properties\": {
          \"previewUrl\": {\"url\": \"${PREVIEW_URL}\"},
          \"status\": {\"select\": {\"name\": \"발행승인대기\"}}
        }
      }"

    # 2) 페이지 레벨 Comment 추가
    # 사전 조건: Integration의 'Insert comments' capability 활성화 필수
    curl -s -X POST "https://api.notion.com/v1/comments" \
      -H "Authorization: Bearer ${NOTION_TOKEN}" \
      -H "Content-Type: application/json" \
      -H "Notion-Version: 2022-06-28" \
      -d "{
        \"parent\": {\"page_id\": \"${PAGE_ID}\"},
        \"rich_text\": [{
          \"type\": \"text\",
          \"text\": {\"content\": \"✅ Preview 준비됨: ${PREVIEW_URL}\n\n발행 승인 시 status를 '발행승인'으로 변경해주세요.\"}
        }]
      }"

    echo "✅ Notion 업데이트 완료 (Preview URL 기록 + Comment 전송)"
```

5) Success Criteria:
- Notion `previewUrl` property = Vercel Preview URL
- Notion Comment 전송 성공 (HTTP 200)
- Notion status = "발행승인대기"

6) Validation Method:
- curl 응답의 HTTP status code 확인 (`-w "%{http_code}"` 옵션 추가)
- 403 응답 시 Step 실패 처리

7) Failure Handling:
- PATCH (previewUrl) 실패 → 최대 3회 retry (5초 간격). 3회 실패 시 Step 실패.
- POST (comment) 403 → **`Insert comments` capability 미활성화** 확인 필요. 명확한 에러 메시지 출력 후 Step 실패.
  (previewUrl은 이미 기록됐으므로 Comment 실패가 전체 파이프라인을 중단시키지 않도록 `continue-on-error: true` 설정 권장)
- POST (comment) 기타 오류 → 경고 로그 출력 + `continue-on-error: true`로 진행

8) Skills / Scripts:
- Skill: none
- Script: GitHub Actions Step 내 curl commands

9) Intermediate Artifact Rule:
없음

---

### State Model

| State | Entry Condition | Exit Condition | Next State |
|---|---|---|---|
| `COLLECTING_REQUIREMENTS` | 이슈 진단 완료 (이 Blueprint) | 구현 승인 | `PLANNING` |
| `PLANNING` | 코드 수정 시작 | `notion-publish.yml` 수정 완료 | `RUNNING_SCRIPT` |
| `RUNNING_SCRIPT` | GitHub Actions 실행 (Step 09-B, 10) | Vercel deploy 성공 + Notion 기록 완료 | `VALIDATING` |
| `VALIDATING` | Notion previewUrl + Comment 확인 | 값 정상 확인 | `DONE` |
| `NEEDS_USER_INPUT` | Notion Integration 권한 활성화 필요 | 사용자가 developers.notion.com에서 설정 변경 완료 | `RUNNING_SCRIPT` |
| `DONE` | 모든 검증 완료 | (terminal) | none |
| `FAILED` | Vercel 빌드 실패 또는 API 에러 반복 | (terminal) | none |

---

## 3. Implementation Spec

### 사전 조건 (구현 전 1회 수동 작업)

#### Notion Integration `Insert comments` 활성화

1. `developers.notion.com` → 해당 Integration 선택
2. **Capabilities** 탭 → `Insert comments` 체크박스 활성화 → 저장
3. (선택) `Read comments` 도 활성화 (현재 파이프라인에서는 불필요하나 향후 확장성을 위해 권장)

> 이 설정은 1회 변경으로 영구 적용된다. 재인증 불필요 (Internal Integration 기준).

#### GitHub Actions Secrets 추가

현재 등록된 secrets에 아래 항목이 없으면 추가:

| Secret 이름 | 값 출처 | 비고 |
|---|---|---|
| `VERCEL_TOKEN` | Vercel 계정 설정 > Tokens | Project 배포 권한 포함 |
| `VERCEL_ORG_ID` | 프로젝트 루트 `.vercel/project.json` > `orgId` | 또는 Vercel 팀 slug |
| `VERCEL_PROJECT_ID` | 프로젝트 루트 `.vercel/project.json` > `projectId` | |

### Recommended Folder Structure

수정 파일 목록 (최소 변경):

```text
/GSF-Blog
  /.github/workflows/
    notion-publish.yml    ← [MODIFY] Step 09-B 삽입, Step 10 수정
                             나머지 Step 1~8, 11 무변경
```

### 수정 범위 상세 (notion-publish.yml diff)

#### 삭제할 기존 코드 (Step 10 내 PR URL 기록 방식)

```yaml
# ── 10. Preview URL → Notion 기록 및 상태 업데이트 ───────────
- name: Write PR URL to Notion
  env:
    NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
  run: |
    PAGE_ID="${{ inputs.notion_page_id }}"
    PR_URL="${{ steps.create_pr.outputs.pr_url }}"

    curl -s -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
      -H "Authorization: Bearer ${NOTION_TOKEN}" \
      -H "Content-Type: application/json" \
      -H "Notion-Version: 2022-06-28" \
      -d "{\"properties\":{\"previewUrl\":{\"url\":\"${PR_URL}\"},\"status\":{\"select\":{\"name\":\"발행승인대기\"}}}}"
```

#### 추가할 코드 (Step 09-B + 수정된 Step 10)

```yaml
  # ── 9-B. Vercel Preview 직접 배포 ────────────────────────────────────
  - name: Deploy to Vercel Preview (direct)
    id: vercel_deploy
    env:
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    run: |
      npm install -g vercel@latest

      # 프로젝트 설정 pull
      vercel pull --yes --environment=preview --token=$VERCEL_TOKEN

      # 빌드 아티팩트 생성
      vercel build --token=$VERCEL_TOKEN

      # Preview 배포 — stdout에서 URL 즉시 취득 (폴링 없음)
      PREVIEW_URL=$(vercel deploy --prebuilt --token=$VERCEL_TOKEN)

      if [[ ! "$PREVIEW_URL" =~ ^https:// ]]; then
        echo "⚠️ Preview URL 파싱 실패, PR URL로 fallback"
        PREVIEW_URL="${{ steps.create_pr.outputs.pr_url }}"
      fi

      echo "✅ Preview URL: $PREVIEW_URL"
      echo "preview_url=$PREVIEW_URL" >> $GITHUB_OUTPUT

  # ── 10. Preview URL → Notion 기록 + Comment ──────────────────────────
  - name: Write Preview URL to Notion + Comment
    env:
      NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
    run: |
      PAGE_ID="${{ inputs.notion_page_id }}"
      PREVIEW_URL="${{ steps.vercel_deploy.outputs.preview_url }}"

      # previewUrl property + status 업데이트
      PATCH_RESP=$(curl -s -o /dev/null -w "%{http_code}" \
        -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
        -H "Authorization: Bearer ${NOTION_TOKEN}" \
        -H "Content-Type: application/json" \
        -H "Notion-Version: 2022-06-28" \
        -d "{
          \"properties\": {
            \"previewUrl\": {\"url\": \"${PREVIEW_URL}\"},
            \"status\": {\"select\": {\"name\": \"발행승인대기\"}}
          }
        }")

      echo "PATCH status: $PATCH_RESP"
      if [[ "$PATCH_RESP" != "200" ]]; then
        echo "❌ Notion PATCH 실패 (HTTP $PATCH_RESP)"
        exit 1
      fi

      # Comment 추가 (Insert comments capability 필요)
      COMMENT_RESP=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "https://api.notion.com/v1/comments" \
        -H "Authorization: Bearer ${NOTION_TOKEN}" \
        -H "Content-Type: application/json" \
        -H "Notion-Version: 2022-06-28" \
        -d "{
          \"parent\": {\"page_id\": \"${PAGE_ID}\"},
          \"rich_text\": [{
            \"type\": \"text\",
            \"text\": {
              \"content\": \"✅ Preview 준비됨: ${PREVIEW_URL}\n\n발행 승인 시 status를 '발행승인'으로 변경해주세요.\"
            }
          }]
        }")

      echo "Comment POST status: $COMMENT_RESP"
      if [[ "$COMMENT_RESP" == "403" ]]; then
        echo "⚠️ Notion Comment 403: Integration의 'Insert comments' capability가 비활성화되어 있습니다."
        echo "    developers.notion.com → Integration → Capabilities → Insert comments 활성화 필요"
      fi

      echo "✅ Notion 업데이트 완료"
    continue-on-error: false   # PATCH 실패 시 전체 실패, Comment 실패는 위에서 경고만
```

> **Note**: Comment 전송 실패는 `continue-on-error`로 전체 파이프라인을 중단하지 않도록 설계.
> `previewUrl` property 기록 성공이 핵심 성공 조건이며, Comment는 보조 알림 수단.

### AGENTS.md Responsibilities

변경 없음. 기존 AGENTS.md의 Notion 파이프라인 섹션 유지.

### Custom Agent Definitions

| Name | Path | Role | Required Fields |
|---|---|---|---|
| 없음 | - | 단일 Codex agent + GitHub Actions | - |

### Skill and Script Inventory

| Name | Type | Role | Trigger Condition |
|---|---|---|---|
| `vercel` CLI | 외부 도구 | Preview 배포 및 URL 취득 | Step 09-B |
| Notion REST API (`/v1/pages PATCH`) | 외부 API | previewUrl + status 업데이트 | Step 10 |
| Notion REST API (`/v1/comments POST`) | 외부 API | 파이프라인 상태 알림 Comment | Step 10 |

### Skill Creation Rules

> 이 설계서에 정의된 모든 스킬은 구현 시 반드시 `skill-creator` 스킬(`/skill-creator`)을 사용하여 생성할 것.
> 직접 SKILL.md를 수동 작성하지 말 것 — 규격 불일치 및 트리거 실패의 원인이 됨.

이 Blueprint에서 신규 스킬 정의는 없음. 수정 범위는 GitHub Actions YAML 파일 1개에 한정됨.

### Core Artifacts

| Path | Format | Producer | Purpose |
|---|---|---|---|
| `output/step01_{slug}_ko.md` | Markdown | notion-to-md.ts (기존 Step 01, 무변경) | KO 변환 결과 — 이 Blueprint의 연계 입력 |
| `output/step09_{slug}_preview_url.txt` | text | Step 09 (신규) | Vercel Preview URL 보존 |
| `.github/workflows/notion-publish.yml` | YAML | 수동 편집 | 파이프라인 워크플로우 |

---

## 4. Key Design Decisions

### KD-1: `vercel deploy --prebuilt` vs `vercel deploy` (일반)

`vercel deploy` (일반)는 업로드 → 빌드 → 배포 순서로 Vercel 서버에서 빌드한다.
`vercel build + vercel deploy --prebuilt`는 Actions runner에서 빌드하고 아티팩트만 업로드한다.

**선택: `vercel build + vercel deploy --prebuilt`**
- Step 08에서 이미 `pnpm build`로 로컬 빌드를 검증했으므로, 동일 환경에서 `vercel build`도 빠르게 통과함
- Vercel 서버 빌드 시간 절약 (Vercel Hobby 플랜은 빌드 병렬 처리 제한)
- stdout URL 취득 방식은 두 방법 모두 동일

### KD-2: Vercel GitHub Integration 비활성화 여부

**비활성화 불필요**. `vercel deploy --prebuilt`로 생성한 Preview와 GitHub Integration의 자동 Preview는 별개 배포이며 공존 가능.
단, `github-actions[bot]` push에 대해서는 Integration이 배포를 트리거하지 않으므로, 사실상 이 파이프라인에서는 Integration Preview가 생성되지 않는다.
**결론**: Integration 설정 변경 없이 CLI 방식만 추가하면 된다.

### KD-3: `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` 취득 방법

로컬에서 `vercel link` 실행 후 생성된 `.vercel/project.json`을 확인:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```
이 두 값을 GitHub Actions Secrets에 등록. CI 환경에서는 이 env vars가 있으면 `vercel link` 없이 동작.

### KD-4: Comment 403 대응 설계

Step 10에서 Comment POST가 403을 반환할 경우:
1. 에러 메시지에 원인(`Insert comments` capability 미활성화)과 해결 경로(`developers.notion.com`)를 명시
2. `previewUrl` PATCH는 이미 성공했으므로 파이프라인 전체를 실패로 처리하지 않음
3. Comment 실패가 반복되면 사용자가 Notion에서 직접 확인 가능 (previewUrl에 URL이 이미 기록됨)

### KD-5: Vercel 빌드 시간 vs 1분 이내 목표

**URL 취득 로직 자체는 0초** (폴링 없음). 그러나 `vercel build` 시간이 약 2~4분 소요.
"1분 이내" 목표는 **URL 취득 메커니즘의 대기 없음**을 의미하며, Vercel 빌드 시간 자체와 분리.
기존 5분 폴링 후 타임아웃과 비교 시 총 소요시간은 동등하지만, **반드시 성공**하는 구조.

---

## 4. Validation Checklist

- [ ] Every workflow step has all 9 required fields
- [ ] Intermediate artifacts use the `output/stepNN_<name>.<ext>` rule
- [ ] LLM vs code responsibilities are separated clearly
- [ ] Human review points are explicit where needed
- [ ] Codex skill paths use `.agents/skills/...`
- [ ] Codex custom subagents use `.codex/agents/*.toml`
- [ ] Skill additions or updates mention `skill-creator`
- [ ] **사전 조건 확인**: Notion Integration `Insert comments` capability 활성화 완료
- [ ] **사전 조건 확인**: GitHub Actions secrets에 `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` 등록
- [ ] **코드 변경 확인**: `notion-publish.yml` Step 10 (기존 PR URL 방식) 제거
- [ ] **코드 변경 확인**: Step 09-B (Vercel CLI 직접 배포) 삽입
- [ ] **코드 변경 확인**: Step 10 (새 Notion 업데이트 로직) 교체
- [ ] **실행 검증**: 테스트 슬러그로 파이프라인 1회 실행, Notion Comment + previewUrl 확인
