# GSF-Blog 관리자 CMS 설계서 (v3 — 구현 계획 고도화)

> **상태**: ✅ Grill 완료 → 🚀 세션 분리 구현 계획 확정
> **작성일**: 2026-05-30
> **최종 리뷰**: 2026-05-30 (v3: 세션 분리 전략 + 검증 체크포인트 추가)
> **대상**: gsfark.com (GSF-Blog, Astro 5.16.6 + Vercel)

---

## 1. 목표

gsfark.com에 워드프레스 수준의 관리자 페이지를 구축하여:
- 비개발자(아내 포함)도 브라우저에서 블로그 글을 작성·편집·발행할 수 있도록 한다.
- 메모 수준의 짧은 글도 작성 가능하고, AG(Antigravity 에이전트)가 이를 참조해 살을 붙여 발행할 수 있다.
- 추후 아내 블로그(신규 도메인)에도 동일 시스템을 이식한다.

## 2. 대전제

- **애드센스 승인 대기 중** → 승인에 지장을 주면 안 됨 (§10 애드센스 안전 조치 참조)
- **현재 AG 기반 워크플로 유지** — 기존(옵시디언 + NotebookLM + AG) 경로와 CMS 경로가 **공존** (§6 듀얼 워크플로 참조)
- **블로그 정적 페이지에 번들/성능 영향 0** — admin은 `/admin/*` SSR 라우트로 격리

---

## 3. 합의된 기술 결정사항

| # | 항목 | 결정 | 근거 |
|---|------|------|------|
| 1 | **프론트엔드** | React (`@astrojs/react`, `client:only`) | 에디터 생태계 최대, island architecture로 블로그 번들 영향 0 |
| 2 | **인증** | Arctic + Google OAuth 2.0 | Astro 공식 추천, 경량(~15KB), 확장 시 Auth.js 마이그레이션 용이 |
| 3 | **세션 관리** | JWT (HttpOnly, SameSite=Lax) + Turso 블랙리스트 | 평상시 DB 조회 없이 검증, 즉시 로그아웃 지원 |
| 4 | **데이터베이스** | Turso (SQLite, 7개 테이블) | Vercel Edge 호환, Serverless First (Tier 3.4) |
| 5 | **데이터 정본** | Git = Source of Truth, DB = 작업 공간 | Astro Content Collections 변경 없음, 기존 빌드 시스템 유지 |
| 6 | **편집 플로우** | Git import → DB 드래프트 → 편집 → 재발행 | status + git_sha로 충돌 감지 |
| 7 | **에디터** | Milkdown (ProseMirror 기반 WYSIWYG) | 마크다운 원문 보존, 비개발자 친화적 툴바, MIT, 플러그인 시스템 |
| 8 | **AG 연동** | REST API (사람과 동일 인터페이스) | 기존 workflow.ts 레거시 유지, 점진적 마이그레이션 |
| 9 | **이미지 저장소** | Vercel Blob + sharp 변환 파이프라인 | 추상화 레이어로 미래 R2 마이그레이션 대비 |
| 10 | **모듈화** | `src/admin/` 격리, 모노레포는 아내 블로그 시점 | YAGNI 원칙, 설정 집중화(`admin/config.ts`)로 이식 준비 |
| 11 | **빌드 영향** | 블로그 정적 페이지 영향 0 | admin은 SSR 전용, React는 admin에서만 로드 |
| 12 | **보안** | 5계층 보안 (A~E) | §11 보안 아키텍처 참조 |
| 13 | **robots.txt** | 동적 버전으로 통합 + /admin Disallow | 기존 2개 파일 충돌 해결, 애드센스 승인에 유리 |
| 14 | **워크플로** | 기존(AG) + CMS 공존 | Git 정본이므로 두 경로 모두 Git에 합류 |
| 15 | **이미지 업로드** | HEIC/JPEG/PNG → WebP 자동 변환, EXIF 제거 | sharp(기존 의존성) 활용, 신규 패키지 불필요 |

---

## 4. 요구 기능 (전체)

- [ ] 마크다운 WYSIWYG 에디터 (Milkdown, 툴바 + slash command)
- [ ] 라이브 미리보기 (실제 블로그 렌더링 확인)
- [ ] 포스트 목록/검색/필터 (DB 드래프트 + Git 발행 포스트 병합 표시)
- [ ] 번역 관리 (KO 원문에서 EN/JA 번역 트리거, 동기화 상태 확인)
- [ ] AG에게 작업 요청 (메모를 넘기고 '살 붙여줘' 버튼)
- [ ] 이미지 업로드/관리 (드래그&드롭, WebP 자동 변환, EXIF 제거)
- [ ] 프론트매터(태그, 카테고리, OG이미지 등) 편집 UI
- [ ] 자동저장 (Turso에 주기적 저장)
- [ ] GitHub 커밋을 통한 발행 (SHA 충돌 감지 포함)
- [ ] 수정 이력 관리 (revision_history, 이전 버전 복원)
- [ ] 감사 로그 (audit_log, 모든 상태 변경 기록)

---

## 5. 시스템 아키텍처

```
┌──────────────────────────────────────────────────────────────────┐
│  gsfark.com                                                      │
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────────────────────┐  │
│  │  블로그 (정적)     │     │  /admin/* (SSR)                   │  │
│  │  Astro Pages      │     │  React SPA (client:only)          │  │
│  │  prerender=true   │     │  + Astro API Endpoints            │  │
│  │  ─────────────    │     │  prerender=false                   │  │
│  │  번들 영향: 0     │     │  ─────────────────                │  │
│  │                   │     │  Milkdown Editor                   │  │
│  └──────────────────┘     └──────────┬───────────────────────┘  │
│                                      │                           │
│              ┌───────────────────────┼───────────────────┐       │
│              ▼                       ▼                   ▼       │
│     ┌──────────────┐      ┌──────────────┐     ┌──────────────┐ │
│     │ Google OAuth  │      │   Turso DB   │     │  GitHub API  │ │
│     │ (Arctic)      │      │  (7 tables)  │     │ (발행용)      │ │
│     │ ───────       │      │  ─────────   │     │ ─────────    │ │
│     │ 허용: 2명     │      │  작업 공간    │     │ Source of    │ │
│     │ 화이트리스트   │      │  드래프트/메모 │     │ Truth        │ │
│     └──────────────┘      └──────────────┘     └──────────────┘ │
│                                                                  │
│              ┌───────────────────────────────────┐               │
│              ▼                                   ▼               │
│     ┌──────────────┐                   ┌──────────────┐         │
│     │ Vercel Blob   │                   │  AG (REST)   │         │
│     │ (이미지)       │                   │  동일 API    │         │
│     │ ─────────     │                   │  사용        │         │
│     │ WebP 자동변환  │                   └──────────────┘         │
│     └──────────────┘                                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. 듀얼 워크플로 (공존 설계)

두 경로가 **독립적**으로 작동하며, 같은 Git 정본에 합류합니다.

```
경로 A (기존, 동일하게 유지):
  옵시디언 + NotebookLM → AG에게 deploy-blog 스킬 지시
    → AG가 .md 파일을 Git에 직접 커밋
    → Vercel 빌드
    → 끝. (DB를 거치지 않음)

경로 B (신규, CMS 경유):
  브라우저 CMS에서 메모/드래프트 작성
    → Turso DB에 자동저장
    → "살 붙여줘" 버튼 → AG가 REST API로 DB 읽고 수정
    → "발행" 버튼 → GitHub API로 .md 커밋
    → Vercel 빌드
```

### 충돌 방지 메커니즘

| 시나리오 | 위험도 | 대응 |
|----------|--------|------|
| 동시 편집 | 낮음 (2명) | `posts.git_sha`로 발행 시 SHA 비교 → 충돌 경고 |
| CMS 편집 중 AG가 Git 수정 | 낮음 | 발행 시 SHA 불일치 → 덮어쓰기/취소 선택 |
| 포스트 목록 불일치 | — | CMS에서 DB + GitHub 병합 표시 (`[DB 드래프트]` `[Git 발행]` `[DB 편집중]`) |
| 작성 경로 추적 | — | `revision_history.edited_by` ("admin-cms", "ag-deploy-blog", "ag-direct-git") |

---

## 7. Turso DB 스키마 (7개 테이블)

```sql
-- 1. posts: 포스트 메타데이터 (언어 무관)
CREATE TABLE posts (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  slug        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('investment','safety','life','local','essay')),
  tags        TEXT NOT NULL DEFAULT '[]',        -- JSON 배열
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('memo','draft','editing','review','published')),
  author      TEXT NOT NULL DEFAULT 'satoru',
  source_slug TEXT,                               -- editing 상태일 때 원본 발행 글의 slug
  git_sha     TEXT,                               -- 마지막 동기화된 Git SHA
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. post_translations: 언어별 콘텐츠
CREATE TABLE post_translations (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  post_id        TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  lang           TEXT NOT NULL CHECK (lang IN ('ko','en','ja')),
  title          TEXT NOT NULL,
  body_md        TEXT NOT NULL DEFAULT '',
  frontmatter    TEXT NOT NULL DEFAULT '{}',      -- JSON (프론트매터 전체)
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(post_id, lang)
);

-- 3. post_memos: 메모 전용 (짧은 글감, 프론트매터 없음)
CREATE TABLE post_memos (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  content        TEXT NOT NULL,
  source_post_id TEXT REFERENCES posts(id),       -- 관련 포스트 (선택)
  ag_prompt      TEXT,                            -- AG에게 전달할 프롬프트
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','expanded','archived')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. revoked_tokens: JWT 블랙리스트 (즉시 로그아웃용)
CREATE TABLE revoked_tokens (
  jti         TEXT PRIMARY KEY,
  revoked_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. media: 업로드된 이미지 추적
CREATE TABLE media (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  post_id      TEXT REFERENCES posts(id) ON DELETE SET NULL,
  filename     TEXT NOT NULL,                     -- UUID 기반 파일명
  original_name TEXT,                             -- 원본 파일명 (참고용)
  storage_url  TEXT NOT NULL,                     -- Vercel Blob URL
  thumbnail_url TEXT,                             -- 썸네일 URL
  mime_type    TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. revision_history: 수정 이력
CREATE TABLE revision_history (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  translation_id  TEXT NOT NULL REFERENCES post_translations(id) ON DELETE CASCADE,
  body_md_snapshot TEXT NOT NULL,                  -- 변경 전 본문 스냅샷
  edited_by       TEXT NOT NULL,                  -- "admin-cms", "ag-deploy-blog", "user@email.com"
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. audit_log: 감사 로그 (90일 보존)
CREATE TABLE audit_log (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_email  TEXT NOT NULL,
  action      TEXT NOT NULL,                      -- "login", "create_post", "publish", "delete" 등
  target      TEXT,                               -- 대상 리소스 (slug, post_id 등)
  ip          TEXT,
  user_agent  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 인덱스

```sql
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_translations_post_id ON post_translations(post_id);
CREATE INDEX idx_memos_status ON post_memos(status);
CREATE INDEX idx_media_post_id ON media(post_id);
CREATE INDEX idx_revision_translation_id ON revision_history(translation_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
CREATE INDEX idx_revoked_tokens_revoked_at ON revoked_tokens(revoked_at);
```

---

## 8. 인증 & 세션 상세 설계

### Google OAuth 흐름 (Arctic)

```
1. 사용자 → /admin/login → "Google로 로그인" 클릭
2. → Arctic이 Google OAuth URL 생성 (state 파라미터 포함)
3. → Google 로그인 페이지로 리다이렉트
4. → 사용자 인증 → /admin/api/auth/callback 으로 리다이렉트
5. → Arctic이 토큰 교환 → 사용자 이메일 확인
6. → 화이트리스트 확인 (ADMIN_EMAILS 환경변수)
7. → 통과: JWT 생성 → HttpOnly 쿠키 설정 → /admin 으로 리다이렉트
   → 실패: 403 + 비인가 로그인 시도 기록
```

### JWT 구조

```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "sub": "user@gmail.com",
    "name": "사용자이름",
    "picture": "Google 프로필 URL",
    "iat": 1717027200,
    "exp": 1717632000,
    "jti": "unique-token-id"
  }
}
```

### 세션 검증 흐름

```
매 요청:
1. HttpOnly 쿠키에서 JWT 추출
2. HMAC-SHA256 서명 검증 (JWT_SECRET)
   → 실패 시 JWT_SECRET_PREVIOUS로 재검증 (키 로테이션 지원)
3. 만료 시간(exp) 확인
4. revoked_tokens 테이블에서 jti 조회
   → 블랙리스트에 있으면 → 401
5. 통과 → 요청 처리
```

### 로그아웃

```
1. revoked_tokens에 현재 JWT의 jti INSERT
2. Set-Cookie로 JWT 쿠키 삭제 (maxAge=0)
3. 즉시 로그아웃 완료
```

### 환경변수

```env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://gsfark.com/admin/api/auth/callback
ADMIN_EMAILS=me@gmail.com,wife@gmail.com
JWT_SECRET=min-256-bit-random-string
JWT_SECRET_PREVIOUS=                        # 키 로테이션 시
JWT_EXPIRY_DAYS=7
```

---

## 9. 이미지 업로드 파이프라인

```
사용자가 이미지 드래그 & 드롭 또는 "사진 선택" 버튼
  │  (JPEG, PNG, HEIC, WebP, GIF — 최대 20MB)
  │
  ▼
브라우저 → POST /api/admin/upload (Serverless Function, 최대 50MB body)
  │
  ▼ 서버 사이드 처리 (sharp):
  ├── 1. Magic number 검증 (파일 헤더 확인)
  ├── 2. EXIF 메타데이터 제거 (.withMetadata(false))
  ├── 3. 방향 자동 보정 (.rotate())
  ├── 4. WebP 변환 (.webp({ quality: 80 }))
  ├── 5. 리사이즈 (최대 폭 1920px, 비율 유지)
  ├── 6. 썸네일 생성 (400px, 목록 표시용)
  └── 7. UUID 파일명 부여
  │
  ▼
Vercel Blob에 업로드 (원본 WebP + 썸네일)
  │
  ▼
media 테이블에 기록 + 에디터에 ![alt](blob-url) 자동 삽입
```

### 저장소 추상화 (`src/admin/lib/storage.ts`)

```typescript
interface StorageProvider {
  upload(file: Buffer, filename: string, mime: string): Promise<string>;
  delete(url: string): Promise<void>;
  list(prefix?: string): Promise<StorageFile[]>;
}

// 현재: VercelBlobProvider
// 미래: CloudflareR2Provider (Cloudflare 이전 시)
```

---

## 10. 애드센스 안전 조치

- **robots.txt 통합**: 동적 `src/pages/robots.txt.ts`에 모든 규칙 통합 + `Disallow: /admin`
  - 기존 `public/robots.txt` 삭제 (충돌 방지)
- 모든 `/admin/*` 라우트에 인증 미들웨어 적용
- 관리자 페이지에 `<meta name="robots" content="noindex, nofollow">` 삽입
- 관리자 페이지에 애드센스 스크립트 로딩 안 함
- admin 관련 JS/CSS는 블로그 정적 페이지 번들에 포함되지 않음

---

## 11. 보안 아키텍처 (5계층)

### A. 인증/세션 보안

| 위협 | 대응 |
|------|------|
| 세션 하이재킹 | `Secure` + `HttpOnly` + `SameSite=Lax` 쿠키 |
| OAuth 리디렉션 탈취 | Arctic `state` 파라미터 검증 + callback URL 고정 |
| JWT 위조/변조 | HMAC-SHA256 서명 + 256비트 시크릿 키 + 키 로테이션 |
| 비인가 로그인 시도 | 화이트리스트 외 5회 초과 → IP 차단 (1시간) + 알림 |

### B. API 보안

| 위협 | 대응 |
|------|------|
| XSS | `HttpOnly` 쿠키 + DOMPurify + CSP `script-src 'self'` |
| CSRF | `SameSite=Lax` + `Origin` 헤더 검증 (POST/PUT/DELETE) |
| SQL Injection | Prepared statement만 사용 (문자열 연결 금지) |
| Path Traversal | Zod 스키마 검증 + `../` 패턴 제거 |
| 입력 조작 | 모든 API 입력을 Zod 스키마로 검증 |

### C. Rate Limiting

| 엔드포인트 | 제한 |
|-----------|------|
| `/api/admin/auth/*` | 10회/분 (로그인 시도) |
| `/api/admin/posts/*` | 60회/분 (일반 CRUD) |
| `/api/admin/posts/*/publish` | 5회/분 (발행) |
| `/api/admin/memos/*/expand` | 10회/분 (AG 호출) |
| `/api/admin/upload` | 20회/분 (이미지 업로드) |

### D. 데이터 보호

| 항목 | 대응 |
|------|------|
| GitHub API 토큰 | Fine-grained token (해당 repo contents 권한만), 환경변수 저장 |
| Turso DB URL/토큰 | Vercel 환경변수에만 저장, 클라이언트 전송 없음 |
| 이미지 업로드 악용 | MIME 화이트리스트 + magic number 검증 + 최대 20MB + UUID 파일명 |
| 개인정보 (EXIF) | sharp로 EXIF 메타데이터 자동 제거 (GPS 위치 등) |

### E. 인프라 보안

HTTP 보안 헤더 (관리자 페이지 전용):
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: https://*.vercel-storage.com
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### F. 감사/모니터링

- `audit_log` 테이블에 모든 상태 변경 기록 (90일 보존)
- 비인가 로그인 시도 5회/시간 → 텔레그램/이메일 알림
- 발행 시도 10회/시간 → 이상 로그 기록

---

## 12. REST API 엔드포인트

```
인증:
  POST   /api/admin/auth/login           → Google OAuth 시작
  GET    /api/admin/auth/callback         → OAuth 콜백
  POST   /api/admin/auth/logout           → 로그아웃 (블랙리스트)

포스트:
  GET    /api/admin/posts                 → 목록 (DB + GitHub 병합)
  POST   /api/admin/posts                 → 신규 생성
  GET    /api/admin/posts/:id             → 상세 조회
  PUT    /api/admin/posts/:id             → 수정 (자동저장 포함)
  DELETE /api/admin/posts/:id             → 삭제
  POST   /api/admin/posts/:id/publish     → 발행 (Git 커밋)
  POST   /api/admin/posts/:id/import      → Git에서 DB로 임포트

번역:
  GET    /api/admin/posts/:id/translations → 언어별 콘텐츠
  PUT    /api/admin/posts/:id/translations/:lang → 번역본 수정

메모:
  GET    /api/admin/memos                 → 메모 목록
  POST   /api/admin/memos                 → 메모 생성
  POST   /api/admin/memos/:id/expand      → AG에게 "살 붙여줘" 요청

이미지:
  POST   /api/admin/upload                → 이미지 업로드 (sharp 파이프라인)
  DELETE /api/admin/media/:id             → 이미지 삭제

이력:
  GET    /api/admin/posts/:id/revisions   → 수정 이력 조회
```

AG는 동일한 API를 사용하며, `X-AG-API-Key` 헤더로 인증합니다.

---

## 13. 디렉토리 구조

```
src/
├── admin/                              ← 관리자 전용 모듈 (격리)
│   ├── components/                     ← React 컴포넌트
│   │   ├── Editor.tsx                  ← Milkdown WYSIWYG 에디터
│   │   ├── PostList.tsx                ← 포스트 목록 (DB + Git 병합)
│   │   ├── FrontmatterEditor.tsx       ← 프론트매터 편집 UI
│   │   ├── ImageUploader.tsx           ← 드래그&드롭 이미지 업로드
│   │   ├── MemoCard.tsx                ← 메모 카드
│   │   ├── TranslationStatus.tsx       ← 번역 동기화 상태
│   │   └── Dashboard.tsx               ← 대시보드
│   ├── lib/                            ← 관리자 비즈니스 로직
│   │   ├── auth.ts                     ← Arctic + JWT + 블랙리스트
│   │   ├── db.ts                       ← Turso 클라이언트
│   │   ├── github.ts                   ← GitHub API (발행, 임포트)
│   │   ├── storage.ts                  ← 이미지 저장소 추상화 (Vercel Blob)
│   │   ├── image-pipeline.ts           ← sharp 변환 파이프라인
│   │   └── security.ts                 ← CSRF, Rate Limit, 입력 검증
│   ├── schemas/                        ← DB 스키마, Zod 타입
│   │   ├── db.sql                      ← Turso 마이그레이션
│   │   └── api-schemas.ts              ← Zod API 입력 스키마
│   └── config.ts                       ← 사이트별 설정 집중 (이식 시 이것만 변경)
│
├── pages/
│   ├── admin/                          ← /admin/* 라우트 (SSR, prerender=false)
│   │   ├── index.astro                 ← 대시보드
│   │   ├── login.astro                 ← 로그인 페이지
│   │   ├── posts/
│   │   │   ├── index.astro             ← 포스트 목록
│   │   │   └── [id].astro              ← 포스트 편집
│   │   ├── memos/
│   │   │   └── index.astro             ← 메모 관리
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login.ts
│   │       │   ├── callback.ts
│   │       │   └── logout.ts
│   │       ├── posts/
│   │       │   ├── index.ts            ← GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       ├── index.ts        ← GET, PUT, DELETE
│   │       │       ├── publish.ts      ← POST (Git 커밋)
│   │       │       ├── import.ts       ← POST (Git → DB)
│   │       │       ├── translations.ts ← 번역 CRUD
│   │       │       └── revisions.ts    ← 이력 조회
│   │       ├── memos/
│   │       │   ├── index.ts
│   │       │   └── [id]/expand.ts      ← AG 살붙이기
│   │       ├── upload.ts               ← 이미지 업로드
│   │       └── media/[id].ts           ← 이미지 삭제
│   └── ...                             ← 기존 블로그 페이지 (변경 없음)
│
├── middleware.ts                        ← /admin/* 인증 미들웨어 추가
└── ...                                 ← 기존 소스 (변경 없음)
```

---

## 14. 페이즈 계획 (고도화)

> 각 페이즈는 **독립적으로 빌드 성공 + 브라우저 검증**이 완료되는 단위로 설계.
> 페이즈 완료 시 `git tag` 스냅샷 권장 (§2.2 승인 앵커).

| 페이즈 | 범위 | 핵심 가치 | 세션 수 (예상) |
|--------|------|-----------|----------------|
| **P1: 기반 인프라** | 패키지 설치 + Turso DB + 인증(Arctic/JWT) + 미들웨어 + robots.txt | "접근할 수 있다 (로그인 가능)" | **3세션** |
| **P2: 포스트 목록 + 기본 에디터** | 포스트 목록 UI (DB+Git 병합) + Milkdown 에디터 기본 + 자동저장 | "글 목록을 보고 에디터를 열 수 있다" | **3세션** |
| **P3: 편집기 완성** | 라이브 미리보기 + 프론트매터 UI + 이미지 업로드(sharp) + revision_history | "워드프레스처럼 편하게 글을 쓸 수 있다" | **3세션** |
| **P4: 발행 파이프라인** | GitHub API 커밋 + 드래프트/발행 상태 관리 + SHA 충돌 감지 + Git import | "버튼 하나로 발행된다" | **2세션** |
| **P5: AI & 번역** | AG REST API 연동 (메모→살붙이기) + 번역 동기화 상태 + workflow.ts 마이그레이션 시작 | "메모만 쓰면 AG가 완성해준다" | **2세션** |

### P1 세부 태스크

#### 세션 1-A: 패키지 설치 + 프로젝트 구조
> **목표**: 빌드가 성공하고 신규 패키지들이 정상 로드됨을 확인

- [ ] Feature Branch 생성: `git checkout -b feat/admin-cms-p1`
- [ ] 의존성 설치: `@astrojs/react`, `react`, `react-dom`, `arctic`, `@libsql/client`, `@vercel/blob`, `zod`, `jose`, `dompurify`
- [ ] `@milkdown/kit` + 필수 플러그인 설치
- [ ] `astro.config.mjs` — `@astrojs/react` 통합 추가, 하이브리드 렌더링 설정
- [ ] `src/admin/` 디렉토리 골격 생성 (빈 파일 + `config.ts`)
- [ ] `src/pages/admin/` 라우트 골격 생성 (`index.astro`, `login.astro`)
- [ ] **✅ 검증**: `npm run build` 에러 0건, 기존 블로그 페이지 정상 렌더링

#### 세션 1-B: Turso DB 설정 + 스키마
> **목표**: DB 연결 확인, 7개 테이블 생성 완료

- [ ] Turso DB 생성 (`turso db create gsf-blog-cms`)
- [ ] 환경변수 설정 (`.env.local`, Vercel 환경변수)
- [ ] `src/admin/schemas/db.sql` — 7개 테이블 + 인덱스 마이그레이션 SQL
- [ ] `src/admin/lib/db.ts` — `@libsql/client` 래퍼 (connection pool, 에러 핸들링)
- [ ] `src/admin/schemas/api-schemas.ts` — Zod 스키마 기본 세트
- [ ] **✅ 검증**: 터미널에서 DB 연결 확인 (`turso db shell` 또는 간단한 query 스크립트 실행), 7개 테이블 존재 확인

#### 세션 1-C: 인증 + 미들웨어 + robots.txt
> **목표**: 로그인 → /admin 접근 가능, /admin은 noindex

- [ ] `src/admin/lib/auth.ts` — Arctic Google OAuth + JWT (jose) + 블랙리스트 로직
- [ ] `src/admin/lib/security.ts` — Rate Limit, CSRF 헬퍼, Origin 헤더 검증
- [ ] API 엔드포인트: `login.ts`, `callback.ts`, `logout.ts`
- [ ] `src/middleware.ts` — `/admin/*` 인증 게이트 추가 (기존 middleware 수정)
- [ ] `src/pages/admin/login.astro` — Google 로그인 버튼 UI
- [ ] `src/pages/robots.txt.ts` — 동적 버전 전환 + `/admin Disallow` (기존 `public/robots.txt` 삭제)
- [ ] **✅ 검증**:
  - `/admin` 직접 접근 → `/admin/login` 리다이렉트 확인
  - Google OAuth 로그인 → JWT 쿠키 설정 확인
  - 화이트리스트 외 이메일 → 403 확인
  - `/robots.txt` 응답에 `Disallow: /admin` 포함 확인
  - `npm run build` 에러 0건

---

### P2 세부 태스크

#### 세션 2-A: 포스트 목록 API + UI
> **목표**: /admin에서 기존 블로그 글 목록을 볼 수 있다

- [ ] `src/admin/lib/github.ts` — GitHub API 래퍼 (파일 목록 조회, raw 콘텐츠 fetch)
- [ ] API: `GET /api/admin/posts` — DB 드래프트 + GitHub Content Collections 병합 로직
- [ ] `src/admin/components/PostList.tsx` — 목록 UI (상태 뱃지: `[DB 드래프트]`, `[Git 발행]`, `[DB 편집중]`)
- [ ] `src/pages/admin/posts/index.astro` — PostList 마운트
- [ ] **✅ 검증**: 실제 블로그 포스트 목록이 admin에서 표시됨, 상태 뱃지 정확성

#### 세션 2-B: Milkdown 에디터 기본 + API CRUD
> **목표**: 에디터를 열어 글을 수정하고 DB에 저장할 수 있다

- [ ] `src/admin/components/Editor.tsx` — Milkdown 기본 셋업 (툴바 + slash command)
- [ ] API: `GET/PUT /api/admin/posts/:id` — 상세 조회 + 수정
- [ ] API: `POST /api/admin/posts` — 신규 생성
- [ ] `src/pages/admin/posts/[id].astro` — 에디터 페이지
- [ ] **✅ 검증**: 에디터에서 내용 수정 → API 호출 성공 → DB 업데이트 확인

#### 세션 2-C: 자동저장 + 수정 이력
> **목표**: 편집 중 자동저장되고, 이전 버전을 볼 수 있다

- [ ] 자동저장 훅 (debounce 2초, `PUT /api/admin/posts/:id`)
- [ ] `revision_history` INSERT 로직 (PUT 시 이전 `body_md` 스냅샷 저장)
- [ ] API: `GET /api/admin/posts/:id/revisions` — 이력 목록
- [ ] `src/admin/components/RevisionPanel.tsx` — 이력 목록 + 복원 버튼
- [ ] **✅ 검증**: 편집 후 2초 대기 → 자동저장 표시 → 이력 목록 확인 → 복원 동작 확인

---

### P3 세부 태스크

#### 세션 3-A: 라이브 미리보기 + 프론트매터 UI
> **목표**: 편집 중 실제 블로그처럼 미리보기가 가능하다

- [ ] `src/admin/components/PreviewPane.tsx` — 마크다운 → HTML 렌더링 (remark-gfm 재사용)
- [ ] 에디터 ↔ 미리보기 분할 레이아웃
- [ ] `src/admin/components/FrontmatterEditor.tsx` — slug, title, tags, category, OG이미지 편집 폼 (Zod 검증)
- [ ] **✅ 검증**: 에디터 타이핑 → 미리보기 실시간 반영 확인, 프론트매터 저장 확인

#### 세션 3-B: 이미지 업로드 파이프라인
> **목표**: 이미지를 드래그&드롭하면 WebP로 변환되어 에디터에 삽입된다

- [ ] `src/admin/lib/image-pipeline.ts` — sharp 변환 파이프라인 (HEIC/JPEG/PNG/WebP → WebP, EXIF 제거, 리사이즈, 썸네일)
- [ ] `src/admin/lib/storage.ts` — StorageProvider 인터페이스 + VercelBlobProvider 구현
- [ ] API: `POST /api/admin/upload` — Magic number 검증 + 변환 + Vercel Blob 업로드 + `media` 테이블 INSERT
- [ ] `src/admin/components/ImageUploader.tsx` — 드래그&드롭 UI + 진행 표시
- [ ] Milkdown에 이미지 업로드 연동 (에디터에 `![alt](blob-url)` 자동 삽입)
- [ ] **✅ 검증**: JPEG 업로드 → WebP 변환 확인 → Vercel Blob URL 에디터 삽입 확인 → `media` 테이블 레코드 확인

#### 세션 3-C: 대시보드 + 메모 관리
> **목표**: 대시보드에서 전체 현황을 보고, 메모를 작성할 수 있다

- [ ] `src/admin/components/Dashboard.tsx` — 통계 카드 (드래프트 수, 발행 수, 메모 수, 최근 활동)
- [ ] `src/admin/components/MemoCard.tsx` — 메모 카드 UI
- [ ] `src/pages/admin/memos/index.astro` + API: `GET/POST /api/admin/memos`
- [ ] `audit_log` INSERT 헬퍼 (login, create_post, publish, delete 이벤트)
- [ ] **✅ 검증**: 대시보드 통계 정확성 확인, 메모 생성/조회 확인

---

### P4 세부 태스크

#### 세션 4-A: 발행 파이프라인 (GitHub 커밋)
> **목표**: "발행" 버튼 클릭 → GitHub에 .md 파일 커밋 → Vercel 빌드 트리거

- [ ] `src/admin/lib/github.ts` — 발행용 GitHub API (파일 생성/수정 커밋, SHA 충돌 감지)
- [ ] API: `POST /api/admin/posts/:id/publish` — SHA 비교 → 충돌 시 경고 → GitHub 커밋
- [ ] API: `POST /api/admin/posts/:id/import` — Git `.md` → DB 임포트 (slug 파싱, frontmatter 파싱)
- [ ] 발행 성공 후 `posts.status = 'published'`, `git_sha` 업데이트
- [ ] `src/admin/components/PublishPanel.tsx` — SHA 충돌 경고 UI + 덮어쓰기/취소 선택
- [ ] **✅ 검증**: 발행 버튼 → GitHub repo에 파일 존재 확인 → Vercel 빌드 트리거 확인 → SHA 충돌 시나리오 테스트

#### 세션 4-B: 번역 관리 + 상태 표시
> **목표**: KO/EN/JA 번역 동기화 상태를 한눈에 보고, 수동 편집이 가능하다

- [ ] API: `GET/PUT /api/admin/posts/:id/translations/:lang`
- [ ] `src/admin/components/TranslationStatus.tsx` — 언어별 동기화 상태 배지 (최신/오래됨/미번역)
- [ ] 번역 드래프트 탭 UI (KO/EN/JA 탭 전환)
- [ ] **✅ 검증**: KO 수정 후 EN/JA가 "오래됨" 상태로 표시됨 확인, 번역본 직접 편집 저장 확인

---

### P5 세부 태스크

#### 세션 5-A: AG REST API 연동 ("살붙이기")
> **목표**: 메모에서 "살붙여줘" 버튼 → AG가 메모를 확장해 드래프트 생성

- [ ] API: `POST /api/admin/memos/:id/expand` — Rate Limit 10회/분 + AG API 호출
- [ ] AG 연동 인터페이스 (`X-AG-API-Key` 헤더 인증)
- [ ] 확장 완료 후 `post_memos.status = 'expanded'`, 신규 `posts` 레코드 생성
- [ ] `src/admin/components/MemoCard.tsx` — "살붙이기" 버튼 + 진행 스피너
- [ ] **✅ 검증**: 메모 작성 → 살붙이기 버튼 → 드래프트 포스트 생성 확인

#### 세션 5-B: 보안 강화 + 모니터링 + 최종 점검
> **목표**: 모든 보안 계층 활성화, 프로덕션 배포 준비 완료

- [ ] Rate Limit 전 엔드포인트 적용 검증 (§11-C 기준)
- [ ] 비인가 로그인 5회 → IP 차단 로직 구현
- [ ] HTTP 보안 헤더 검증 (`astro.config.mjs` 또는 `vercel.json`)
- [ ] `revoked_tokens` 정리 크론 (만료된 JWT jti 주기 삭제)
- [ ] `audit_log` 90일 보존 정리 로직
- [ ] E2E 시나리오 테스트: 로그인 → 신규 포스트 → 편집 → 이미지 업로드 → 발행 → 블로그 확인
- [ ] **✅ 최종 검증**: 전체 플로우 브라우저 검증, `npm run build` 에러 0건, Vercel 프리뷰 배포 확인

---

## 15. 신규 의존성

| 패키지 | 용도 | 크기 영향 |
|--------|------|----------|
| `@astrojs/react` | Astro React 통합 | 빌드 시 |
| `react` + `react-dom` | React 런타임 | admin 전용 (~8MB node_modules) |
| `arctic` | OAuth 라이브러리 | ~15KB |
| `@milkdown/kit` + 플러그인 | 마크다운 에디터 | admin 전용 (~2MB) |
| `@libsql/client` | Turso DB 클라이언트 | 서버 전용 |
| `@vercel/blob` | 이미지 저장소 SDK | 서버 전용 |
| `zod` | API 입력 검증 | ~50KB |
| `dompurify` | XSS 방지 (HTML sanitize) | admin 전용 |
| `jose` | JWT 생성/검증 | ~20KB |

> `sharp`는 이미 프로젝트 의존성에 있으므로 추가 불필요.

---

## 16. 멀티 디바이스 지원

| 시나리오 | 지원 여부 | 비고 |
|----------|----------|------|
| 데스크톱 브라우저 | ✅ | 기본 환경 |
| 노트북 | ✅ | 동일 |
| 모바일 브라우저 | ✅ | 반응형 UI 필수, Google OAuth 모바일 완벽 지원 |
| 같은 기기에서 다른 계정 | ✅ | 시크릿 창/프로필 전환으로 다른 Google 계정 로그인 |
| 여러 기기 동시 로그인 | ✅ | JWT 독립이므로 문제 없음 |

> ⚠️ IP 바인딩은 사용하지 않음 (모바일 IP 변경 빈번)

---

## 17. 미래 확장 계획

| 시점 | 작업 |
|------|------|
| **아내 블로그 시작 시** | `src/admin/` → `packages/admin-core` 추출, pnpm workspace 전환 |
| **Cloudflare 이전 시** | `storage.ts` 구현체를 `CloudflareR2Provider`로 교체 (URL 변경 없이 백엔드 교체) |
| **사용자 증가 시** | Arctic → Auth.js 마이그레이션, users DB 테이블 추가 |
| **고급 편집 필요 시** | Milkdown 플러그인 추가 (코드블록 하이라이팅, 테이블 에디터 등) |

---

## 부록 A: 기존 대비 변경 범위

| 구분 | 기존 파일 | 변경 내용 |
|------|----------|----------|
| **변경** | `src/pages/robots.txt.ts` | 상세 Disallow 규칙 통합 + `/admin` 추가 |
| **변경** | `astro.config.mjs` | `@astrojs/react` 통합 추가 |
| **변경** | `src/middleware.ts` | `/admin/*` 인증 검사 추가 |
| **삭제** | `public/robots.txt` | 동적 버전으로 통합 |
| **신규** | `src/admin/**` | 관리자 모듈 전체 |
| **신규** | `src/pages/admin/**` | 관리자 라우트 + API |
| **유지** | 기존 블로그 페이지 전체 | 변경 없음 |
| **유지** | `src/lib/agent-workflow/**` | 레거시 유지, P4에서 점진적 마이그레이션 |

---

## 부록 B: 구현 세션 분리 전략

> 실제 구현 시 각 세션을 독립 단위로 실행하여 디버깅 비용과 토큰 소모를 최소화한다.

### B-1. 세션 분리 원칙

| 원칙 | 내용 |
|------|------|
| **단일 책임 세션** | 하나의 세션에서 하나의 "검증 가능한 목표"만 달성한다. 목표 달성 전 다른 기능을 추가하지 않는다. |
| **빌드 검증 필수** | 모든 세션은 `npm run build` 통과로 마무리한다. 빌드가 실패하면 다음 세션으로 넘어가지 않는다. |
| **Context 신선도** | 각 세션 시작 시 이 설계서(§14 해당 세션 태스크)와 직전 세션의 검증 결과를 먼저 읽는다. |
| **토큰 경제** | 파일 전체 교체 대신 정확한 라인 타겟팅으로 편집. 세션 당 변경 파일 수를 10개 이내로 제한 (Circuit Breaker §2.3). |
| **롤백 경계** | 세션 완료 후 `git stash` 또는 `git commit -m "chore: session X-Y complete"` → 실패 시 `git stash pop` 또는 `git revert`로 즉시 복구. |

### B-2. 세션 경계 규칙 (언제 세션을 나누나)

다음 중 하나에 해당하면 새 세션을 시작한다:

1. **수정 파일이 10개를 넘을 것으로 예상될 때** (Circuit Breaker)
2. **외부 서비스 연결이 새로 추가될 때** (DB, OAuth, GitHub API, Vercel Blob)
3. **새 UI 컴포넌트 레이어가 시작될 때** (API 완성 → UI 세션 분리)
4. **검증 스텝이 길어질 것으로 예상될 때** (브라우저 수동 검증 포함)
5. **의존성 신규 설치 후** (패키지 설치는 독립 세션으로 분리 권장)

### B-3. 세션 시작 의식 (Ritual)

```
1. 이 설계서 §14 해당 세션 태스크 목록을 읽는다.
2. 직전 세션의 검증 결과 + 현재 브랜치 상태 확인:
   git status && git log --oneline -5
3. 신규 세션 task.md 생성 (해당 세션 태스크 복사):
   예: "세션 1-B: Turso DB 설정 + 스키마"
4. PoC-First 원칙 (§3.8): 새 통합 기능은 최소 테스트부터 확인 후 본 구현 착수.
```

### B-4. 세션 종료 의식 (Ritual)

```
1. ✅ 검증 체크리스트 전 항목 완료 확인
2. npm run build → 에러 0건 확인
3. git commit -m "feat(admin): [세션 ID] [설명]"
   예: "feat(admin): 1-C auth middleware + robots.txt"
4. 브라우저 검증 결과 스크린샷 (선택, §2.2 승인 앵커 해당 시)
5. 다음 세션 태스크 목록을 이 설계서에서 확인 후 종료.
```

### B-5. 예상 세션별 집중 영역 & 위험 요소

| 세션 | 집중 영역 | 주요 위험 요소 | 선제 대응 |
|------|----------|--------------|-----------|
| 1-A | 패키지 호환성 | `@astrojs/react` + Tailwind v4 충돌 가능 | `astro.config.mjs` island 설정 먼저 테스트 |
| 1-B | Turso 연결 | Edge Runtime 호환성 (`@libsql/client` fetch 모드) | `platform: 'node'` vs fetch 모드 확인 |
| 1-C | OAuth 콜백 URL | 로컬 dev와 Vercel Preview URL 불일치 | 환경변수 분기 (`GOOGLE_REDIRECT_URI`) |
| 2-A | GitHub API | Rate Limit + Personal Access Token 스코프 | Fine-grained token (contents:read) |
| 2-B | Milkdown SSR | `client:only` 설정 누락 시 SSR 에러 | 반드시 `client:only="react"` 확인 |
| 2-C | 자동저장 race condition | 연속 타이핑 시 동시 PUT 요청 | debounce + 요청 큐잉 |
| 3-B | Vercel Blob | 업로드 본문 크기 제한 (4.5MB Serverless 기본) | `vercel.json` `maxDuration` + 요청 크기 설정 |
| 4-A | GitHub 커밋 SHA | KO/EN/JA 파일별 SHA를 개별 관리해야 함 | `post_translations`에 `git_sha` 컬럼 추가 고려 |
| 5-A | AG API 타임아웃 | AG 살붙이기 응답 > 10초 가능 | 비동기 polling 방식 (즉시 202 반환 + 상태 폴링) |
