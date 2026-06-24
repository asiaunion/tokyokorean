# 사진 삽입 작업 가이드 — Joseph용
> 생성: 2026-06-24  
> 용도: 촬영 사진을 블로그에 반영할 때 Joseph → AG 작업 지시 방법

---

## 1. 사진 저장 위치

```
TokyoKorean/assets/route-a-candidates/   ← 여기에 저장
```

**방법:**
- Google Photos에서 해당 사진 열기 → `Shift+D` 로 다운로드
- 다운로드된 파일을 위 폴더로 이동
- 파일명은 원본 그대로 OK (예: `IMG_4523.JPG`)

> 루트 B(요코하마·가마쿠라 등) 사진도 동일 폴더에 저장하면 됩니다.

---

## 2. AG에게 작업 지시하는 방법

아래 **트리거 텍스트를 복사**해서 AG(Claude Code)에게 붙여넣으면 됩니다.

---

### 트리거 A — 현재 폴더에 있는 사진 전부 반영

```
TokyoKorean 사진 삽입 TASK 시작.
지시서: docs/AG_TASK_PHOTO_INSERT_HOWTO.md
원본 폴더: assets/route-a-candidates/
대상 포스트: [ 전체 / nihonbashi-history-and-modern-life 만 / … ]
```

---

### 트리거 B — 특정 사진을 특정 위치에 지정

```
TokyoKorean 사진 삽입 TASK 시작.
지시서: docs/AG_TASK_PHOTO_INSERT_HOWTO.md

배치 지정:
- nihonbashi-history-and-modern-life: hero=IMG_4455.JPG, 닌교초섹션=ningyocho-yurai-signboard.JPG
- tokyo-supermarket-guide: hero=IMG_4524.JPG, 피코크섹션=IMG_4523.JPG
```

---

### 트리거 C — 사진 추가 후 증분 반영 (나중에 사진 더 찍었을 때)

```
TokyoKorean 사진 삽입 추가 TASK.
지시서: docs/AG_TASK_PHOTO_INSERT_HOWTO.md
새로 추가된 사진: assets/route-a-candidates/ (오늘 추가분)
이미 반영된 포스트는 건드리지 말고, 미완료 위치만 채워줘.
```

---

## 3. AG 작업 순서 (AG가 이 문서를 읽고 따르는 규칙)

> **SSOT:** `BLOG_IMAGE_RULES_1PAGE.md` · `BLOG_IMAGE_INTENT_RULES.md` · `PHOTO_NEEDED_TRACKER.md`

### 3-1. 후보 분류 (매 포스트마다)

`assets/route-a-candidates/` 파일 목록과 `PHOTO_CANDIDATES.md`를 대조해  
각 포스트별 hero 후보 / 본문 후보 / 제외 대상을 표로 Joseph에게 제시.  
**Joseph 확인 후 작업 시작.** (자동 선택 금지)

### 3-2. 에셋 처리

```bash
# 원본 → hero WebP (1200px, q80)
magick assets/route-a-candidates/{원본파일} \
  -resize 1200x \
  -quality 80 \
  public/assets/images/blog/{slug}-hero.webp

# hero → OG용 크롭 (1200×630)
magick public/assets/images/blog/{slug}-hero.webp \
  -gravity center -extent 1200x630 \
  public/assets/images/blog/{slug}-hero-og.jpg

# 본문 이미지 (1200px, q82)
magick assets/route-a-candidates/{원본파일} \
  -resize 1200x \
  -quality 82 \
  public/assets/images/blog/{slug}-1.webp
```

**MD5 검증:**
```bash
md5 public/assets/images/blog/{slug}-hero.webp
md5 public/assets/images/blog/{slug}-1.webp
# → 두 값이 달라야 함
```

### 3-3. MD 갱신 (`src/data/blog/ko/{slug}.md` 만)

**frontmatter에 추가:**
```yaml
ogImage: /assets/images/blog/{slug}-hero.webp
```

**본문 각 섹션 아래에 삽입:**
```markdown
![{간결한 설명}](/assets/images/blog/{slug}-1.webp)
```

**금지:**
- 「표정」「사진 왼쪽」「写真の左側」등 캡션 문구
- `en.md` / `ja.md` 수정 (ko.md 만)
- hero = body 동일 파일

### 3-4. 빌드 검증

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean
pnpm run build
```

exit 0 확인 + ogImage 경로 200 응답 확인.

### 3-5. TRACKER 갱신

`docs/PHOTO_NEEDED_TRACKER.md` 에서 완료 항목 `[x]` 표시 + 요약표 숫자 갱신.

### 3-6. 배포

Joseph이 "커밋·push 해줘" 지시 시에만 실행.  
자동 배포 금지.

---

## 4. 현재 보유 사진 현황

→ [`assets/route-a-candidates/PHOTO_CANDIDATES.md`](../assets/route-a-candidates/PHOTO_CANDIDATES.md) 참조

| 파일 | 용도 |
|------|------|
| `IMG_3103.JPG` | nihonbashi-history 도입부 / why-i-live-here 도입부 |
| `IMG_4455.JPG` | nihonbashi-history 코레도섹션 (hero 후보) |
| `IMG_4460.JPG` | nihonbashi-history 노포+현대 섹션 |
| `IMG_4314.JPG` | nihonbashi-history 야간 산책로 |
| `IMG_4466.JPG` | nihonbashi-history / why-i-live-here 코레도섹션 (세로) |
| `IMG_4465.JPG` | nihonbashi-history / why-i-live-here 코레도섹션 (가로) |
| `IMG_4524.JPG` | tokyo-supermarket-guide 도입부 (피코크 세로) |
| `IMG_4523.JPG` | tokyo-supermarket-guide 피코크섹션 (가로) |
| `20260426_032457580_iOS.jpg` | nihonbashi 강변/기린 등불 ⚠️ 인물 포함 — Joseph 확인 |
| `ningyocho-yurai-signboard.JPG` | nihonbashi-history 닌교초섹션 (안내판) |

---

## 5. 미촬영 (루트 A 잔여)

| 필요 | 포스트 |
|------|--------|
| 도로원표(道路元標) 클로즈업 | nihonbashi-why-i-live-here |
| 닌교초 노포 거리 외관 | nihonbashi-history |
| NEXPECT · Veloce · 코메다 · PRONTO · Tricolore 외관 | nihonbashi-hidden-cafes (5곳) |
| 패밀리마트 야경 + 진열대 (오니기리·디저트·커피) | japan-convenience-store-must-buys (4곳) |
| 와쿠와쿠 · 토모즈 · 로쿠호 외관 | tokyo-supermarket-guide (3곳) |
| 피코크 내부 야채·할인코너 | tokyo-supermarket-guide |

**루트 B (별도 촬영):**  
요코하마 차이나타운/미나토미라이 · 가마쿠라 절·해변 · 오다와라 가마보코 · 가와고에 코에도 거리
