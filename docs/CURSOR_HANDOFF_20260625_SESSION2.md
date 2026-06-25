# Cursor 인수인계 — 2026-06-25 세션 2 (포스트 등급·AdSense 최종 판단)

> **다음 세션 시작 시:** 이 문서 + [`CLAUDE_HANDOFF_20260625.md`](./CLAUDE_HANDOFF_20260625.md) + [`WEEKLY_STATUS.md`](../WEEKLY_STATUS.md)

---

## 세션 요약

Claude 글 보강 후 재평가(A 15 / B 5)를 Cursor가 레포 기준으로 교차 검증. **AdSense 7/13~15 신청 GO** — 단, GSC 색인 + `garbage-disposal` 본문 사진 1장이 신청 전 필수.

**마지막 커밋:** `1dfc0d5` (Astro 경고 수정 + 이미지 관련성)  
**미커밋:** B급 5편 + α 텍스트 보강 9편 (`git status` 확인)

---

## 현재 수치 (레포 검증 6/25)

| 지표 | 값 |
|------|-----|
| KO 포스트 | 20편 라이브 |
| ogImage (hero) | **20 / 20** ✅ |
| 본문 이미지 참조 | **38건** (깨진 링크 0) |
| ⭐⭐⭐ 게이트 | **6 / 6** ✅ |
| 본문 이미지 0장 | **2편** — `japan-garbage-disposal-rules`, `tokyo-housing-rental-process` |
| 빌드 | PASS (`1dfc0d5`) |

---

## 포스트 등급 (Claude + Cursor 합의)

### A급 15편
기존 10 + 글 보강으로 승격 5편 (work-culture, language-learning, healthcare, public-transportation, housing-rental 등 — 텍스트·hero 기준).

### B급 5편

| 포스트 | 강점 | 약점 | Cursor 조치 우선순위 |
|--------|------|------|---------------------|
| `tokyo-life-cost-of-living` | 쌀값·마트·할인 에피소드 | 본문 2장 모두 긴자 명품가 | 🟠 권장: 일상 마트/동네 사진 교체 |
| `japan-convenience-store-must-buys` | 로손→패밀리마트 전환 서술 | 상품 실사 없음 (외관만) | 🟡 선택 |
| `tokyo-weekend-getaway-spots` | "저의 경우는" 4섹션 + 본문 4장 | A 대비 문단 짧음 | 🟢 사실상 A- (신청 가능) |
| `tokyo-korean-community-culture` | 신오쿠보·교회 공동체 | 본문 1장 (민단 캡처) | 🟡 선택 |
| `japan-seasons-matsuri-culture` | 우츠노미야 솔직 서술 | 본문 1장 | 🟡 선택 · **hero 교체 완료** (`1dfc0d5`) |

### 별도 필수 (B 목록 밖)
- `japan-garbage-disposal-rules` — hero만, **본문 0장** → 🔴 **신청 전 필수 1장**
- `tokyo-housing-rental-process` — hero만, **본문 0장** → 🟠 권장 1장 (Claude 누락, Cursor 보완)

---

## AdSense 판단

| 항목 | 판단 |
|------|------|
| 지금 신청 가능? | ✅ 예 (GSC 색인 진행 전제) |
| 신청 전 필수 | GSC URL 색인 · `garbage-disposal` 본문 1장 · `healthcare` 사진 (Joseph 예정) |
| 신청 전 권장 | `life-cost-of-living` 긴자→일상 사진 교체 · `housing-rental` 본문 1장 |
| 승인률 추정 | **85~90%** (GSC + garbage 후) |
| pubDatetime 소급 | ❌ 하지 말 것 — GSC 요청 + 라이브 URL로 색인 |

---

## GSC 색인 요청 순서 (확정)

**Day 1:** `/`, `/about/`, `/contact/`, `/privacy-policy/`, `/posts/`, `/topics/`, 대표 6편 (hidden-cafes, convenience-store, nihonbashi-history, why-i-live-here, supermarket, weekend)

**Day 2~3:** 나머지 published 포스트 (이미 색인됨이면 스킵)

`/` · `/topics/` 이미 색인됨 확인 — published 포스트 우선. `hidden-cafes`는 live면 요청 OK, 최우선 아님.

---

## 3단계 액션 리스트

### 신청 전 필수
1. Joseph GSC URL 색인 (~7/10, 하루 10건)
2. `japan-garbage-disposal-rules` 본문 사진 1장
3. `japan-healthcare-hospital-visit` 사진 (Joseph 내일 예정)

### 하면 좋음
4. `tokyo-life-cost-of-living` 사진 교체 (긴자 → 마트/동네)
5. `tokyo-housing-rental-process` 본문 1장
6. 미커밋 텍스트 보강 9편 커밋·배포

### 신청 후
7. convenience 상품 사진, community/matsuri 본문 추가
8. WebP 최적화, B급 문단 미세 보강

---

## 이번 세션 Cursor 작업 완료

- weekend·NEXPECT·matsuri hero·work-culture·buying-property 이미지 (`f397555`, `1dfc0d5`)
- Astro 경고 수정: privacy redirect 중복, blog loader `*.md` only
- Claude 재평가 교차 검증 + `housing-rental` 본문 0장 누락 보완
- SSOT 갱신: `_handoff.md`, `WEEKLY_STATUS.md`, `ADSENSE_AND_GSC_CHECKLIST.md`, 본 문서

---

*세션 종료: 2026-06-25*
