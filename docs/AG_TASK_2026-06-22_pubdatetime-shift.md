# AG 작업 지시서 — 발행일(pubDatetime) 5일 앞당김

> **Joseph 확정:** 2026-06-22  
> **작업 경로:** `/Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean`  
> **범위:** `pubDatetime`만 변경 (본문·modDatetime·draft·sources 건드리지 않음)

---

## 배경

최초 글 배포일을 **6/23 → 6/18(목)** 으로 앞당김.  
나머지 17편도 **동일 간격 유지**하며 **5일씩 앞당김**.  
AdSense 신청 목표(7/13~20) 전 마지막 예정 글: **7/10(금)**.

---

## 작업 내용

### 변경 규칙

| 항목 | 규칙 |
|------|------|
| 수정 필드 | `pubDatetime` **만** |
| 금지 | `modDatetime`, `draft`, `sources`, 본문, title, description |
| 시간 | 대부분 `12:00:00+09:00` / 마쓰리 글만 `09:00:00+09:00` |
| 보류 2편 | `draft: true` 유지, pubDatetime만 7/16으로 이동 |

### 발행일 표 (SSOT)

| 날짜 | 요일 | slug | pubDatetime |
|------|------|------|-------------|
| 6/18 | 목 | `nihonbashi-why-i-live-here` | `2026-06-18T12:00:00+09:00` |
| 6/19 | 금 | `japan-banking-credit-card` | `2026-06-19T12:00:00+09:00` |
| 6/21 | 일 | `japan-life-8years-honest` | `2026-06-21T12:00:00+09:00` |
| 6/22 | 월 | `tokyo-life-cost-of-living` | `2026-06-22T12:00:00+09:00` |
| 6/23 | 화 | `nihonbashi-history-and-modern-life` | `2026-06-23T12:00:00+09:00` |
| 6/25 | 목 | `tokyo-housing-rental-process` | `2026-06-25T12:00:00+09:00` |
| 6/26 | 금 | `japan-garbage-disposal-rules` | `2026-06-26T12:00:00+09:00` |
| 6/28 | 일 | `tokyo-public-transportation-tips` | `2026-06-28T12:00:00+09:00` |
| 6/29 | 월 | `japan-healthcare-hospital-visit` | `2026-06-29T12:00:00+09:00` |
| 6/30 | 화 | `tokyo-supermarket-guide` | `2026-06-30T12:00:00+09:00` |
| 7/2 | 목 | `japan-married-to-japanese-culture-diff` | `2026-07-02T12:00:00+09:00` |
| 7/3 | 금 | `japan-language-learning-survival-japanese` | `2026-07-03T12:00:00+09:00` |
| 7/5 | 일 | `japan-korea-work-culture-diff` | `2026-07-05T12:00:00+09:00` |
| 7/6 | 월 | `nihonbashi-buying-property-foreigner` | `2026-07-06T12:00:00+09:00` |
| 7/7 | 화 | `nihonbashi-hidden-cafes` | `2026-07-07T12:00:00+09:00` |
| 7/8 | 수 | `tokyo-weekend-getaway-spots` | `2026-07-08T12:00:00+09:00` |
| 7/9 | 목 | `japan-elderly-care-frontline` | `2026-07-09T12:00:00+09:00` |
| 7/10 | 금 09:00 | `japan-seasons-matsuri-culture` | `2026-07-10T09:00:00+09:00` |

### 보류 (draft: true — 변경 없음)

| slug | pubDatetime (임시) |
|------|-------------------|
| `japan-convenience-store-must-buys` | `2026-07-16T12:00:00+09:00` |
| `tokyo-korean-community-culture` | `2026-07-16T12:00:00+09:00` |

---

## 실행 방법

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean

# 전수 확인 (표와 불일치 시 표 기준으로 수정)
grep -H '^pubDatetime:' src/data/blog/ko/*.md | sort

# 빌드
pnpm run build
```

일괄 스크립트가 필요하면 표의 slug↔datetime 매핑으로 `pubDatetime` 한 줄만 치환.

---

## 완료 보고 체크리스트

```
[ ] 18편 pubDatetime 표와 일치 확인
[ ] 보류 2편 draft: true 유지 + pubDatetime 7/16 확인
[ ] modDatetime / 본문 미변경 확인
[ ] pnpm run build 성공
```

---

## 커밋 (Joseph 요청 시만)

```
chore: shift pubDatetime — first post 6/18, stagger -5 days
```

`git commit` / `push` / 배포는 **Joseph 명시 요청 시만**.

---

## AdSense 일정 참고

| 이벤트 | 날짜 |
|--------|------|
| 첫 글 공개 | 6/18 (목) |
| 18편 스케줄 마감 | 7/10 (금) |
| AdSense 신청 목표 | 7/13~20 |
| 보류 2편 | 7/16 (draft, Joseph 확정 후 공개) |

---

*이전 스케줄(6/23 시작) 대비 전편 −5일. `docs/AG_HANDOFF_ADSENSE_EEAT_20260622.md` 발행일 표와 동기화.*
