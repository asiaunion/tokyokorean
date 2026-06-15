# GSF-Blog Design Baseline

> 이 파일은 사용자가 승인한 디자인 스냅샷을 기록합니다.
> 새 세션 에이전트는 이 파일을 **반드시 먼저 읽고** 작업을 시작해야 합니다.

---

## ✅ 승인 스냅샷: LangBanner UX (최종 확정)

- **승인일**: 2026-06-10
- **Git Tag**: `v-approved-20260610-lang-banner-final`
- **Branch**: `ui/lang-switcher-ux`
- **최종 Commit**: `082e806` (fix: LangBanner 닫기 버튼/sessionStorage 제거 — 항상 표시)

---

## 확정된 디자인 사양

### LangBanner 컴포넌트 (`src/components/LangBanner.astro`)
- **위치**: `<a id="skip-to-content">` 다음, `<header>` **바깥** (header flex 충돌 방지)
- **레이아웃**: `w-full border-b border-border bg-background py-1.5`
- **내부 정렬**: `app-layout` 컨테이너 + `justify-end` → GSF "G" 라인 우측 끝에 정렬
- **언어 버튼 레이블**: `🇺🇸 EN` / `🇰🇷 KO` / `🇯🇵 JA` (국기 이모지 + 2자리 코드)
- **현재 언어 강조**: `font-bold text-accent border border-accent`
- **닫기 버튼**: ❌ 없음 (항상 표시 — sessionStorage 방식 폐기)

### Header 네비게이션 (`src/components/Header.astro`)
- **기존 LanguageSwitcher**: 데스크탑 + 모바일 **모두 제거** (LangBanner로 대체)
- **top-nav-wrap 패딩**: `py-0.5 sm:py-1` (슬림 네비 스타일)

### i18n 키 (`src/i18n/ui.ts`) — 3개 언어 블록 동일
| 키 | en | ko | ja |
|----|----|----|-----|
| `langBannerEn` | `🇺🇸 EN` | `🇺🇸 EN` | `🇺🇸 EN` |
| `langBannerKo` | `🇰🇷 KO` | `🇰🇷 KO` | `🇰🇷 KO` |
| `langBannerJa` | `🇯🇵 JA` | `🇯🇵 JA` | `🇯🇵 JA` |

### 파일 구조
| 파일 | 역할 |
|------|------|
| `src/utils/getLangUrl.ts` | 언어 URL 생성 유틸 |
| `src/components/LangBanner.astro` | 언어 선택 배너 (항상 표시) |
| `src/components/Header.astro` | LangBanner 삽입, LanguageSwitcher 제거, 패딩 축소 |
| `src/i18n/ui.ts` | `langBannerEn/Ko/Ja` 키 3개 언어 블록 |

---

## ✅ 승인 스냅샷: Newsletter UX 개선 (2026-06-10)

- **승인일**: 2026-06-10
- **Git Tag**: `v-approved-20260610-newsletter-ux-fix`
- **Commit**: `8025353` (fix(newsletter): replace popup form with inline fetch + success message)

### 변경 내역
| 항목 | 이전 | 이후 |
|------|------|------|
| 구독 폼 방식 | `target="popupwindow"` (팝업) | `fetch()` + 인라인 메시지 |
| 구독 완료 메시지 | 없음 (빈 팝업 창) | ✅ "확인 이메일을 보내드렸습니다!" |
| Buttondown 아카이브 | 빈 화면 | Welcome 이메일 발행 완료 |
| After confirming redirect | 없음 (빈 아카이브) | `gsfark.com/posts/` |

### 관련 파일
| 파일 | 변경 내용 |
|------|---------|
| `src/components/NewsletterForm.astro` | 팝업 제거, fetch 방식, i18n 3개 언어 인라인 메시지 |

---

## 다음 작업 시 주의사항

- LangBanner는 `<header>` **밖**에 있어야 함. header 안으로 이동 시 flex row 레이아웃 깨짐
- `LanguageSwitcher.astro`는 현재 미사용 상태 (삭제 가능하나 보존 중)
- **Newsletter 폼**: 팝업 방식 완전 제거됨. 이전 `target="popupwindow"` 방식으로 되돌리지 말 것
- **Buttondown redirect URL**: API로 변경 불가 — 대시보드에서만 수동 설정 가능 (현재값: `gsfark.com/posts/`)
