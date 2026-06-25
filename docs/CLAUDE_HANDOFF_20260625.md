# Claude 인수인계 — TokyoKorean (2026-06-24~25)

> **Joseph 요청 (2026-06-25):** 오늘 Cursor·AG가 완료한 작업을 반영해 SSOT 문서를 업데이트해 주세요.  
> **선행 문서:** [`CLAUDE_HANDOFF_20260624.md`](./CLAUDE_HANDOFF_20260624.md) — GSC Phase 1 · Phase 2A까지. 본 문서가 **2026-06-25 SSOT**입니다.

---

## 프로젝트 맥락 (변경 없음)

| 항목 | 값 |
|------|-----|
| 사이트 | https://tokyokorean.net — Plan B Non-YMYL 한국어 생활 블로그 |
| 목표 | AdSense **신청** 2026-07-13~15 (**승인 대기 아님** — 아직 미신청) |
| 레포 | `/Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean` |
| SSOT | `WEEKLY_STATUS.md`, `_handoff.md`, `docs/ADSENSE_AND_GSC_CHECKLIST.md`, `docs/PHOTO_NEEDED_TRACKER.md` |

---

## 오늘 완료 작업 (커밋 순)

| 커밋 | 내용 | Cursor 검증 |
|------|------|-------------|
| `ccce7e2` | `/topics/` 허브 슬러그·라벨 수정, tags 빈 화면 수정 | ✅ APPROVED |
| `0a19ce7` | Header/Footer `/ko/` prefix 제거 (아카이브 404 해결) | ✅ APPROVED |
| `581350b` | vercel.json 태그 리다이렉트 ~1881건 제거, 태그 무한루프 해결 | ✅ APPROVED |
| `dbbfc1b` | KO 16편 `modDatetime` 제거 — 원치 않는 "수정:" 라벨 제거 | ✅ APPROVED |
| `42e25ab` | vercel.json GSF-Ark 레거시 포스트 리다이렉트 55줄 삭제 | ✅ APPROVED |
| `1c33a25` | AdSense trust polish — 이메일 통일, Privacy GA4 반영, postPerPage 8 | ✅ APPROVED |
| `8ef0234` | Giscus 언마운트 — 포스트 하단 에러 제거 | ✅ APPROVED |

**이전에 완료·유지:** GSC Phase 1 · Phase 2A `1f23724` (AdSense meta, GA4, CookieConsent 아카이브) · GA4 Realtime Joseph 확인

---

## 기술·UX 현재 상태

| 영역 | 상태 |
|------|------|
| GSC 소유권 + sitemap 제출 | ✅ — Joseph **6/25~26** Sitemaps Success·~24 URL UI 재확인 대기 |
| AdSense meta + adsbygoogle + ads.txt | ✅ `ca-pub-4729433282370174` |
| GA4 | ✅ `G-86NS9E5Y20` 라이브 + Realtime 확인 |
| CookieConsent | ✅ 미마운트 (`_archived/`) |
| 헤더 네비 | ✅ 글목록·태그·주제허브·연락·소개 (이전 "네비 없음" 평가는 **오류**) |
| 태그·허브·메뉴 라우팅 | ✅ 정상 |
| 공개 이메일 | ✅ **`asiaunion@gmail.com` 통일** (`1c33a25`) |
| `tokyokorean78@gmail.com` | Joseph 비상용 — **사이트 비노출** |
| Privacy GA4 정합성 | ✅ §4·§7 ko/en/ja 반영 (`1c33a25`) — 발효일도 6/25로 AG 갱신 (원 지시는 최종업데이트만) |
| Giscus 댓글 | ✅ **언마운트** (`8ef0234`) — `GiscusComments.astro` 보존, 신청 후 재설정 |
| 글목록 페이지네이션 | `postPerPage: 8` (라이브 공개 글 6편이라 현재 1페이지에 6개) |
| 실제 이미지 | ⏳ **0/61** (⭐⭐⭐ 6편 우선) — `nihonbashi-why-i-live-here`, `nihonbashi-history-and-modern-life`에 일부 이미지 있음 |
| AdSense 신청 | ⏳ 7/13~15 |

---

## AdSense 평가 합의 (Cursor = Claude 동의)

- **승인 가능성 높음** — 사진만 들어가면 신청 준비 수준
- **1순위 블로커:** ⭐⭐⭐ 6편 실제 사진 (Joseph Route A 촬영 → AG 삽입)
- **해결 완료:** 이메일 불일치, Privacy↔GA4 불일치, Giscus 에러, modDatetime 라벨, 레거시 라우팅
- **신청 전 불필요:** Giscus 설치, 헤더 네비 추가, postPerPage (이미 8로 상향)

---

## postFilter · 공개 글 수

- **지금 프로덕션 라이브:** 약 **6편** (스케줄 `pubDatetime` + `postFilter` 15h 마진)
- **7/13 신청 시점:** 약 **18편** (draft 2편 제외)
- Essay 허브 1편만 보이는 것: `tokyo-korean-community-culture`가 `draft: true` + `postFilter` 정상 동작

---

## Claude 갱신 체크리스트

1. **`WEEKLY_STATUS.md`**
   - 최종 업데이트일 → 2026-06-25
   - HUB 상태: trust polish + Giscus 언마운트 + 라우팅 정리 반영
   - 완료 항목: 이메일 통일, Privacy GA4, Giscus 제거, modDatetime, vercel.json 정리
   - 이번 주 최우선: **Route A 촬영** → Phase 2B 사진 AG TASK

2. **`docs/ADSENSE_AND_GSC_CHECKLIST.md`**
   - AdSense 신뢰도 항목(이메일·Privacy·Giscus) ✅ 체크
   - Giscus: "신청 전 언마운트 완료, 승인 후 재설정" 메모

3. **`docs/CLAUDE_HANDOFF_20260624.md`**
   - 상단에 **superseded by 2026-06-25** 안내 (본 문서가 최신)

4. **`_handoff.md`**
   - Cursor 인수인계 링크 확인 (본 문서)

5. **AdSense 평가 메모** (별도 보관 시)
   - 헤더 네비 "부재" → **있음**으로 수정
   - 이메일·Privacy·Giscus → **완료**로 상태 변경

---

## 하지 말 것 (SSOT 유지)

| 금지 | 이유 |
|------|------|
| AdSense "승인 대기" 표기 | **신청 예정**만 해당 |
| GSC URL 색인 (⭐⭐⭐ 사진 전) | SSOT 순서 |
| `tokyokorean78@gmail.com` 공개 노출 | `asiaunion@gmail.com`만 |

---

## 다음 액션 (우선순위)

| # | 담당 | 작업 | 시점 |
|---|------|------|------|
| 1 | Joseph | GSC Sitemaps Success 스크린샷 (~24 URL) | 6/25~26 |
| 2 | Joseph | Route A 촬영 (⭐⭐⭐ 6편) | 이번 주 |
| 3 | AG | [`AG_TASK_2026-06-24_photos-route-a.md`](./AG_TASK_2026-06-24_photos-route-a.md) (Joseph 트리거) | 촬영 후 |
| 4 | Joseph | GSC URL 색인 ~10건 | ~7/10 |
| 5 | Joseph | AdSense 신청 | 7/13~15 |
| 6 | AG/Joseph | Giscus 재설정 (Discussions + giscus.app) | **신청 후** |

---

## AG TASK 지시서

| 문서 | 상태 |
|------|------|
| [`AG_TASK_2026-06-25_adsense-trust-polish.md`](./AG_TASK_2026-06-25_adsense-trust-polish.md) | ✅ `1c33a25` |
| [`AG_TASK_2026-06-25_giscus-unmount.md`](./AG_TASK_2026-06-25_giscus-unmount.md) | ✅ `8ef0234` |
| [`AG_TASK_2026-06-24_photos-route-a.md`](./AG_TASK_2026-06-24_photos-route-a.md) | ⏳ Joseph 촬영 대기 |

---

## Joseph 메모

- `tokyokorean78@gmail.com` = 비상용, 공개는 `asiaunion@gmail.com`만
- pubDatetime 5일 앞당김 부작용으로 modDatetime 라벨 이슈 발생 → `dbbfc1b`로 해결

---

*작성: Cursor · 2026-06-25 · 검증 근거: `_handoff.md` + 라이브 curl*
