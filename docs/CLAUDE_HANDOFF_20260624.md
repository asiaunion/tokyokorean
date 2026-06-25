# Claude 인수인계 — TokyoKorean (2026-06-24)

> **⚠️ Superseded:** 최신 SSOT는 [`CLAUDE_HANDOFF_20260625.md`](./CLAUDE_HANDOFF_20260625.md) (2026-06-25).

> **대상:** Claude Ark 세션 §7A · Joseph 후속 대화  
> **작성:** Cursor (Joseph 요청)  
> **저장소:** `/Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean`  
> **라이브:** https://tokyokorean.net · **main** 최근 커밋 `1f23724`

---

## 1. 프로젝트 한 줄

**Plan B:** Non-YMYL 한국어 생활 블로그 `tokyokorean.net`으로 AdSense **계정 활성화** → 이후 GSF-Ark 동일 계정 추가 등록.  
**목표 일정:** AdSense **신청** 2026-07-13~15 (승인 대기가 아님 — 아직 미신청).

---

## 2. 지금 상태 (2026-06-24 EOD)

| 영역 | 상태 |
|------|------|
| 포스트 20편 KO | ✅ 라이브 |
| `[사진 필요]` **텍스트** | ✅ KO 20편 0건 (삭제 완료) |
| **실제 이미지** | ⏳ **0/61** — [`PHOTO_NEEDED_TRACKER.md`](./PHOTO_NEEDED_TRACKER.md) |
| GSC 소유권 | ✅ Joseph 대시보드 진입 |
| GSC sitemap | ✅ `sitemap-index.xml` 제출 — UI **0 URL·가져올 수 없음**은 제출 직후 정상 |
| GSC sitemap Success | ⏳ Joseph **6/25~26** 재확인 (~24 URL 목표) |
| GA4 | ✅ `G-86NS9E5Y20` · **Realtime Joseph 확인 완료** |
| AdSense meta + script | ✅ `ca-pub-4729433282370174` 라이브 |
| ads.txt | ✅ 라이브 |
| CookieConsent | ✅ 배너 **미마운트** · 파일 `_archived/components/` |
| GSC URL 색인 요청 | ⏳ ⭐⭐⭐ 사진 배포 후 ~7/10 |
| AdSense 신청 | ⏳ 7/13~15 |

---

## 3. 이번 주 Cursor·AG·Joseph가 한 일 (타임라인)

### 6/24 오전 — SSOT·사진 분석 정렬
- **혼동 해소:** 「플레이스홀더 텍스트 삭제」≠「실제 이미지 삽입」
- Claude 20편 전수 분석 → `PHOTO_NEEDED_TRACKER.md` **48→61곳**, ⭐⭐⭐/⭐⭐/⭐ 3등급, 루트 A/B/C
- `WEEKLY_STATUS.md` · `ADSENSE_AND_GSC_CHECKLIST.md` GSC 순서 확정:
  - **인증·sitemap = 사진 무관·지금**
  - **URL 색인 요청 = ⭐⭐⭐ 사진 배포 후**

### 6/24 — GSC Phase 1 ✅ (AG + Joseph)
- 지시서: [`AG_TASK_2026-06-24_gsc-ownership-sitemap.md`](./AG_TASK_2026-06-24_gsc-ownership-sitemap.md)
- 소유권: 기존 `google21b29b3e517c0ba5.html`(GSF-Ark 복제)로 동일 Google 계정에서 자동 통과
- sitemap: Joseph `sitemap-index.xml` 제출
- **Cursor 검증 APPROVED** — curl 24 URL, URL 색인 미실시(범위 준수)

### 6/24 — Phase 2A AdSense Prep ✅ (AG)
- 지시서: [`AG_TASK_2026-06-24_phase2-adsense-prep.md`](./AG_TASK_2026-06-24_phase2-adsense-prep.md)
- Vercel Production: `PUBLIC_ADSENSE_PUBLISHER_ID`, `PUBLIC_GA4_MEASUREMENT_ID=G-86NS9E5Y20`
- `CookieConsent.astro` 아카이브, `Layout.astro` noop 제거 — 커밋 **`1f23724`**
- **Cursor 검증 APPROVED** — 라이브 meta·gtag·adsbygoogle·cookie-banner 0건

### 6/24 — Joseph
- GA4 Realtime active user 확인 완료

---

## 4. 확정된 운영 순서 (SSOT — 변경 시 WEEKLY 갱신)

```
✅ 1. GSC 소유권
✅ 2. GSC sitemap 제출
✅ 3. AdSense meta + adsbygoogle (consent 없이)
✅ 4. GA4 + Realtime
⏳ 5. GSC sitemap Success UI (~6/25~26)
⏳ 6. Joseph 루트 A 촬영 → AG Phase 2B (⭐⭐⭐ 6편 27곳)
⏳ 7. GSC URL 색인 ~10건 (~7/10)
⏳ 8. AdSense 신청 (7/13~15)
```

**61곳 전부 사진까지 기다릴 필요 없음** — AdSense·색인 1순위는 ⭐⭐⭐ 6편 + E-E-A-T(홈·About·Contact·Privacy).

---

## 5. 사진 파이프라인 (Claude가 자주 헷갈리는 부분)

| 구분 | 상태 | 문서 |
|------|------|------|
| 본문 `[사진 필요: …]` 문구 | ✅ 삭제됨 | curl 0건 |
| 어디에 어떤 사진 넣을지 | ⏳ 61곳 추적 | `PHOTO_NEEDED_TRACKER.md` |
| ⭐⭐⭐ 6편 (27곳) | ⏳ 미삽입 | 루트 A 니혼바시 도보 |
| AG 사진 TASK | Joseph 원본 **후** 시작 | [`AG_TASK_2026-06-24_photos-route-a.md`](./AG_TASK_2026-06-24_photos-route-a.md) |

**이미지 규칙:** `BLOG_IMAGE_RULES_1PAGE.md` · `BLOG_IMAGE_INTENT_RULES.md` — Downloads 자동 탐색 금지, Joseph 지정 원본만.

---

## 6. 기술 스냅샷

| 항목 | 값 |
|------|-----|
| 도메인 | `https://tokyokorean.net/` |
| 스택 | Astro 5 + Vercel |
| 언어 | 한국어 단일 (config `lang: ko`) |
| sitemap | `https://tokyokorean.net/sitemap-index.xml` → **24 URL** |
| Publisher ID | `ca-pub-4729433282370174` |
| GA4 | `G-86NS9E5Y20` |
| 검증 HTML | `public/google21b29b3e517c0ba5.html` (GSF-Ark와 동일 토큰) |
| Plan B 원칙 | Cookie Consent 배너 **달지 않음** — Phase 2A에서 dead code 정리 완료 |

**curl 스팟 체크:**
```bash
curl -s https://tokyokorean.net/ | grep -E 'google-adsense-account|G-86NS9E5Y20|adsbygoogle'
curl -s https://tokyokorean.net/sitemap-0.xml | grep -c '<loc>'  # → 24
```

---

## 7. SSOT 문서 맵

| 파일 | 용도 |
|------|------|
| [`WEEKLY_STATUS.md`](../WEEKLY_STATUS.md) | 전체 현황·HUB 필드 |
| [`_handoff.md`](../_handoff.md) | AG/Cursor 이벤트 로그 |
| [`PHOTO_NEEDED_TRACKER.md`](./PHOTO_NEEDED_TRACKER.md) | 사진 61곳 |
| [`ADSENSE_AND_GSC_CHECKLIST.md`](./ADSENSE_AND_GSC_CHECKLIST.md) | 단계별 체크·색인 URL 목록 |
| [`AG_TASK_*`](./) | AG 지시서 3종 (GSC ✅ · Phase2A ✅ · photos 대기) |

---

## 8. Claude에게 다음에 할 일

### Joseph 직접 (AG 불필요)
1. **6/25~26** GSC → Sitemaps → `sitemap-index.xml` **Success · ~24** 스크린샷
2. **루트 A** 니혼바시 도보 촬영 (TRACKER ⭐⭐⭐ 우선)
3. **7/13~15** AdSense UI에서 **신청** (승인 심사는 신청 후)

### Joseph 촬영 후 → AG
```
TokyoKorean 사진 TASK (루트 A / ⭐⭐⭐) 시작.
지시서: docs/AG_TASK_2026-06-24_photos-route-a.md
원본: [첨부 / 폴더 경로]
```

### Claude가 하면 안 되는 것
- URL 색인 요청 10건+ (사진 전)
- `[사진 필요]` 플레이스홀더 다시 넣기
- Cookie Consent 배너 **신규 마운트**
- pubDatetime 6월 이전으로 소급
- GSF-Ark YMYL 콘텐츠·거절 패턴 무비판적 이식
- 「AdSense 승인 대기 중」이라고 현황 요약 (아직 **미신청**)

---

## 9. GSF-Ark와 관계

| | GSF-Ark | TokyoKorean |
|---|---------|-------------|
| 성격 | YMYL 부동산 | Non-YMYL 생활 |
| AdSense | 5차 거절·7/초 재신청 예정 | Plan B 계정 활성화 |
| GSC 색인 큐 | 49/49 Joseph 완료 (별도 프로젝트) | URL 색인 미착수 |
| 검증 HTML | 동일 파일명 (계정 공유) | 동일 |

---

## 10. 미커밋 로컬 변경 (2026-06-24 확인)

`WEEKLY_STATUS.md` · `_handoff.md` · `docs/ADSENSE_*` · `docs/PHOTO_*` · `docs/AG_TASK_*` · `docs/CLAUDE_HANDOFF_*` — SSOT 갱신분. Joseph 지시 시 `main` 커밋.

---

## 11. Joseph → Claude 첫 메시지 (복사용)

```
TokyoKorean 인수인계 읽고 이어서 도와줘.

SSOT: projects/TokyoKorean/docs/CLAUDE_HANDOFF_20260624.md
요약: GSC+Phase2A 완료, GA4 Realtime 확인됨, 사진 0/61이 블로커.
다음: (1) GSC sitemap Success 6/25~26 (2) 루트 A 촬영 (3) AG photos-route-a (4) AdSense 신청 7/13~15.

AdSense는 아직 미신청 — 승인 대기 아님.
```

---

*Cursor 검증: GSC Phase 1 APPROVED · Phase 2A APPROVED · 2026-06-24*
