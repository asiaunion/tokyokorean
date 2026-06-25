## [2026-06-22 01:23] AG 배포 전 준비 완료
- 작업 내용: AdSense 승인률 향상을 위한 EEAT 보강 (저자 프로필 갱신, GSF 잔재 청산, 사실 기반 5편 공식 출처 2개씩 기재 등)
- 커밋 여부: 방금 커밋 완료
- 특이사항: japan-healthcare-hospital-visit 두 번째 출처를 kyoukaikenpo.or.jp로 수정함 (도메인 분리). 이후 본문 보강 및 애드센스 신청은 Joseph 진행 예정.
## [2026-06-22 01:30] AG pubDatetime 앞당김 (5일) 적용
- 작업 내용: 20편의 pubDatetime을 6/18 시작으로 5일씩 앞당기는 표기 기준에 맞게 일괄 수정.
- 커밋 여부: 미수행 (Joseph 지시 대기)
- 특이사항: modDatetime, draft, sources 등 기타 조건 유지 확인 및 pnpm run build 이상 없음 확인.

## [2026-06-22 01:31] AG 배포 완료
- 작업 내용: pubDatetime 앞당김 (5일) 적용 및 배포
- 커밋 해시: 46e579e
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 예
- 특이사항: Joseph 지시에 따라 커밋 및 push (Vercel 배포) 진행함.

## [2026-06-24] Cursor SSOT 정렬 — 사진·GSC·AdSense 순서
- `[사진 필요]` KO 20편 **0건** 재확인 — 텍스트 플레이스홀더 작업 종료
- `PHOTO_NEEDED_TRACKER.md` — 실제 이미지 **0/61**, ⭐⭐⭐ 6편(27) AdSense·GSC 색인 1순위
- `WEEKLY_STATUS.md` · `ADSENSE_AND_GSC_CHECKLIST.md` — GSC 인증·sitemap=지금 / URL 색인=⭐⭐⭐ 사진 배포 후
- 다음: Joseph GSC 소유권+sitemap · AG Cookie Consent · 루트 A 촬영

## [2026-06-24 10:25] AG — TokyoKorean GSC 소유권 + Sitemap
- 소유권 방법: HTML 파일 (기존 GSF-Ark 인증 파일 활용하여 자동 인증 통과)
- 검증 파일 또는 env: `google21b29b3e517c0ba5.html`
- 라이브 확인: curl PASS
- GSC 소유권: Joseph 확인 완료
- Sitemap 제출: sitemap-index.xml — Joseph 제출 완료
- 발견 URL (GSC): 0 (제출 직후 상태, "가져올 수 없음" / 추후 색인 대기)
- sitemap curl URL 수: 24
- 다음: GA4 등록 (Joseph) · ⭐⭐⭐ 사진 후 URL 색인 (~7/10)
- 스크린샷: GSC 속성 Overview + Sitemaps (Joseph 제공 완료)

## [2026-06-24] Cursor 검증 — GSC Phase 1 APPROVED
- 판정: **APPROVED** (소유권 + sitemap 제출 범위)
- curl: sitemap-index 200 · sitemap-0 **24 URL** · admin/tags 0건 · verification file 200 · E-E-A-T 4페이지 200
- build: `pnpm run build` exit 0
- 범위: URL 색인 요청 **미실시** — SSOT 준수 ✅
- 후속: Joseph GSC Sitemaps **24~48h 후** Success·발견 URL ~24 재확인 · GA4 등록

## [2026-06-24 10:44] AG — TokyoKorean Phase 2A (AdSense Prep)
- 작업 내용: Vercel 환경 변수 세팅 (`PUBLIC_ADSENSE_PUBLISHER_ID`, `PUBLIC_GA4_MEASUREMENT_ID`), CookieConsent dead code 정리
- 커밋 해시: 1f23724
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: Vercel CLI로 변수 주입 후 `main` 브랜치 커밋 푸시를 통해 Vercel 자동 배포 트리거. 라이브 사이트에서 `<meta name="google-adsense-account"...>` 및 `gtag/js?id=G-` 태그 출력 정상 확인.

## [2026-06-24] Cursor 검증 — Phase 2A APPROVED
- 판정: **APPROVED**
- 라이브: `google-adsense-account` ca-pub-4729433282370174 · adsbygoogle.js · GA4 `G-86NS9E5Y20` · cookie-banner 0건
- 코드: `CookieConsent.astro` → `_archived/components/` · Layout noop 제거 (`1f23724`)
- build: exit 0
- 미완: GSC sitemap Success UI 재확인(Joseph 48h) · ~~GA4 Realtime~~ ✅ · ⭐⭐⭐ 사진 · AdSense **신청** 7/13~15

## [2026-06-24] Joseph 확인 — GA4 Realtime
- Measurement ID: `G-86NS9E5Y20`
- tokyokorean.net 방문 → GA4 Realtime active user 확인 완료
- 다음: GSC sitemap Success (~6/25~26) · 루트 A 촬영 → Phase 2B

## [2026-06-24] Cursor → Claude 인수인계
- **Claude 필독:** [`docs/CLAUDE_HANDOFF_20260624.md`](docs/CLAUDE_HANDOFF_20260624.md)
- 요약: GSC Phase 1 ✅ · Phase 2A ✅ · GA4 Realtime ✅ · 사진 0/61 ⏳ · AdSense 신청 7/13~15 ⏳

## [2026-06-24 21:06] AG 배포 완료
- 작업 내용: 사진 크기 일괄 조정 (Hero 이미지 및 세로 사진 축소)
- 커밋 해시: 0b44d80
- 배포 URL: Vercel 자동 배포 대기 (tokyokorean.net)
- Claude 부재 여부: 아니오
- 특이사항: IMG_3103.JPG는 보류됨.


## [2026-06-24 22:14] AG 배포 완료
- 작업 내용: /tags/ 페이지 빈 화면 수정, /topics/ 주제 허브 슬러그 최신화 및 라벨명 개선
- 커밋 해시: ccce7e2
- 배포 URL: Vercel 자동 배포 대기 (tokyokorean.net)
- Claude 부재 여부: 아니오
- 특이사항: 주제 허브 관련 모든 결함 수정 완료 (작업 1, 2, 3 모두 반영).


## [2026-06-24 22:44] AG 배포 완료
- 작업 내용: 아카이브 페이지 진입 시 네비게이션 링크에 /ko/가 잘못 붙어 404 에러가 나는 현상 수정
- 커밋 해시: 0a19ce7
- 배포 URL: Vercel 자동 배포 대기 (tokyokorean.net)
- Claude 부재 여부: 아니오
- 특이사항: Header와 Footer에서 사용하는 다국어(/ko) prefix 생성 로직 완전 제거

## [2026-06-24 22:58] AG 배포 완료
- 작업 내용: 다국어 태그 리다이렉트 단방향화(TAG_SAFETY_NET) 및 Vercel 무한 리다이렉트 루프 원인(vercel.json 1881개 하드코딩 태그) 완전 제거. essay 허브 draft 필터 검증 완료.
- 커밋 해시: 581350b
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: 라이브에서 /tags/니혼바시/, /tags/도쿄/ 200 OK 모두 검증 완료.

## [2026-06-24 23:02] AG 배포 완료
- 작업 내용: 포스트 퍼블리시 날짜 조정 후 `modDatetime`이 `pubDatetime`보다 미래로 남아 "수정됨(Updated)" 라벨이 원치 않게 노출되는 버그 수정 (ko 블로그 16편의 `modDatetime` 일괄 제거)
- 커밋 해시: dbbfc1b
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: 사용자 제보로 즉시 핫픽스 진행.

## [2026-06-24 23:04] AG 배포 완료
- 작업 내용: `vercel.json` 내 GSF-Ark 시절의 구 WP 포스트 리다이렉트(j-reit 등) 일괄 정리
- 커밋 해시: 42e25ab
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: 사용되지 않는 레거시 라우팅 규칙 55줄을 삭제하여 Vercel 라우팅 설정 최적화.

## [2026-06-24 23:23] AG 배포 완료 (AdSense Trust Polish)
- 작업 내용: 
  1. `src/constants.ts` 메일 주소 `asiaunion@gmail.com` 반영
  2. 개인정보 처리방침(`ko`, `en`, `ja`) 내 GA4 지표 반영(ID: G-86NS9E5Y20) 및 날짜 갱신
  3. `src/config.ts` 페이지네이션 8개로 상향
- 커밋 해시: 1c33a25
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: 지시서 범위 외 항목(사진, 색인, CookieConsent, env 등) 미수행 (SSOT 준수)

## [2026-06-24 23:35] AG 배포 완료 (Giscus 언마운트)
- 작업 내용: `src/layouts/PostDetails.astro`에서 `GiscusComments` import 및 렌더링 코드 제거
- 커밋 해시: 8ef0234
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: 지시서에 따라 `GiscusComments.astro` 파일은 삭제하지 않고 유지함.

## [2026-06-25] Cursor → Claude 인수인계
- **Claude 필독:** [`docs/CLAUDE_HANDOFF_20260625.md`](docs/CLAUDE_HANDOFF_20260625.md)
- 요약: 라우팅·허브·태그 ✅ · modDatetime·vercel.json ✅ · trust polish (`1c33a25`) ✅ · Giscus 언마운트 (`8ef0234`) ✅ · 사진 0/61 ⏳ · AdSense 신청 7/13~15 ⏳
- 선행 문서: [`CLAUDE_HANDOFF_20260624.md`](docs/CLAUDE_HANDOFF_20260624.md) — superseded by 2026-06-25

## [2026-06-25 10:55] AG 배포 완료
- 작업 내용: 한국어 블로그 포스트 20편 전체 콘텐츠 보강 (내부 메모 제거, 면책문구 포함, 링크 유효성 통과)
- 커밋 해시: a87afab
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오 (현재 AG가 직접 배포 및 확인)
- 특이사항: Vercel 배포 후 지정된 3개 URL 정상 렌더링 검증 완료.

## [2026-06-25] Cursor — AdSense prep 검증·수정 (미배포)
- Claude 7/20 승인률 재평가 교차검증: **75~85%는 사진 완료 가정 시** — 실제 사진 **10/62** (TRACKER) → **현실적 65~75%**
- 수정: `resolvePostLang` — KO 포스트 면책문구·`<html lang>` 한국어 정상화 (투자/안전 category 4편)
- 수정: KO 20편 `modDatetime` 일괄 제거 (동일 날짜 20건 "수정" 라벨 방지)
- 수정: KO 20편 `lang: ko` frontmatter 추가
- 수정: `CookieConsent` 배너 복원 (AdSense meta는 비차단 유지)
- build: `npm run build` exit 0
- 다음: Joseph 루트 A 촬영 → ⭐⭐⭐ 6편 이미지 · 배포 · GSC 색인 (~7/10)

## [2026-06-25 11:24] AG 배포 완료 (AdSense Prep)
- 작업 내용: KO 면책 한국어 정상화 · modDatetime 20편 제거 · lang:ko · CookieConsent 복원
- 커밋 해시: e88d3d3
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: Cursor 지시서 `docs/AG_TASK_2026-06-25_adsense-prep-deploy.md` 기준 라이브 curl 8항목 PASS.

## [2026-06-25 12:12] AG 배포 완료 (Topic & Category Align)
- 작업 내용: 토픽 허브 4개 정렬, 카테고리 뱃지/색상 매핑 업데이트, 면책문구 slug 기반으로 분리
- 커밋 해시: f2b4141
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: Vercel 자동 배포 트리거됨. admin schema 동기화 오류로 인한 db.sql 핫픽스 및 빌드 성공 확인 후 푸시.

## [2026-06-25 14:31] AG 배포 완료 (사진 배치 및 /ko/posts/ 404 픽스)
- 작업 내용: 블로그 포스트 3편 사진 재배치(双楽 사진 제거, 우체국 사진 이동, 마트 사진 본문 삽입), getPath.ts의 로컬 /ko/posts/ 404 오류 수정
- 커밋 해시: $(git rev-parse --short HEAD)
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: Claude가 사진 배치를 진행한 후, AG가 버그 수정(ko 링크 제거) 및 배포를 완료함.

## [2026-06-25] Cursor — 사진 1차 배치 AdSense 재평가
- 라이브 검증: ogImage **12/20** · 본문 **19건** · 깨진 이미지 **0** · hero jpg HTTP 200 (은행·임대·생활비)
- ⭐⭐⭐ 게이트: **5/6** — `tokyo-weekend-getaway-spots` **이미지 0건** (신청 전 필수)
- AdSense 승인률 추정: **74~82%** (weekend hero 후 **78~85%**)
- SSOT 갱신: `WEEKLY_STATUS.md` · `ADSENSE_AND_GSC_CHECKLIST.md` · `PHOTO_NEEDED_TRACKER.md`
- 다음: (1) weekend hero 1장 (2) Joseph GSC URL 색인 10건 (~7/10) (3) AdSense 신청 7/13~15

## [2026-06-25] Cursor — weekend·NEXPECT 사진 삽입
- `tokyo-weekend-getaway-spots`: hero(가마쿠라 대불) + 본문 4장(에노시마·오다와라성·가마보코·가와고에)
- `nihonbashi-hidden-cafes`: NEXPECT 내부 (`nihonbashi-hidden-cafes-2.jpg`, IMG_2297, **인물 모자이크**)
- ⭐⭐⭐ 게이트 **6/6** 달성 · ogImage **13/20**
- 빌드 PASS · 원본 UUID/IMG 파일 정리

