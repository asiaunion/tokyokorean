# TokyoKorean AdSense — 8/3 신청 런북

> **잠금 (2026-07-21 Joseph):** `tokyokorean.net`만 · **gsfark.com 재신청 보류** · B-4 미달도 **기본 GO**  
> **상위:** [`WEEKLY_STATUS.md`](../WEEKLY_STATUS.md) · Ark [`ADSENSE_APPROVAL_PLAYBOOK_2026-07.md`](../../GSF-Ark/docs/ADSENSE_APPROVAL_PLAYBOOK_2026-07.md) · OPEN_QUEUE G4

---

## 2026-07-28 Cursor 재검증 (GSC · GA4 · 앞당김)

### GSC 색인 (Joseph 스크린샷 · 최종 업데이트 7/24)

| 항목 | 수치 | 판정 |
|------|------|------|
| 색인 / 추적 | **26 / 29** (~90%) | B-1 ✅ (≥70%) |
| 미색인 | 3 | **전부 무해 · 코드 변경 ❌** |

| 미색인 사유 | URL | 조치 |
|-------------|-----|------|
| 리디렉션 | `/ja/` · `/ko/` | 의도된 308→`/` (단일 로케일). sitemap·내부링크에 없음. GSC 「수정 결과 확인」불필요 |
| robots.txt 차단 | `/tags/` | `robots.txt.ts` 의도적 Disallow (thin listing). 변경 금지 |

라이브 curl (2026-07-28): `/ja/` `/ko/` → **308** `Location: /` · `/tags/` → **200**(HTML) + robots Disallow · adsbygoogle `ca-pub-4729433282370174` 정상.

### GA4 (Joseph · 6/30–7/27 28일)

| 날짜 | naver/blog | naver/organic | google/organic | 메모 |
|------|------------|---------------|----------------|------|
| 2026-07-21 저녁 | ~1 (28d) | ~1 (28d) | — | 핸드오프 기준 · 약함 |
| 2026-07-21 밤 (GA4 6/23–7/20) | **3** 세션 | 1 (첫사용자) | — | Joseph 네이버 붙여넣기 계속 |
| **2026-07-28** (GA4 6/30–7/27) | **5** 세션 | **11** (첫사용자) | **6** | direct 세션 65 · aisearchindex 2 · gsfark referral 1 · **개선 뚜렷** |

### 조기 신청 (8/3 동결 해제) 판정

| 축 | 상태 | 비고 |
|----|------|------|
| 기술 스모크 | **GO** (7/28 재실행) | ads.txt · meta · 핵심4 · 200 |
| B-1 색인 | **GO** | 26/29 · 미색인 3=무해 |
| B-4 레퍼럴 | 개선 · 블로커 아님 | 잠금: 미달도 기본 GO |
| 사이트 신규 포스트 | 동결 유지 OK | 20편 = Phase 1 의도 |

**판정:** 기술·색인 블로커 **0**. **8/3 동결 해제 가능** (Joseph 명시 시).  
**권장 창:** **오늘~8/3 아무 때나** 신청 가능. 네이버 큐가 아직 남았으면 **1~2편 더 붙인 뒤**(7/29~8/1) 제출이 분자 면에서 약간 유리하나, **대기는 필수 아님**.  
**유지 HARD:** `tokyokorean.net`만 · **gsfark.com 신청 금지**.

**조기 신청 체크 (Joseph):** Phase 2 curl을 신청 직전 1회 재확인 → AdSense 사이트 추가 → Cursor에 알려 `hub:log`.

---

## Phase 1 — 7/22~8/1 (Joseph · 분자)

### 네이버 발행 (주 2~4편)

- 초안: `backlink-drafts/{slug}-naver.html` (붙여넣기)
- CTA HARD: `https://tokyokorean.net/posts/{slug}/?utm_source=naver&utm_medium=blog&utm_campaign=tk-broadcast`
- 사이트 **신규 포스트 금지**

**이미 발행(참고, 2026-07-20 기산):**  
`tokyo-weekend-getaway-spots` · `tokyo-supermarket-guide` · `nihonbashi-why-i-live-here`

**다음 추천 큐 (생활 실용 우선):**

| 순 | slug | 파일 |
|----|------|------|
| 1 | `japan-garbage-disposal-rules` | `japan-garbage-disposal-rules-naver.html` |
| 2 | `japan-convenience-store-must-buys` | `japan-convenience-store-must-buys-naver.html` |
| 3 | `japan-healthcare-hospital-visit` | `japan-healthcare-hospital-visit-naver.html` |
| 4 | `nihonbashi-hidden-cafes` | `nihonbashi-hidden-cafes-naver.html` |
| 5 | `japan-seasons-matsuri-culture` | `japan-seasons-matsuri-culture-naver.html` |
| 6 | `tokyo-life-cost-of-living` | `tokyo-life-cost-of-living-naver.html` |

YMYL 인접(`japan-banking-credit-card` · `nihonbashi-buying-property-foreigner`)은 후순위.

### GA4 (주 2회)

속성 `G-86NS9E5Y20` → 트래픽 획득 → `naver/blog` · `naver/organic` 세션 유무를 아래 표에 메모.

| 날짜 | naver/blog | naver/organic | 메모 |
|------|------------|---------------|------|
| 2026-07-21 저녁 | ~1 (28d) | ~1 (28d) | 핸드오프 기준 · 약함 |
| 2026-07-21 밤 (GA4 6/23–7/20) | **3** 세션 | 1 (첫사용자) | Joseph 네이버 붙여넣기 계속 · gsfark.com/referral 1 · direct 92 · **404 조회 40**(활성1) |
| **2026-07-28** (6/30–7/27) | **5** | **11** | google/organic 6 · direct 세션 65 · **개선** (상단 §2026-07-28 표와 동일) |

### GSC

- [x] `nihonbashi-buying-property-foreigner` 라이브 200 (7/28) · 전체 색인 **26/29** (B-1 OK)
- [x] 핵심 `/` `/about/` `/contact/` `/privacy-policy/` 색인 유지 (GSC 26색인에 포함)
- [x] 미색인 3건 무해 확인 (`/ja/` `/ko/` 리다이렉트 · `/tags/` robots) — **수정 불필요**

### GA4 404 (블로커 아님)

- [ ] 「페이지 및 화면 보기」→ 404 → 이전 페이지 경로 스크린샷/메모

### 금지

title·표면 대량 변경 · 사이트 신규 러시 · YMYL 톤 흔들기 · **gsfark AdSense 신청**

---

## Phase 2 — 8/2 스모크 (Cursor)

WAIT = **기술/법적 회귀만**. 레퍼럴 미달 ≠ WAIT.

```bash
# ads.txt
curl -sS https://tokyokorean.net/ads.txt
# meta
curl -sS https://tokyokorean.net/ | rg -i 'google-adsense-account|ca-pub'
# core pages
for u in / /about/ /contact/ /privacy-policy/; do
  echo -n "$u "; curl -sS -o /dev/null -w '%{http_code}\n' "https://tokyokorean.net$u"
done
```

체크:

- [ ] ads.txt 200 · `pub-4729433282370174` (또는 `ca-pub-4729433282370174` 표기 정합)
- [ ] `google-adsense-account` 메타
- [ ] 핵심 4 URL 200
- [ ] Cookie consent가 AdSense 크롤러를 막지 않음 (배너 있어도 meta/ads 스크립트 노출)
- [ ] GSC 색인 ≥70% · 핵심 페이지 색인
- [ ] GA4 레퍼럴 스냅샷 첨부 (충족/미충족 **기록만**)
- [ ] 플레이스홀더·깨진 이미지·신앙 색채 0

**판정 한 줄:** `GO` | `WAIT (사유: …)`

### Baseline (2026-07-21 Cursor — Phase 0 동반 · **GO**)

| 항목 | 결과 |
|------|------|
| ads.txt | **200** · `google.com, pub-4729433282370174, DIRECT, f08c47fec0942fa0` |
| google-adsense-account | **있음** · `ca-pub-4729433282370174` (+ adsbygoogle 스크립트) |
| `/` `/about/` `/contact/` `/privacy-policy/` | **전부 200** |
| robots.txt · sample post | **200** |
| 기술·콘텐츠 | 2026-07-21 저녁 재검증 **PASS** (핸드오프) |
| B-4 레퍼럴 | 미충족(약함) — **GO 잠금에 의해 블로커 아님** |

**판정:** `GO` (기술 회귀 없음). **8/2에 동일 curl 재실행** 후 판정란만 갱신.

### Early smoke (2026-07-28 Cursor — 조기 신청용 · **GO**)

| 항목 | 결과 |
|------|------|
| ads.txt | **200** · `google.com, pub-4729433282370174, DIRECT, f08c47fec0942fa0` |
| google-adsense-account + adsbygoogle | **있음** · `ca-pub-4729433282370174` |
| `/` `/about/` `/contact/` `/privacy-policy/` | **전부 200** |
| GSC | **26/29** · 미색인 3=무해 |
| GA4 | naver/blog 5 · naver/organic 11 · google/organic 6 (28d) |

**판정:** `GO` — Joseph가 동결 해제하면 **즉시 신청 가능** (gsfark 금지 유지).

---

## Phase 3 — 신청 (Joseph) — ✅ 2026-07-28 조기 제출

1. [x] 스모크 `GO` (7/28 Early smoke)
2. [x] AdSense → **tokyokorean.net만** 연결·제출 — 「사이트의 광고 게재 가능 여부 검토 중」
3. [x] **gsfark.com 미제출** 확인
4. [x] Cursor `hub:log` (2026-07-28)
5. [ ] **승인 시** `hub:close` 또는 `hub:log --milestone` 필수
6. [ ] 거절 시 — 사유 캡처 후 Playbook/진단 규칙으로 재평가 (즉시 재제출 ❌)

승인 후(별 세션): ads.txt 재확인 · Giscus 선택 재설정 · Ark는 같은 pub **사이트 추가**(Gate A 면제 아님 · Joseph 보류 해제 후)

---

## hub:log 예시

```bash
cd ~/.gemini/antigravity/scratch/projects/GSF-Hub
npm run hub:log -- --author=Cursor --project=TokyoKorean \
  --line="AdSense 8/3 잠금: TK만 신청 · Ark 보류 · B-4 기본 GO · 런북 ADSENSE_8_3_RUNBOOK"
npm run hub:log -- --author=Cursor --project=GSF-Ark \
  --line="OPEN_QUEUE G4: gsfark 재신청 보류 · TK 8/3 우선 · Gate A 시계 감시만"
```
