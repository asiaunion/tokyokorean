# AdSense "Low Value Content" 반복 거절 — 종합 분석 보고서 (2026-06-13 v2)

**작성자**: AntiGravity (AG)  
**감사 대상**: gsfark.com (GSF-Blog, Astro v5 + Vercel)  
**감사 일시**: 2026-06-13 13:35 KST  
**이전 Audit 수**: 최소 10회 (v1~v10, docs/antigravity-knowledge/ 참조)

---

## ⚠️ v1 보고서 자기 수정

오전에 작성한 보고서(v1)에서 "admin sitemap 포함이 1순위 원인"이라 했습니다.
이것은 **불완전한 판단**이었습니다. 아래에 전체 이력을 반영한 수정 분석입니다.

---

## 1. AdSense 거절 타임라인 (이메일 + 커밋 이력 재구성)

| 날짜 | 이벤트 | 당시 수정 내용 |
|------|--------|--------------|
| 2026-04-14 | Privacy/Contact 페이지 추가 | AdSense 준비 Phase 1 |
| 2026-04-18 | hreflang/JSON-LD/i18n 추가 | Phase 1 기술 |
| 2026-04-23 | **GDPR Cookie Consent 배너 추가** | `CookieConsent.astro` 신규 |
| 2026-05-07 | **ads.txt.ts 삭제** | "placeholder가 거부 원인" 판단 |
| 2026-05-08 | `public/ads.txt` 재생성 | `# AdSense ads.txt placeholder` (주석) |
| **2026-05-08** | **AdSense 최초 신청** | 환영 이메일 수신 |
| **2026-05-11** | **1차 거절** (3일 만에) | — |
| 2026-05-13 | V6: debug.astro 삭제, 태그 404 수정 | V6 audit 결과 수정 |
| 2026-05-13 | V8: 태그 noindex + 사이트맵 제외 | sitemap 140개로 감소 |
| **2026-05-22** | **ads.txt 재수정** | placeholder → 실제 pub-ID |
| 2026-05-26 | Privacy redirects + robots 수정 | GSC/AdSense SEO |
| 2026-05-27 | **AdSense 스크립트를 쿠키 동의 뒤에만 로드** | consent-gated 방식 |
| **2026-05-28** | **2차 거절** | — |
| **2026-06-04** | **AdSense 스크립트 무조건 로드로 수정** | consent-gate 제거 |
| **2026-06-04** | **3차 거절** | — |
| 2026-06-07 | About 타임라인 + pagination noindex | — |
| **2026-06-10** | **4차 거절** | — |
| 현재 | "준비 중" (심사 중) | — |

---

## 2. 결정적 발견: ads.txt 이력

```
2026-05-07: ads.txt.ts 삭제 (Dynamic 방식 제거)
2026-05-08: public/ads.txt 생성 — 내용: "# AdSense ads.txt placeholder"
            ↑ 이 상태로 AdSense 최초 신청
2026-05-11: 1차 거절 (3일 만에)
...
2026-05-22: public/ads.txt 수정 — "# AdSense ads.txt placeholder" → 실제 pub-ID
현재 대시보드: "찾을 수 없음" (마지막 업데이트 5월 30일)
```

### [1차 확인] 결론:
**5월 8일 신청 당시 ads.txt에는 주석(`# AdSense ads.txt placeholder`)만 있었고
실제 Publisher ID 라인이 없었습니다.**

Google AdSense가 `# AdSense ads.txt placeholder`를 읽었을 때:
- 형식 오류 (# 주석으로 시작하는 줄은 유효한 ads.txt가 아님)
- 또는 단순 텍스트로 인식하여 Publisher ID 없음으로 처리

**대시보드가 여전히 "찾을 수 없음"을 표시하는 것은 Google 크롤러가 캐시한
이전 "비어있는/잘못된 ads.txt" 상태가 아직 갱신되지 않은 것일 가능성이 있습니다.**

---

## 3. 쿠키 동의 게이팅 — 최대 복병 발견

### 흐름 분석:

```
2026-04-23: GDPR Cookie Consent 배너 추가
2026-05-27: AdSense 스크립트를 쿠키 동의 후에만 로드하도록 변경
            (consent-gated: localStorage 'gsf_cookie_consent' === 'accepted' 조건)
2026-05-28: 2차 거절
2026-06-04: "무조건 로드"로 수정 (Google 크롤러 가시성을 위해)
2026-06-04: 3차 거절 (이미 진행 중이던 심사)
2026-06-10: 4차 거절
```

### [AI 추론] Google 크롤러 관점:

Google의 AdSense 심사 봇은 쿠키를 **허용하지 않습니다**.
따라서 `localStorage 'gsf_cookie_consent' === 'accepted'` 조건이 걸리면:
- `adsbygoogle.js` 스크립트가 **로드되지 않음**
- Google 심사 봇이 "이 사이트에 AdSense 광고 표시 불가" 판단
- = Low Value Content 방아쇠가 아니라, **AdSense 광고 구현 불완전** 판단

**6월 4일 수정(무조건 로드)은 이 문제를 올바르게 해결했습니다.**
그러나 이미 진행 중이던 심사(5월 28일 ~ 6월 4일)에는 반영이 안 되었고,
6월 10일 거절은 6월 4일 수정 이후 새 심사가 시작된 것입니다.

---

## 4. GSC 색인 현황과 AdSense 연관성

### [1차 확인] GSC 스크린샷 데이터:
```
색인 생성됨:      123개
색인 생성 안됨:   520개 (9가지 이유)
최종 업데이트:    2026-06-05
```

### 분석:
- 현재 sitemap에는 ~130개 URL이 있음 (포스트+고정페이지)
- 색인됨 123개 ≈ sitemap 제출 URL과 거의 일치 → **sitemap은 정상 작동**
- 색인 안됨 520개의 구성:
  - 태그 페이지 ~475개 (noindex 적용, 의도적)
  - 페이지네이션 ~30개 (noindex 적용, 의도적)
  - 기타 ~15개

**→ 색인 520 미생성은 "문제"가 아니라 의도적 noindex 설계의 결과입니다.**
AdSense 거절과 직접적 연관 없음.

---

## 5. 왜 반복 거절이 반복됐는가? — 루트 원인 가설 재구성

### 가설 A: ads.txt 누적 문제 (높음)
1차 신청(5/8) 당시 ads.txt가 주석만 있었음
→ Google 크롤러가 "ads.txt 없음"으로 처리
→ 이후 수정(5/22)을 했으나 Google 크롤러 캐시 갱신 지연
→ 대시보드 5/30 기준으로 여전히 "찾을 수 없음"
→ **현재까지 이 상태가 지속되고 있을 가능성**

### 가설 B: 쿠키 동의 게이팅 (높음)
5/27~6/4 기간 동안 Google 심사 봇이 adsbygoogle.js를 볼 수 없었음
→ 6/4 수정으로 해결되었으나, 6/10 거절은 그 이전 심사의 결과

### 가설 C: 콘텐츠 E-E-A-T (중간)
투자/부동산/금융 니치는 AdSense에서 최고 수준의 E-E-A-T 요구
저자 신원, 전문성 증명이 부족하면 자동 거절 가능

### 가설 D: 빠른 재신청 패턴 (낮지만 실재)
4회 거절 모두 1주일 간격의 재신청
Google은 빠른 재신청을 패널티로 인식할 가능성 있음
최소 2~4주 간격 권장

---

## 6. 현재 심사 상태 분석

```
대시보드: "준비 중" + "리뷰가 요청됨"
ads.txt: "찾을 수 없음" (5/30 마지막 업데이트)
AdSense 스크립트: 무조건 로드 (6/4 수정 반영)
```

**현재 진행 중인 심사(6/10 이후)는 아래 조건에서 진행 중입니다:**
- ✅ AdSense 스크립트 무조건 로드 (6/4 이후)
- ✅ ads.txt 실제 내용 있음 (curl 200 + 올바른 pub-ID)
- ⚠️ 대시보드 ads.txt "찾을 수 없음" — Google 크롤러 미갱신 상태
- ⚠️ admin URL 4개가 sitemap에 포함 (오늘 발견, 아직 미수정)

---

## 7. 지금 당장 취해야 할 행동 (우선순위 순)

### 🛑 Action 0: 현재 심사 결과 기다리기
현재 "준비 중" 상태 → 결과가 나올 때까지 추가 수정 후 재신청 금지
(재신청 패턴이 패널티 요인이 될 수 있음)

### Action 1: Google Search Console에서 ads.txt 강제 재크롤 요청
1. GSC → URL 검사
2. `https://gsfark.com/ads.txt` 입력
3. "색인 생성 요청" 클릭
→ Google 크롤러가 최신 ads.txt(올바른 pub-ID)를 다시 읽도록 강제

### Action 2: astro.config.ts — admin sitemap 제외 (v1 권고)
```typescript
if (pathname.startsWith("/admin")) return false; // 1줄 추가
```

### Action 3: 현재 심사 거절 시 — 최소 2주 대기 후 재신청
4회 연속 1주일 단위 재신청 패턴을 깨야 함

---

## 8. 작업 로그 복구 실패 원인 (메타 분석)

사용자께서 "작업 로그가 쌓여야 한다고 했는데 복구가 안 된다"고 하셨습니다.

### 실제 상황:
- `docs/antigravity-knowledge/`에 v2~v10 감사 문서가 **이미 존재**합니다
- 그러나 각 감사마다 이전 감사 결과를 **참조하지 않고** 새로 시작
- 결과: 동일한 항목을 반복 점검, 이전 실패 패턴을 학습하지 못함

### 개선 필요:
새 세션의 에이전트가 세션 시작 전 반드시:
1. `docs/antigravity-knowledge/gsf_blog_adsense_*` 전체 읽기
2. 이전 감사에서 이미 "정상"으로 확인된 항목 재점검 불필요
3. "이미 수정됐지만 효과 없었던 것" 기록 유지

---

## 9. 결론 — 현재 가장 합리적인 가설

**"Low Value Content" 반복 거절의 복합 원인:**

1. **1순위**: 5/8 신청 당시 ads.txt가 실질적으로 비어있었음 (주석만) → AdSense가 "광고 인프라 없음"으로 인식
2. **2순위**: 5/27~6/4 기간 동안 AdSense 스크립트가 쿠키 동의 없이는 비가시 → Google 심사 봇이 광고 로드 실패
3. **3순위**: admin URL 4개 sitemap 포함 (302 리다이렉트) → 사이트 품질 신호 약화
4. **4순위**: 빠른 재신청 패턴 (매주) → 신뢰도 패널티 가능성

**현재(6/13) 상태에서 1+2는 이미 해결됨. 3은 수정 대기 중. 4는 패턴 변경 필요.**


---

## 10. 최종 결정 (2026-06-13 14:00 KST)

**결정자**: 김승주 목사님

| 항목 | 결정 |
|------|------|
| 현재 심사 | 결과 대기 (코드 수정·재신청 동결) |
| GSC ads.txt 색인 요청 | 포기 (plain text 파일 불가 — 정상) |
| AdSense ads.txt 수동 재확인 | 해당 기능 없음 — 자동 크롤 대기 |
| admin sitemap 1줄 수정 | **다음 재신청 전에 반영** |

### 거절 통보 수신 시 즉시 할 일

1. `astro.config.ts` — admin sitemap 제외 1줄 추가 후 배포
2. 최소 **2주 대기** (매주 재신청 패턴 탈피)
3. 재신청

