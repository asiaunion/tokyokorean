---
name: deploy-from-notion
description: "Notion 페이지 또는 slug를 받아 KO .md 파일로 변환하고 deploy-blog 스킬에 위임하는 스킬. 이미지를 Vercel Blob에 영구 업로드하고, voiceRewriteSkip 설정을 반영해 Pass 1을 조건부로 실행한다. Use when the user asks to publish a Notion post, says 'Notion에서 배포해줘', 'Notion 포스트 올려줘', 'deploy from notion', 'deploy-from-notion', or provides a Notion page URL/ID for publishing."
---

# Deploy from Notion

## Overview

Notion 페이지(또는 slug)를 입력받아 다음 순서로 처리합니다:

1. **Notion → KO .md 변환** (`scripts/notion-to-md.ts`)
2. **이미지 Vercel Blob 업로드** (S3 presigned URL → 영구 URL)
3. **deploy-blog 위임** (voiceRewriteSkip 설정 반영)

**Trigger**: "Notion 포스트 배포", "Notion에서 올려줘", "deploy-from-notion", Notion URL 공유

---

## Step 0. 자율 탐색

### 0-A. 입력 식별

에이전트는 다음 입력 형태를 자동 인식한다:

```
1. Notion 페이지 URL: https://notion.so/... → 말미 32자리 = Page ID
2. Page ID 직접: 32자리 hex 문자열
3. slug: 하이픈 소문자 문자열 → notion-page-map.json에서 Page ID 조회
```

### 0-B. Page Map 확인

```bash
cat /Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog/scripts/notion-page-map.json 2>/dev/null || echo "{}"
```

slug만 주어졌고 Page Map에 없으면:
> "해당 slug가 notion-page-map.json에 없습니다. Notion 페이지 URL 또는 Page ID를 알려주세요."

### 0-C. 환경변수 확인

```bash
# 필수 환경변수 확인
echo "NOTION_TOKEN: ${NOTION_TOKEN:0:10}..."
echo "BLOB_READ_WRITE_TOKEN 또는 VERCEL_BLOB_TOKEN: ${BLOB_READ_WRITE_TOKEN:0:10}..."
```

누락된 환경변수가 있으면 즉시 보고하고 중단.

---

## Step 1. Notion → KO .md 변환

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog
npx tsx scripts/notion-to-md.ts --page-id <PAGE_ID> --slug <SLUG>
```

출력: `.blog-agent-stage/<slug>.ko.md`

실패 시:
- 404: "Notion 페이지를 찾을 수 없습니다. Page ID를 확인하세요."
- 권한 오류: "Integration이 해당 페이지에 공유되어 있는지 확인하세요."

---

## Step 2. 이미지 Vercel Blob 업로드

```bash
npx tsx scripts/notion-image-upload.ts --input .blog-agent-stage/<slug>.ko.md
```

스크립트가 자동으로:
1. MD에서 `prod-files-secure.s3` URL 패턴 감지
2. fetch → Vercel Blob `put()` 업로드
3. MD 내 URL 치환

⚠️ **이미지가 없는 경우** 이 단계를 건너뛴다.

---

## Step 3. deploy-blog 위임

`voiceRewriteSkip` 값에 따라 분기:

### voiceRewriteSkip = true (Notion checkbox 체크됨)

```
deploy-blog 스킬 호출:
- 입력 파일: .blog-agent-stage/<slug>.ko.md
- Pass 1(Voice Rewrite) 건너뜀
- Pass 2(EN/JA 번역) → git push까지 실행
```

### voiceRewriteSkip = false (기본값)

```
deploy-blog 스킬 호출:
- 입력 파일: .blog-agent-stage/<slug>.ko.md  
- Pass 1(Voice Rewrite) 정상 실행 → 사용자 확인 게이트
- 승인 후 Pass 2(EN/JA 번역) → git push
```

---

## Step 4. 완료 보고

```
✅ Notion → GSF-Blog 배포 완료
   slug: {slug}
   voiceRewriteSkip: {true/false}
   이미지: {N}개 Vercel Blob 업로드됨
   → deploy-blog Pass 2 이후 진행 중
```

---

## 주의사항

- Notion Integration이 해당 페이지에 **명시적으로 공유**되어 있어야 한다.
  (페이지 우상단 ··· → Connections → Integration 추가)
- 이미지 S3 presigned URL은 **1시간 내** 처리해야 한다.
- 기존 포스트(38개)는 `notion-bootstrap.ts`로 초기화 완료 후 slug로 호출 가능.

---

## 스킬 생성 규칙

이 스킬 수정 또는 재생성 시 반드시 `skill-creator` 스킬을 사용할 것.
직접 SKILL.md를 수동 작성하면 frontmatter 규격 불일치가 발생할 수 있다.
