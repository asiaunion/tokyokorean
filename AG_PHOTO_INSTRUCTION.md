# AG 사진 배치 지시문 — IMG_4544~IMG_4573 (30장)

## 작업 개요
`public/assets/images/blog/` 폴더에 추가된 IMG_4544.JPG ~ IMG_4573.JPG (30장)을
블로그 네이밍 컨벤션에 맞게 **파일명 변경(rename)** 하고,
해당 포스트 **마크다운에 이미지 삽입** 및 **ogImage 프론트매터 추가/수정**을 진행한다.

---

## 작업 기준

### 네이밍 규칙
- 히어로 이미지: `{slug}-hero.jpg`
- 본문 이미지: `{slug}-1.jpg`, `{slug}-2.jpg` … (순서대로 번호 부여)
- 기존 `.webp` 히어로가 이미 있는 포스트는 본문 이미지만 추가한다.

### 이미지 삽입 위치
- 히어로 이미지는 **ogImage 프론트매터**에 경로를 기입한다.
- 본문 이미지는 해당 섹션 내 가장 어울리는 위치에 마크다운 이미지 문법으로 삽입한다:
  ```markdown
  ![설명 텍스트](/assets/images/blog/{파일명})
  ```

### 회전 필요 파일
아래 파일은 **가로(landscape) 촬영** 상태이므로 삽입 전 **90도 시계방향 회전** 처리가 필요하다:
- `IMG_4544.JPG` (Mizuho은행, 반시계방향 90도 → 오른쪽으로 세움)
- `IMG_4548.JPG` (닌교초 거리, 시계방향 90도 회전)
- `IMG_4549.JPG` (닌교초 간판, 시계방향 90도 회전)

---

## 파일별 작업 지시

### 1. japan-banking-credit-card

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4545.JPG | `japan-banking-credit-card-hero.jpg` | MUFG 三菱UFJ銀行 정면 외관 | 히어로 |
| IMG_4559.JPG | `japan-banking-credit-card-1.jpg` | MUFG 입구 클로즈업 (화강암 벽) | 본문 |
| IMG_4544.JPG | `japan-banking-credit-card-2.jpg` | Mizuho은행 외관 (**회전 필요**) | 본문 |
| IMG_4567.JPG | `japan-banking-credit-card-3.jpg` | みずほ銀行 닌교초점 외관 (치과 간판 위) | 본문 |
| IMG_4572.JPG | `japan-banking-credit-card-4.jpg` | みずほ銀行 외관 (단독 깔끔) | 본문 |

**ogImage 추가:**
```yaml
ogImage: /assets/images/blog/japan-banking-credit-card-hero.jpg
```

**본문 이미지 삽입 위치:**
- `japan-banking-credit-card-1.jpg` → "MUFG(三菱UFJ銀行)" 섹션 아래
- `japan-banking-credit-card-2.jpg` → "은행별 체감 난이도 / 미즈호은행" 섹션 아래
- `japan-banking-credit-card-3.jpg`, `4.jpg` → "실제로 겪어보니" 섹션 아래 (둘 중 하나 선택)

---

### 2. japan-convenience-store-must-buys

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4546.JPG | `japan-convenience-store-must-buys-hero.jpg` | Lawson 외관 정면 | 히어로 |
| IMG_4547.JPG | `japan-convenience-store-must-buys-1.jpg` | Lawson 외관 (앵글2) | 본문 |
| IMG_4563.JPG | `japan-convenience-store-must-buys-2.jpg` | FamilyMart 水天宮前店 | 본문 |

**ogImage 추가:**
```yaml
ogImage: /assets/images/blog/japan-convenience-store-must-buys-hero.jpg
```

**본문 이미지 삽입 위치:**
- `1.jpg` → Lawson 관련 내용 섹션 아래
- `2.jpg` → FamilyMart 관련 내용 섹션 아래, 또는 "마무리" 전

---

### 3. japan-healthcare-hospital-visit

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4566.JPG | `japan-healthcare-hospital-visit-hero.jpg` | Tomod's 약국 외관 (주간, 깔끔) | 히어로 |
| IMG_4558.JPG | `japan-healthcare-hospital-visit-1.jpg` | 水天宮前역 + Tomod's + 水天宮 신사 전경 | 본문 |
| IMG_4560.JPG | `japan-healthcare-hospital-visit-2.jpg` | Tomod's 약국 내부 입구 | 본문 |

**ogImage 추가:**
```yaml
ogImage: /assets/images/blog/japan-healthcare-hospital-visit-hero.jpg
```

**본문 이미지 삽입 위치:**
- `1.jpg` → "병원과 약국 이용 흐름" 섹션 아래
- `2.jpg` → "한국과 비슷하면서 다른 점" 또는 "마무리" 앞

---

### 4. japan-garbage-disposal-rules

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4573.JPG | `japan-garbage-disposal-rules-hero.jpg` | 주오구 쓰레기 분리수거 안내 포스터 (영문판) | 히어로 |

**ogImage 추가:**
```yaml
ogImage: /assets/images/blog/japan-garbage-disposal-rules-hero.jpg
```

---

### 5. nihonbashi-hidden-cafes

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4550.JPG | `nihonbashi-hidden-cafes-hero.jpg` | 닌교초 빗속 카페 골목 (노란 차양 카페 포함) | 히어로 |
| IMG_4555.JPG | `nihonbashi-hidden-cafes-1.jpg` | 닌교초 방찰정(方妹亭) 식당가 거리 | 본문 |

**ogImage 추가:**
```yaml
ogImage: /assets/images/blog/nihonbashi-hidden-cafes-hero.jpg
```

**본문 이미지 삽입 위치:**
- `1.jpg` → 첫 번째 카페/가게 소개 섹션 아래

---

### 6. nihonbashi-history-and-modern-life
※ 기존 `nihonbashi-history-and-modern-life-hero.webp` 존재 → **히어로 교체 없음**, 본문 이미지만 추가

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4548.JPG | `nihonbashi-history-and-modern-life-1.jpg` | 닌교초 상점가 빗길 (**회전 필요**) | 본문 |
| IMG_4549.JPG | `nihonbashi-history-and-modern-life-2.jpg` | 닌교초 거리 전통 간판 (**회전 필요**) | 본문 |
| IMG_4551.JPG | `nihonbashi-history-and-modern-life-3.jpg` | 닌교초 건물들 (PIZZA 간판, 현대+전통) | 본문 |
| IMG_4552.JPG | `nihonbashi-history-and-modern-life-4.jpg` | 닌교초 전통 한옥풍 건물 + 현대 빌딩 | 본문 |
| IMG_4554.JPG | `nihonbashi-history-and-modern-life-5.jpg` | 双楽 (전통 일본 음식점 간판) | 본문 |
| IMG_4561.JPG | `nihonbashi-history-and-modern-life-6.jpg` | 重盛の人形院 (닌교야키 인형과자 명물점) | 본문 |
| IMG_4564.JPG | `nihonbashi-history-and-modern-life-7.jpg` | 中央人形町二郵便局 외관 | 본문 |

**본문 이미지 삽입 지침:**
- `1.jpg`, `2.jpg` (회전 처리 후) → 닌교초 거리 소개 섹션
- `3.jpg`, `4.jpg` → 전통+현대 공존 관련 섹션
- `5.jpg`, `6.jpg` → 닌교초 명소/맛집 소개 섹션 (双楽, 人形院은 닌교초 3대 명물로 유명)
- `7.jpg` → 생활 인프라 소개 섹션

---

### 7. nihonbashi-why-i-live-here
※ 기존 `nihonbashi-why-i-live-here-hero.webp` 존재 → 본문 이미지만 추가

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4556.JPG | `nihonbashi-why-i-live-here-1.jpg` | 닌교초 마타니티숍+맥도날드 상점가 거리 | 본문 |
| IMG_4557.JPG | `nihonbashi-why-i-live-here-2.jpg` | 水天宮前 교차로 (빗속 넓은 도로, 도시감) | 본문 |
| IMG_4562.JPG | `nihonbashi-why-i-live-here-3.jpg` | 신호등+水天宮 신사 (배경 신사 건물) | 본문 |

**본문 이미지 삽입 위치:**
- `1.jpg`, `2.jpg` → "왜 이 동네인가" 또는 "생활 인프라" 관련 섹션
- `3.jpg` → 동네 분위기/신사 근처 생활감 소개 섹션

---

### 8. japan-life-8years-honest

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4553.JPG | `japan-life-8years-honest-1.jpg` | 닌교초 玉子焼・親子焼 전통 음식점 거리 | 본문 |
| IMG_4565.JPG | `japan-life-8years-honest-2.jpg` | 中央人形町二郵便局 입구 (ゆうちょATM) | 본문 |

**ogImage 추가 (히어로 없으므로 첫 번째 이미지를 ogImage로 지정):**
```yaml
ogImage: /assets/images/blog/japan-life-8years-honest-1.jpg
```

**본문 이미지 삽입 위치:**
- `1.jpg` → "그래도 니혼바시에 계속 있는 이유" 섹션 아래
- `2.jpg` → "생각보다 힘들었던 것들" (행정 절차 관련) 섹션 아래

---

### 9. japan-seasons-matsuri-culture

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4553.JPG | `japan-seasons-matsuri-culture-1.jpg` | 닌교초 전통 음식점 거리 (마쓰리 분위기) | 본문 |

> ※ IMG_4553은 `japan-life-8years-honest-1.jpg`와 **동일 파일**이다.
> 두 포스트 모두에 사용하려면 **복사본을 만들어 각각 다른 파일명으로 저장**한다.

**본문 이미지 삽입 위치:**
- → 닌교초 관련 마쓰리/축제 섹션 아래

---

### 10. tokyo-supermarket-guide
※ 기존 `tokyo-supermarket-guide-hero.webp` 존재 → 본문 이미지만 추가

| 원본 파일 | 새 파일명 | 내용 | 역할 |
|---|---|---|---|
| IMG_4568.JPG | `tokyo-supermarket-guide-1.jpg` | Peacock Store 슈퍼마켓 내부 입구 | 본문 |
| IMG_4569.JPG | `tokyo-supermarket-guide-2.jpg` | わくわく広場 외관 (가까이) | 본문 |
| IMG_4570.JPG | `tokyo-supermarket-guide-3.jpg` | わくわく広場 외관 (전체) | 본문 |

**본문 이미지 삽입 위치:**
- `1.jpg` → Peacock Store 소개 섹션 아래
- `2.jpg` + `3.jpg` → わくわく広場 (지역 생산 식재료 직판장) 소개 섹션 아래

---

## 작업하지 않는 파일

| 파일 | 사유 |
|---|---|
| IMG_4571.JPG | わくわく広場 윈도우 광고 클로즈업 — 블로그 본문용으로 퀄리티 부적합 |

---

## 요약: ogImage 추가 대상 포스트

아래 포스트의 프론트매터에 `ogImage` 필드를 추가한다 (히어로가 새로 생긴 포스트):

```
japan-banking-credit-card.md        → ogImage: /assets/images/blog/japan-banking-credit-card-hero.jpg
japan-convenience-store-must-buys.md → ogImage: /assets/images/blog/japan-convenience-store-must-buys-hero.jpg
japan-healthcare-hospital-visit.md  → ogImage: /assets/images/blog/japan-healthcare-hospital-visit-hero.jpg
japan-garbage-disposal-rules.md     → ogImage: /assets/images/blog/japan-garbage-disposal-rules-hero.jpg
nihonbashi-hidden-cafes.md          → ogImage: /assets/images/blog/nihonbashi-hidden-cafes-hero.jpg
japan-life-8years-honest.md         → ogImage: /assets/images/blog/japan-life-8years-honest-1.jpg
```

---

## 전체 rename 명령어 (bash)

아래 명령을 `public/assets/images/blog/` 디렉터리에서 실행:

```bash
cd /path/to/TokyoKorean/public/assets/images/blog

# 히어로
cp IMG_4545.JPG japan-banking-credit-card-hero.jpg
cp IMG_4546.JPG japan-convenience-store-must-buys-hero.jpg
cp IMG_4566.JPG japan-healthcare-hospital-visit-hero.jpg
cp IMG_4573.JPG japan-garbage-disposal-rules-hero.jpg
cp IMG_4550.JPG nihonbashi-hidden-cafes-hero.jpg

# japan-banking-credit-card 본문
cp IMG_4559.JPG japan-banking-credit-card-1.jpg
cp IMG_4544.JPG japan-banking-credit-card-2.jpg   # 회전 필요
cp IMG_4567.JPG japan-banking-credit-card-3.jpg
cp IMG_4572.JPG japan-banking-credit-card-4.jpg

# japan-convenience-store-must-buys 본문
cp IMG_4547.JPG japan-convenience-store-must-buys-1.jpg
cp IMG_4563.JPG japan-convenience-store-must-buys-2.jpg

# japan-healthcare-hospital-visit 본문
cp IMG_4558.JPG japan-healthcare-hospital-visit-1.jpg
cp IMG_4560.JPG japan-healthcare-hospital-visit-2.jpg

# nihonbashi-hidden-cafes 본문
cp IMG_4555.JPG nihonbashi-hidden-cafes-1.jpg

# nihonbashi-history-and-modern-life 본문
cp IMG_4548.JPG nihonbashi-history-and-modern-life-1.jpg   # 회전 필요
cp IMG_4549.JPG nihonbashi-history-and-modern-life-2.jpg   # 회전 필요
cp IMG_4551.JPG nihonbashi-history-and-modern-life-3.jpg
cp IMG_4552.JPG nihonbashi-history-and-modern-life-4.jpg
cp IMG_4554.JPG nihonbashi-history-and-modern-life-5.jpg
cp IMG_4561.JPG nihonbashi-history-and-modern-life-6.jpg
cp IMG_4564.JPG nihonbashi-history-and-modern-life-7.jpg

# nihonbashi-why-i-live-here 본문
cp IMG_4556.JPG nihonbashi-why-i-live-here-1.jpg
cp IMG_4557.JPG nihonbashi-why-i-live-here-2.jpg
cp IMG_4562.JPG nihonbashi-why-i-live-here-3.jpg

# japan-life-8years-honest 본문
cp IMG_4553.JPG japan-life-8years-honest-1.jpg
cp IMG_4565.JPG japan-life-8years-honest-2.jpg

# japan-seasons-matsuri-culture 본문 (IMG_4553 복사본)
cp IMG_4553.JPG japan-seasons-matsuri-culture-1.jpg

# tokyo-supermarket-guide 본문
cp IMG_4568.JPG tokyo-supermarket-guide-1.jpg
cp IMG_4569.JPG tokyo-supermarket-guide-2.jpg
cp IMG_4570.JPG tokyo-supermarket-guide-3.jpg
```

> **참고:** 원본 IMG_*.JPG 파일은 작업 완료 후 삭제 가능 (또는 보관)

---

## 회전 처리 (macOS sips 명령)

```bash
# IMG_4544: Mizuho은행 (시계 반대 방향으로 촬영됨 → 90도 시계방향 회전)
sips -r 90 japan-banking-credit-card-2.jpg

# IMG_4548: 닌교초 거리 (시계방향 90도 회전)
sips -r 90 nihonbashi-history-and-modern-life-1.jpg

# IMG_4549: 닌교초 간판 (시계방향 90도 회전)
sips -r 90 nihonbashi-history-and-modern-life-2.jpg
```
