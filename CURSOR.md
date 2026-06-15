# Cursor workspace (안티그래비티 기준 단일 원본)

**정본(canonical) 경로:** `/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog`

| | 경로 |
|---|---|
| **안티그래비티 (정본)** | `/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog` |
| **Cursor (symlink)** | `/Users/gsf/dev/Cursor/gsf-blog` → 정본 |
| **아카이브 (2026-05-19)** | `/Users/gsf/dev/_archive-20260519/gsf-blog-cursor-clone` |
| **Git remote** | `git@github.com:asiaunion/GSF-Blog.git` |

## 동기화

- Cursor에서 작업할 때는 위 **정본 경로**를 워크스페이스로 엽니다.
- `~/dev/Cursor/gsf-blog` 는 정본으로 연결된 symlink입니다. 이전 복제본은 `_archive-20260519`에 있습니다.

## 부가 자료

`docs/antigravity-context/` — 스크래치·브레인에서 가져온 스펙·진단 문서  
`docs/antigravity-knowledge/` — 안티그래비티 knowledge (`gsf_blog_*`) 스냅샷

## AG 이미지 규칙 (자동)

- 전역: `~/.gemini/config/rules/agent_rules.md`
- Knowledge: `gsf_blog_image_option_a`
- 레포: `BLOG_IMAGE_RULES_1PAGE.md`, `BLOG_IMAGE_INTENT_RULES.md`, `.cursor/rules/blog-images-option-a.mdc`
- 요약: `AGENTS.md`

## 로컬 실행

```bash
cp .env.example .env   # 최초 1회
npm install
npm run dev
```
