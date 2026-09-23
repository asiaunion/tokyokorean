# TokyoKorean AdSense — 8/3 신청 런북

> **잠금 (2026-08-04 Cursor):** 7/28 신청 → **반려(8/4)** · 재신청 ≥**2026-09-15** · 즉시 재제출 ❌ · **gsfark.com 신청 UI 금지** · Ark+TK 동시 ❌  
> **이력 잠금 (2026-07-21 Joseph):** `tokyokorean.net`만 · B-4 미달도 기본 GO로 조기 제출(결과=반려)  
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

## Phase 3 — 신청 (Joseph) — ✅ 2026-07-28 조기 제출 → 🔴 반려 2026-08-04

1. [x] 스모크 `GO` (7/28 Early smoke)
2. [x] AdSense → **tokyokorean.net만** 연결·제출 — 「사이트의 광고 게재 가능 여부 검토 중」
3. [x] **gsfark.com 미제출** 확인
4. [x] Cursor `hub:log` (2026-07-28)
5. [ ] **승인 시** `hub:close` 또는 `hub:log --milestone` 필수 — *미해당(반려)*
6. [x] **거절 (2026-08-04)** — 정형 템플릿(구체 사유 없음) · 진단=미검증 가치 · 즉시 재제출 ❌ · Phase 4로

### 거절 기록 (2026-08-04)

| 항목 | 값 |
|------|-----|
| 신청일 | 2026-07-28 (목표 8/3 대비 조기) |
| 결과일 | 2026-08-04 (~7일 · 과거 패턴 5~14일과 일치) |
| 메일 | 사유 없는 정형 템플릿 («몇 가지 수정» + 콘텐츠 부족 예시 팁만) — Ark 7회 반려와 동일 양식 |
| 기술·색인 (신청 시점) | 26/29 · ads.txt·핵심4 PASS · 미색인 3=무해 |
| GA4 (6/30–7/27) | naver/organic 11 · google/organic 6 · naver/blog 5 · direct 65 |
| B-4 | 기산 7/20 → 신청일 8일차(미완주) · 잠금상 GO였으나 승인 보장 아님 확인됨 |
| 도메인 | 등록 2026-06-15 → 신청 시 ~6주 (팀 하한 3개월 미달) |
| 진단 | **미검증 가치**(연령·오가닉) — 콘텐츠 전면 개편/미색인「수정」= 오답 |

승인 후(별 세션): ads.txt 재확인 · Giscus 선택 재설정 · Ark는 같은 pub **사이트 추가**(Gate A 면제 아님 · Joseph 보류 해제 후)

---

## Phase 4 — 재신청 창 (2026-08-04 Cursor 잠금)

### 창 계산

| 조건 | 날짜 | 비고 |
|------|------|------|
| 콜오프 ≥4주 (기산 8/4 반려) | ≥ **2026-09-01** | |
| 도메인 연령 ≥3개월 (등록 6/15) | ≥ **2026-09-15** | **운영 HARD** (Google 공식 아님 · Ark 학습) |
| **다음 신청 가능일** | ≥ **2026-09-15** | max(콜오프, 연령) |

### Gate B 재실측 (신청 직전 · 전부 충족)

| # | 조건 | 비고 |
|---|------|------|
| 1 | 발행 포스트 색인 ≥70% | |
| 2 | 핵심 `/` about contact privacy 색인 | |
| 3 | **B-4 엄격**: 네이버/티스토리 **또는 오가닉** 2주 연속 | 8/3「미달도 GO」면제 **폐기** |
| 4 | ads.txt·메타·법적 페이지 | Phase 2 curl |
| 5 | Ark와 **동시 신규 신청 금지** | HARD |
| 7 | 포스트 **≥30** (실질 · 덤프 금지) | Playbook v2.3 B-7 |
| 8 | GSC **노출** 연속(클릭 0 OK) | B-8 · 「검색 존재」신호 |
| 9 | 대량 변경 후 **7–14일** crawl 대기 | B-9 |
| 10 | (권장) AdSense Privacy & messaging **Google CMP** | B-10 · EEA/TCF · 승인 후도 OK |

### 운영 레버 (창까지 · 「콘텐츠 고치기」아님)

1. **최우선**: GSC 성과 — **노출** 추세 + 클릭0 쿼리 → title/메타만 (§1–4식)
2. **신규 포스트 동결 해제** — 20→30+ **꾸준히**(주 소량 FLEX · 일괄 러시 금지)
3. 네이버 = 채널 다각화 유지 · **승인 신호의 주축 = 오가닉/노출**
4. Astro/기술 핫픽스 **불필요**(2026-08-04 헬스 PASS) — 스택 교체 금지

### Joseph 체크리스트 (신청 전)

- [ ] AdSense **정책 센터** — TK 반려 구체 사유 표시 여부 (없으면 템플릿 확정)
- [ ] TK GSC 성과 — **노출·클릭** 스크린샷 (노출만 있어도 기록)
- [ ] GA4 — organic 또는 referral 2주 연속 스냅샷
- [ ] 포스트 편수 ≥30 · 색인 ≥70%
- [ ] 마지막 대량 변경으로부터 ≥7일
- [ ] Phase 2 curl 재실행 → `GO`
- [ ] (권장) Privacy & messaging Google CMP on
- [ ] **gsfark.com 미제출** 재확인

### 금지

- **2026-09-15 전** TK 재제출
- 본문 전면 재작성 · 니치 피벗 · 미색인 3건「수정」· Astro 이주
- Ark·TK 동시 신규 신청 · 「슬롯 비었으니 Ark 지금」
- 변경 직후(7일 미만) 재신청

### Astro 헬스 요약 (2026-08-04)

라이브: ads.txt 200·plain·redirect0 · adsense meta+script 상시 · trust footer · Privacy AdSense 명시 · `/tags/` Disallow. 상세=Ark Playbook §1b.
---

## 교차검증 (2026-08-04, Claude — Cursor 09:39와 독립 분석)

Claude가 GSF-OS 저장소 미열람 상태로 별도 분석했으나, 진단(미검증 가치·도메인연령·오가닉부족)·재신청일(9/15)·운영레버(동결해제·GSC전환)까지 위 Phase 4와 완전 일치 — 교차검증 통과. 신규 결정사항 없음. refs: Claude 메모리 `project-tokyokorean.md` 2026-08-04.

---

## hub:log 예시

```bash
cd ~/.gemini/antigravity/scratch/projects/GSF-Hub
npm run hub:log -- --author=Cursor --project=TokyoKorean --milestone \
  --action="TK AdSense 반려(7/28신청→8/4)" \
  --priority="재신청≥2026-09-15 · 오가닉 레버 · 동결해제" \
  --line="원인: 미검증가치(연령·organic) · 기술/색인 PASS" \
  --line="refs: ADSENSE_8_3_RUNBOOK · WEEKLY · D-001"
npm run hub:log -- --author=Cursor --project=GSF-Ark \
  --line="OPEN_QUEUE G4: TK 반려·재창≥9/15 · Ark 신청 UI 금지 until Joseph+Gate A 실측"
```
