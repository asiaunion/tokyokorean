# GSF-Blog Admin CMS UX 업그레이드 설계 문서

**작성일:** 2026-05-31  
**대상:** 비개발자 사용자(관리자)  
**범위:** Admin CMS UI/UX 개선 6개 항목  
**기반:** 브레인스토밍 세션 결과

---

## 배경 및 목표

GSF-Blog Admin CMS의 기본 기능이 구축된 상태에서, 비개발자 사용자가 직관적으로 사용할 수 있도록 UX를 개선한다. 워드프로세서를 쓰듯 자연스럽게 글을 쓰고 관리할 수 있는 환경을 목표로 한다.

---

## 결정 사항 (6개 항목)

### 1. 네비게이션 구조 — 헤더 상단 탭

**결정:** 대시보드 본문의 "메모장", "포스트 라이브러리" 버튼을 제거하고, 헤더 하단에 탭 네비게이션을 추가한다.

**탭 구성:**
```
[📊 대시보드] [📝 메모장] [📚 포스트 라이브러리]
```

**구현 방식:**
- `AdminLayout.astro`의 `<header>` 안에 `<nav>` 탭 추가
- 현재 URL을 기반으로 활성 탭 강조 (`border-bottom: 2px solid accent`)
- Astro의 `Astro.url.pathname`으로 활성 탭 판별
- `Dashboard.tsx`의 메모장/포스트 버튼 제거

**파일 영향:**
- `src/layouts/AdminLayout.astro` — 탭 네비 추가
- `src/admin/components/Dashboard.tsx` — 버튼 제거

---

### 2. 글 편집기 툴바 활성화 — Milkdown Crepe 스탠다드 툴바

**결정:** 현재 숨겨진 Milkdown Crepe 툴바를 활성화한다. 에디터 교체 없이 설정 변경만으로 가능.

**툴바 포함 기능:**
- 굵게 (Bold) / 기울임 (Italic) / 밑줄 (Underline)
- 제목 크기 선택 (H1 / H2 / H3 / 본문)
- 순서 없는 목록 / 순서 있는 목록
- 링크 삽입 / 이미지 삽입 / 인용구

**구현 방식:**
- `Editor.tsx`의 `Crepe` 초기화 옵션에서 `features` 설정 수정
- Crepe의 `toolbar` 기능을 활성화 (`toolbar: true` 또는 feature 목록에 추가)
- 기존 CSS 테마 변수와 연동되어 별도 스타일 작업 최소화

**파일 영향:**
- `src/admin/components/Editor.tsx` — Crepe features 설정 수정

---

### 3. 기존 블로그 글 — 편집 클릭 시 자동 가져오기

**결정:** 발행된 글(isGitOnly)의 "⬇️ 가져오기" 버튼을 제거하고, "📝 편집" 클릭 시 자동으로 import API를 호출한 뒤 에디터로 이동한다.

**현재 흐름:**
```
목록 → [⬇️ 가져오기] 클릭 → confirm 팝업 → import API 호출 → 에디터 이동
```

**변경 후 흐름:**
```
목록 → [📝 편집] 클릭 → (로딩 중 표시) → 백그라운드 auto-import → 에디터 이동
```

**구현 방식:**
- `PostList.tsx`의 `isGitOnly` 분기에서 가져오기 버튼을 편집 버튼으로 교체
- 버튼 클릭 핸들러에서 `POST /admin/api/posts/[slug]/import/` 자동 호출
- 호출 중 버튼을 "불러오는 중..." 로딩 상태로 표시
- import 완료 후 `window.location.href = /admin/posts/[id]/` 이동
- confirm 팝업 제거 (사용자 불필요한 마찰 제거)

**파일 영향:**
- `src/admin/components/PostList.tsx` — isGitOnly 분기 처리 변경

---

### 4. 슬러그 자동 변환 + AI 태그 추천

**결정:** 한글 제목에서 영문 슬러그를 자동 생성하고, 본문 저장 시 LLM이 태그를 추천한다.

#### 4-A. 슬러그 자동 변환

**동작:**
- 한글 제목 입력 시 → 로마자 변환(romanization) → kebab-case로 자동 변환
- 예: "도쿄 신주쿠 여행 가이드" → "tokyo-shinjuku-travel-guide"
- "✨ 자동생성" 버튼 클릭 시 현재 제목 기준으로 변환
- 변환 후에도 수동 수정 가능 (override 허용)

**구현 방식:**
- `korean-romanization` 또는 `hangul-romanize` npm 패키지 사용
- 또는 커스텀 romanization 유틸리티 함수 작성 (의존성 최소화)
- `FrontmatterEditor.tsx`에 "자동생성" 버튼 추가
- `Editor.tsx`에서 제목 변경 시 슬러그 미리보기 자동 업데이트

#### 4-B. AI 태그 추천

**동작:**
- 본문 자동 저장(2초 debounce) 이후 트리거
- 현재 본문 markdown을 LLM API에 전달
- LLM이 블로그 글 내용을 분석하여 한국어 태그 5개 이내 추천
- 추천 태그는 `FrontmatterEditor`의 태그 영역 하단에 파란색으로 표시
- 클릭 시 태그로 즉시 추가, 클릭하지 않으면 무시

**LLM 연동:**
- 기존 `.env`의 API 키 활용 (`GEMINI_API_KEY` 또는 `OPENAI_API_KEY`)
- 새 API 엔드포인트: `POST /admin/api/posts/[id]/suggest-tags/`
- 요청 body: `{ body_md: string, title: string, category: string }`
- 응답: `{ tags: string[] }` (5개 이내)
- 태그 추천은 본문이 200자 이상일 때만 작동 (너무 짧은 초안에서 오작동 방지)

**파일 영향:**
- `src/admin/components/FrontmatterEditor.tsx` — 자동생성 버튼, 추천 태그 UI 추가
- `src/admin/components/Editor.tsx` — 태그 추천 트리거 로직 추가
- `src/pages/admin/api/posts/[id]/suggest-tags.ts` — 새 API 엔드포인트 [NEW]

---

### 5. 메모장 편집 & 삭제 + 포스트 삭제

#### 5-A. 메모장 카드 인라인 편집

**결정:** 카드 위에서 바로 수정하는 인라인 편집 방식.

**동작:**
- 각 메모 카드에 "✏️ 편집" / "🗑️ 삭제" 버튼 추가
- 편집 클릭 → 카드가 편집 모드로 전환 (textarea + 저장/취소 버튼)
- 저장 클릭 → `PUT /admin/api/memos/[id]/` 호출 → 카드 업데이트
- 취소 클릭 → 원래 내용 복원
- 삭제 클릭 → 확인 (`confirm("이 메모를 삭제하시겠어요?")`) 후 `DELETE /admin/api/memos/[id]/` 호출 → 목록에서 제거

**파일 영향:**
- `src/admin/components/MemoCard.tsx` — 편집 모드, 삭제 버튼 추가
- `src/admin/components/MemoList.tsx` — 삭제 후 목록 갱신 처리
- `src/pages/admin/api/memos/[id].ts` — PUT/DELETE 엔드포인트 확인 또는 추가 [MODIFY or NEW]

#### 5-B. 포스트 삭제 기능

**동작:**
- `PostList.tsx`의 각 행에 삭제 버튼 추가 (편집 버튼 옆)
- 삭제 클릭 → `confirm("이 글을 삭제하시겠어요? (DB에서만 삭제, Git 원본은 유지)")` 팝업
- 확인 → `DELETE /admin/api/posts/[id]/` 호출 → 목록 갱신
- Git 원본 파일은 건드리지 않음 (안전성 우선)

**파일 영향:**
- `src/admin/components/PostList.tsx` — 삭제 버튼 추가
- `src/pages/admin/api/posts/[id].ts` — DELETE 엔드포인트 확인 또는 추가 [MODIFY or NEW]

---

### 6. 헤더 배경 투명도 문제 수정

**문제:** `AdminLayout.astro` 헤더의 `background: var(--color-card-bg)`가 일부 상황(스크롤, 라이트모드)에서 불충분하게 렌더링되어 메뉴 항목이 가려짐.

**수정 방향:**
- 헤더에 `background-color`를 CSS 변수 대신 semi-transparent solid fallback으로 강화
- `backdrop-filter: blur(16px)` 유지하되 배경 불투명도 보장
- 탭 네비게이션 항목의 텍스트 색상 명시적 지정 (`color: var(--color-foreground)`)
- CustomSelect 드롭다운 메뉴의 배경 solid 처리

**파일 영향:**
- `src/layouts/AdminLayout.astro` — 헤더 스타일 강화

---

## 구현 순서 (권장)

1. **헤더 배경 수정** — 가장 빠르고 가시 효과 큼
2. **탭 네비게이션 추가** — `AdminLayout.astro` 수정
3. **Dashboard.tsx 버튼 제거** — 탭과 연동
4. **PostList.tsx — 자동 가져오기 + 삭제 버튼**
5. **MemoCard/MemoList — 편집/삭제**
6. **Editor.tsx — Crepe 툴바 활성화**
7. **FrontmatterEditor.tsx — 슬러그 자동 변환 버튼**
8. **suggest-tags API + 태그 추천 UI**

---

## 변경 파일 목록

| 파일 | 변경 유형 | 항목 |
|------|-----------|------|
| `src/layouts/AdminLayout.astro` | MODIFY | 탭 네비 추가, 헤더 배경 수정 |
| `src/admin/components/Dashboard.tsx` | MODIFY | 메모/포스트 버튼 제거 |
| `src/admin/components/PostList.tsx` | MODIFY | 자동 가져오기, 삭제 버튼 |
| `src/admin/components/MemoCard.tsx` | MODIFY | 편집/삭제 기능 |
| `src/admin/components/MemoList.tsx` | MODIFY | 삭제 후 목록 갱신 |
| `src/admin/components/Editor.tsx` | MODIFY | Crepe 툴바 활성화, 태그 추천 트리거 |
| `src/admin/components/FrontmatterEditor.tsx` | MODIFY | 슬러그 자동생성 버튼, 추천 태그 UI |
| `src/pages/admin/api/posts/[id]/suggest-tags.ts` | NEW | AI 태그 추천 API |
| `src/pages/admin/api/memos/[id].ts` | MODIFY/NEW | PUT/DELETE 엔드포인트 |
| `src/pages/admin/api/posts/[id].ts` | MODIFY/NEW | DELETE 엔드포인트 |

---

## 기술 제약 사항 및 참고

- **Milkdown Crepe 버전:** 현재 `@milkdown/crepe` 설치됨. 툴바 활성화는 `features` 옵션 확인 필요.
- **Romanization:** `korean-romanization` 패키지 또는 직접 구현 (devDependency 추가 가능)
- **LLM API:** `.env`의 `GEMINI_API_KEY` 우선 사용. Gemini Flash 모델로 비용 최소화.
- **삭제 안전성:** 포스트 삭제는 DB에서만 제거. Git 원본 파일은 보존.
- **인증:** 모든 신규 API는 기존 미들웨어(`src/middleware.ts`) 인증 체계 그대로 사용.

---

## 검증 계획

### 자동화 검증
- `npm run build` — 빌드 에러 0건 확인
- TypeScript 타입 에러 없음

### 수동 검증 (기능별)
1. 탭 클릭 → 페이지 이동 확인, 활성 탭 강조 확인
2. 발행된 글 "편집" → 로딩 → 에디터 오픈 확인
3. 메모 편집 → 카드 인라인 수정 → 저장 확인
4. 메모 삭제 → 목록에서 사라짐 확인
5. 포스트 삭제 → DB에서만 삭제 (Git 파일 보존) 확인
6. 제목 입력 → "자동생성" 클릭 → 슬러그 변환 확인
7. 본문 저장 → AI 태그 추천 표시 확인
8. 에디터 툴바 표시 → 굵기·제목·목록 등 작동 확인
9. 헤더 스크롤 시 배경 선명하게 유지 확인
