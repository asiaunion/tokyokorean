# CURSOR HANDOFF — 2026-07-06

> 작성: Claude (세션 AO)
> 대상: Claude Code / Cursor
> 우선순위: 높음

---

## 작업 내역 (이번 세션)

### 1. `japan-seasons-matsuri-culture` — hero 이미지 크롭 (완료)

| 항목 | 내용 |
|------|------|
| 파일 | `public/assets/images/blog/japan-seasons-matsuri-culture-hero.jpg` |
| 작업 | 하단 모자이크 처리된 사람 영역 제거 → 상단만 크롭 |
| 원본 크기 | 768 × 962px |
| 크롭 결과 | 768 × 420px |
| 커밋 | Joseph가 터미널에서 직접 실행 후 push (`fix: matsuri hero image` 커밋 2회) |
| 라이브 확인 | ✅ tokyokorean.net/posts/japan-seasons-matsuri-culture/ 정상 표시 확인 (스크린샷) |

---

### 2. `tokyo-weekend-getaway-spots` — 오다와라 성 사진 회전 + 가마보코 삭제 (미완료 ⚠️)

| 항목 | 내용 |
|------|------|
| 파일 A | `public/assets/images/blog/tokyo-weekend-getaway-spots-2.jpg` |
| 문제 | EXIF 회전 미적용 — 원본이 세로(90도 회전) 상태로 저장되어 있음 |
| 시도 이력 | Joseph `rotate(90)` → 180도 뒤집힘 상태로 악화 |
| 현재 상태 | **180도 뒤집힌 상태** (하늘이 아래, 지면이 위) |
| 필요 작업 | `rotate(180, expand=True)` 추가 적용 → 정방향 복구 |
| 파일 B | `public/assets/images/blog/tokyo-weekend-getaway-spots-3.jpg` (가마보코 정식 사진) |
| 필요 작업 | 파일 삭제 + md에서 해당 라인 제거 |

**md 수정 대상 라인 (제거):**
```
![오다와라 가마보코 정식](/assets/images/blog/tokyo-weekend-getaway-spots-3.jpg)
```

**md 파일 경로:**
```
src/data/blog/ko/tokyo-weekend-getaway-spots.md
```

**실행 명령 (한번에):**
```python
from PIL import Image
import os

# 성 사진 180도 추가 회전 (현재 뒤집힌 상태 → 정방향)
p2 = 'public/assets/images/blog/tokyo-weekend-getaway-spots-2.jpg'
img = Image.open(p2)
img.rotate(180, expand=True).save(p2, quality=95)

# 가마보코 이미지 삭제
p3 = 'public/assets/images/blog/tokyo-weekend-getaway-spots-3.jpg'
if os.path.exists(p3):
    os.remove(p3)

# md 수정
md = 'src/data/blog/ko/tokyo-weekend-getaway-spots.md'
with open(md) as f:
    c = f.read()
c = c.replace('\n![오다와라 가마보코 정식](/assets/images/blog/tokyo-weekend-getaway-spots-3.jpg)', '')
with open(md, 'w') as f:
    f.write(c)
```

**커밋 메시지:**
```
fix: odawara castle rotation correct, remove kamaboko image
```

---

## 완료 후 확인 항목

- [ ] `tokyo-weekend-getaway-spots-2.jpg` — 성이 정방향(하늘 위)으로 표시되는지
- [ ] `tokyo-weekend-getaway-spots-3.jpg` — 파일 및 페이지에서 완전 제거됐는지
- [ ] `pnpm run build` exit 0
- [ ] git push → Vercel 배포 확인

---

## 현재 프로젝트 상태

| 항목 | 상태 |
|------|------|
| ogImage | 20/20 ✅ |
| AdSense Publisher ID | 라이브 ✅ |
| AdSense 신청 | ⏳ 7/13~15 예정 |
| GSC 색인 | 요청 완료, 반영 대기 |
| 이미지 잔여 이슈 | **이번 작업 완료 후 0건** |
