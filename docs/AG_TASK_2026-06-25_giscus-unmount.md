# AG TASK — Giscus 댓글 언마운트 (AdSense 신청 전 에러 제거)
> 생성: 2026-06-25  
> 작성: Cursor (Joseph 요청)  
> 목적: 모든 포스트 하단 `An error occurred: giscus is not installed on this repository` **에러 노출 제거**  
> **범위 밖:** giscus.app 설정 · GitHub Discussions 활성화 · Giscus 앱 설치 · `repoId`/`categoryId` 입력

---

## 배경

| 사실 | 내용 |
|------|------|
| 증상 | `/posts/*/` 하단 **댓글** 섹션에 giscus 에러 메시지 노출 |
| 원인 | `GiscusComments.astro`가 마운트됐으나 `GISCUS_REPO_ID`·`GISCUS_CATEGORY_ID`가 **빈 문자열** (`TODO`) |
| AdSense 영향 | 댓글 **필수 아님** · 에러 문구는 **미완성 사이트 인상** → 제거 권장 |
| 복구 시점 | AdSense 승인 후 여유 있을 때 giscus 설정 완료 → 재마운트 |

CookieConsent와 동일 원칙: **동작하지 않는 기능은 프로덕션에 노출하지 않는다.**

---

## STEP 0 — 시작 스냅샷

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean

echo "=== PostDetails giscus 마운트 ==="
rg -n "GiscusComments" src/layouts/PostDetails.astro

echo "=== Giscus TODO IDs ==="
rg -n "GISCUS_REPO_ID|GISCUS_CATEGORY_ID" src/components/GiscusComments.astro

echo "=== 라이브 에러 (배포 전 baseline) ==="
curl -s https://tokyokorean.net/posts/tokyo-life-cost-of-living/ | grep -c 'giscus-comments' || true
curl -s https://tokyokorean.net/posts/tokyo-life-cost-of-living/ | grep -c 'giscus-container' || true

pnpm run build
```

**기대 (작업 전)**

| 항목 | 상태 |
|------|------|
| `PostDetails.astro` | `import GiscusComments` + `<GiscusComments />` **있음** |
| 라이브 포스트 | `#giscus-comments` · `#giscus-container` **있음** |
| 브라우저 | giscus iframe 로드 후 에러 메시지 표시 |

---

## STEP 1 — PostDetails에서 언마운트 (필수)

### 수정 파일

`src/layouts/PostDetails.astro` — **2곳만** 변경.

### 1-A. import 제거

**Before (약 22행)**

```ts
import GiscusComments from "@/components/GiscusComments.astro";
```

**After**

```ts
// (해당 import 줄 삭제)
```

### 1-B. 컴포넌트 마운트 제거

**Before (약 353~356행)**

```astro
    <RelatedPosts currentPost={post} allPosts={posts} lang={navLang} />

    <GiscusComments lang={navLang} />

    <hr class="my-6 border-border border-solid" />
```

**After**

```astro
    <RelatedPosts currentPost={post} allPosts={posts} lang={navLang} />

    <hr class="my-6 border-border border-solid" />
```

> **주의:** `<hr>` 및 이전/다음 글 네비게이션은 **유지**. Related Posts 바로 아래 구분선으로 이어지면 됨.

---

## STEP 2 — 컴포넌트 파일 유지 (필수 · 삭제 금지)

| 파일 | 조치 |
|------|------|
| `src/components/GiscusComments.astro` | **그대로 유지** (AdSense 승인 후 재사용) |
| `src/i18n/ui.ts`의 `commentsTitle` | **유지** (재마운트 시 사용) |

`_archived/`로 옮기지 말 것 — ID만 채우면 바로 재활성화 가능.

---

## STEP 3 — 빌드 · 배포 · 검증

```bash
pnpm run build
# → 50 page(s) built — Complete!

# 로컬 산출물 (선택)
rg "GiscusComments|giscus-comments" dist/ || echo "OK: no giscus in build output"
```

### 라이브 검증 (배포 후)

```bash
URL=https://tokyokorean.net/posts/tokyo-life-cost-of-living/

curl -s "$URL" | grep -c 'id="giscus-comments"'    # → 0
curl -s "$URL" | grep -c 'giscus-container'      # → 0
curl -s "$URL" | grep -c 'giscus.app'             # → 0
curl -s "$URL" | grep -c 'Related Posts'          # → 1 이상 (유지 확인)
curl -s "$URL" | grep -c '이전 글\|다음 글\|postPrevious'  # 네비 유지
```

**브라우저 스팟체크 (Joseph 또는 AG)**

- [ ] 포스트 하단: Related Posts → 구분선 → 이전/다음 글 (댓글 섹션 **없음**)
- [ ] 에러 문구 `An error occurred` **없음**

---

## STEP 4 — 커밋 · _handoff

### 커밋 메시지 (예시)

```
fix: unmount Giscus comments until repo is configured

Remove GiscusComments from PostDetails to stop error banner on all posts.
Component file kept for post-AdSense re-enable.
```

### _handoff.md 템플릿

```markdown
## [YYYY-MM-DD HH:MM] AG 배포 완료
- 작업 내용: AdSense 신청 전 Giscus 댓글 언마운트 — 포스트 하단 giscus 에러 제거
- 커밋 해시: ______
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: `GiscusComments.astro` 파일 유지. giscus.app 설정·Discussions 활성화는 신청 후.
```

### 완료 체크리스트

| # | 항목 | AG |
|---|------|-----|
| 1 | `PostDetails.astro` import·마운트 제거 | ☐ |
| 2 | `GiscusComments.astro` **삭제 안 함** | ☐ |
| 3 | `pnpm run build` PASS | ☐ |
| 4 | 라이브 `giscus-comments` 0건 | ☐ |
| 5 | Related Posts · 이전/다음 글 유지 | ☐ |
| 6 | Vercel push + `_handoff.md` | ☐ |

---

## 하지 말 것

| 금지 | 이유 |
|------|------|
| giscus.app / GitHub Discussions 설정 | 범위 밖 · 사진 작업 우선 |
| `GiscusComments.astro` 삭제 | 승인 후 재마운트용 |
| 댓글 대체 UI 추가 (Disqus 등) | 불필요 |
| Privacy·Contact·env 변경 | 별도 TASK 완료됨 (`1c33a25`) |

---

## (참고) AdSense 승인 후 재활성화 순서

Joseph 또는 AG가 **나중에** 진행:

1. GitHub `asiaunion/tokyokorean` → Settings → **Discussions** 활성화
2. https://github.com/apps/giscus 설치
3. https://giscus.app/ 에서 repo·category 설정 → `repoId`·`categoryId` 복사
4. `src/components/GiscusComments.astro` 25~27행 TODO 채우기
5. `PostDetails.astro`에 import + `<GiscusComments lang={navLang} />` 복원

---

## Joseph → AG 시작 메시지 (복사용)

```
TokyoKorean Giscus 언마운트 시작해줘.
지시서: docs/AG_TASK_2026-06-25_giscus-unmount.md

작업:
- src/layouts/PostDetails.astro 에서 GiscusComments import + 마운트 제거
- GiscusComments.astro 파일은 삭제하지 말 것

범위 밖: giscus 설정, Discussions, repoId 입력.
완료 후 pnpm build, push, 라이브 curl 검증, _handoff 기록.
```

---

*선행: AdSense trust polish (`1c33a25`) · 다음 대형: [`AG_TASK_2026-06-24_photos-route-a.md`](./AG_TASK_2026-06-24_photos-route-a.md)*
