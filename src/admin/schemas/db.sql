-- Admin CMS Turso DB 마이그레이션 스크립트
-- 세션 1-B에서 실제 DB에 실행 예정
-- GSF-Blog Admin CMS v1.0

-- 1. posts: 포스트 메타데이터 (언어 무관)
CREATE TABLE IF NOT EXISTS posts (
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
CREATE TABLE IF NOT EXISTS post_translations (
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
CREATE TABLE IF NOT EXISTS post_memos (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  content        TEXT NOT NULL,
  source_post_id TEXT REFERENCES posts(id),       -- 관련 포스트 (선택)
  ag_prompt      TEXT,                            -- AG에게 전달할 프롬프트
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','expanded','archived')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. revoked_tokens: JWT 블랙리스트 (즉시 로그아웃용)
CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti         TEXT PRIMARY KEY,
  revoked_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. media: 업로드된 이미지 추적
CREATE TABLE IF NOT EXISTS media (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  post_id        TEXT REFERENCES posts(id) ON DELETE SET NULL,
  filename       TEXT NOT NULL,                   -- UUID 기반 파일명
  original_name  TEXT,                            -- 원본 파일명 (참고용)
  storage_url    TEXT NOT NULL,                   -- Vercel Blob URL
  thumbnail_url  TEXT,                            -- 썸네일 URL
  mime_type      TEXT NOT NULL,
  size_bytes     INTEGER NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. revision_history: 수정 이력
CREATE TABLE IF NOT EXISTS revision_history (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  translation_id   TEXT NOT NULL REFERENCES post_translations(id) ON DELETE CASCADE,
  body_md_snapshot TEXT NOT NULL,                 -- 변경 전 본문 스냅샷
  edited_by        TEXT NOT NULL,                 -- "admin-cms", "ag-deploy-blog", "user@email.com"
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. audit_log: 감사 로그 (90일 보존)
CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_email  TEXT NOT NULL,
  action      TEXT NOT NULL,                      -- "login", "create_post", "publish", "delete" 등
  target      TEXT,                               -- 대상 리소스 (slug, post_id 등)
  ip          TEXT,
  user_agent  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_translations_post_id ON post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_memos_status ON post_memos(status);
CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id);
CREATE INDEX IF NOT EXISTS idx_revision_translation_id ON revision_history(translation_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_revoked_at ON revoked_tokens(revoked_at);
