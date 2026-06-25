# AG TASK — TokyoKorean AdSense 신뢰도·정합성 빠른 수정 (이메일 · Privacy · 글목록)
> 생성: 2026-06-25  
> 작성: Cursor (Joseph 요청)  
> 목적: **7/13~15 AdSense 신청 전** 연락처 일관성 · Privacy↔GA4 정합성 · 글목록 첫 화면 보강  
> **범위 밖:** 사진 삽입 · GSC URL 색인 · CookieConsent 신규 마운트 · Publisher/GA4 env 변경

---

## 배경

Claude·Cursor AdSense 평가에서 **코드/문서만으로 즉시 해결 가능**한 항목 3건:

| # | 이슈 | 심각도 |
|---|------|--------|
| 1 | 소셜 Mail 아이콘 `tokyokorean78@gmail.com` vs Contact/Privacy `asiaunion@gmail.com` | 중 |
| 2 | Privacy §4·§7 “GA 미사용” vs 라이브 GA4 `G-86NS9E5Y20` | 중 |
| 3 | `/posts/` 1페이지 4편만 노출 (`postPerPage: 4`) | 낮음 (선택) |

Joseph는 `tokyokorean78@gmail.com`을 **비상용 수신함**으로만 유지. **공개 노출 주소는 `asiaunion@gmail.com` 하나.**

---

## STEP 0 — 시작 스냅샷 (복사 실행)

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean

echo "=== 이메일 불일치 ==="
rg "tokyokorean78|asiaunion@gmail" src/constants.ts src/data/contact src/data/privacy

echo "=== Privacy GA 문구 (ko) ==="
rg -n "분석 쿠키|분석 도구|미사용|탑재하지" src/data/privacy/ko.md

echo "=== 라이브 GA4 ==="
curl -s https://tokyokorean.net/ | grep -o 'G-[A-Z0-9]*' | head -1

echo "=== 글목록 1페이지 포스트 수 ==="
curl -s https://tokyokorean.net/posts/ | grep -o '/posts/[a-z0-9-]*/' | sort -u | grep -v '/posts/[0-9]*/' | wc -l

pnpm run build
```

**기대 (작업 전)**

| 항목 | 상태 |
|------|------|
| `constants.ts` Mail href | `tokyokorean78@gmail.com` |
| Contact / Privacy 본문 | `asiaunion@gmail.com` |
| Privacy §4·§7 (ko/en/ja) | GA “미사용” 문구 |
| `postPerPage` | `4` |

---

## STEP 1 — 공개 이메일 통일 (필수)

### 수정 파일

`src/constants.ts` — `SOCIALS` 배열의 Mail 항목 **1곳만** 변경.

**Before**

```ts
href: "mailto:tokyokorean78@gmail.com",
```

**After**

```ts
href: "mailto:asiaunion@gmail.com",
```

### 검증

```bash
rg "tokyokorean78" src --glob '!node_modules'
# → 0건 (src 내)

curl -s https://tokyokorean.net/ | grep -o 'mailto:[^"]*' | sort -u
# → asiaunion@gmail.com 만 (배포 후)
```

> Contact·Privacy·About은 이미 `asiaunion@gmail.com` — **수정 불필요.**

---

## STEP 2 — Privacy §4·§7 GA4 기재 (필수)

**3개 언어 모두** 동일한 사실 반영. 상단 **최종 업데이트** 날짜를 작업일로 갱신 (예: `2026년 6월 25일`).

측정 ID: `G-86NS9E5Y20`  
호스팅: Vercel 서버 로그는 **운영·보안 목적**으로 계속 언급 가능.

### 2-A. `src/data/privacy/ko.md`

**§4 분석 쿠키 항목 — Before**

```markdown
- **분석 쿠키**: 집계 단위 방문 통계 (현재 미사용이며 향후 도입 시 본 방침을 갱신하여 고지)
```

**After**

```markdown
- **분석 쿠키**: Google Analytics 4(GA4, 측정 ID `G-86NS9E5Y20`)를 통해 집계 단위 방문 통계를 수집합니다. 개인을 직접 식별하지 않으며, 브라우저에서 쿠키를 차단하면 통계 수집이 제한될 수 있습니다.
```

**§7 전체 — Before**

```markdown
## 7. 분석 도구 (Analytics)

본 사이트는 현재 별도의 제3자 분석 도구(Google Analytics 등)를 직접 탑재하지 않습니다. 호스팅 제공자(Vercel) 서버 단에서 수집되는 집계 트래픽 지표를 운영 목적으로만 참조합니다. 향후 분석 도구를 도입하는 경우 본 방침에 반영하고 발효일을 갱신합니다.
```

**After**

```markdown
## 7. 분석 도구 (Analytics)

본 사이트는 **Google Analytics 4(GA4)** 를 사용하여 방문 페이지·체류 시간·유입 경로 등 **집계 단위** 통계를 수집합니다. 측정 ID는 `G-86NS9E5Y20`이며, Google의 개인정보 처리방침이 적용됩니다.

- Google Analytics 개인정보: [https://policies.google.com/privacy](https://policies.google.com/privacy)
- Google Analytics opt-out (브라우저 애드온): [https://tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout)

호스팅 제공자(Vercel) 서버 로그의 집계 트래픽 지표는 **운영·보안·장애 대응** 목적으로만 참조합니다. 분석 도구를 변경하는 경우 본 방침과 상단 **최종 업데이트** 일자를 갱신합니다.
```

### 2-B. `src/data/privacy/en.md`

**§4 Analytics cookies — After**

```markdown
- **Analytics cookies**: aggregate visit statistics collected via **Google Analytics 4 (GA4, Measurement ID `G-86NS9E5Y20`)**. Data is not used to directly identify individuals; blocking cookies in the browser may limit analytics collection.
```

**§7 Analytics — After**

```markdown
## 7. Analytics

This Site uses **Google Analytics 4 (GA4)** to collect **aggregate** statistics such as pages visited, session duration, and traffic sources. The Measurement ID is `G-86NS9E5Y20`, and Google's privacy policy applies.

- Google Privacy Policy: [https://policies.google.com/privacy](https://policies.google.com/privacy)
- Google Analytics opt-out (browser add-on): [https://tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout)

Aggregate traffic metrics at the server level from the hosting provider (Vercel) are used only for **operations, security, and incident response**. If analytics tools change, this Policy and the **Last Updated** date at the top will be revised.
```

### 2-C. `src/data/privacy/ja.md`

**§4 分析クッキー — After**

```markdown
- **分析クッキー**: **Google Analytics 4（GA4、測定 ID `G-86NS9E5Y20`）** により、集計単位の訪問統計を収集します。個人を直接特定する目的では使用せず、ブラウザでクッキーをブロックすると統計収集が制限される場合があります。
```

**§7 分析ツール — After**

```markdown
## 7. 分析ツール（Analytics）

本サイトは **Google Analytics 4（GA4）** を用いて、訪問ページ・滞在時間・流入経路などの **集計単位** の統計を収集します。測定 ID は `G-86NS9E5Y20` であり、Google のプライバシーポリシーが適用されます。

- Google プライバシーポリシー: [https://policies.google.com/privacy](https://policies.google.com/privacy)
- Google Analytics オプトアウト（ブラウザアドオン）: [https://tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout)

ホスティング提供者（Vercel）のサーバーログに基づく集計トラフィック指標は、**運用・セキュリティ・障害対応** の目的にのみ参照します。分析ツールを変更する場合は、本ポリシーと上部の **最終更新日** を改定します。
```

### 검증

```bash
for lang in ko en ja; do
  echo "=== privacy/$lang ==="
  rg "G-86NS9E5Y20|미사용|none currently|タップ재하지|탑재하지" "src/data/privacy/$lang.md" || true
done

curl -s https://tokyokorean.net/privacy-policy/ | grep -c "G-86NS9E5Y20"
# → 1 이상 (배포 후)

curl -s https://tokyokorean.net/privacy-policy/ | grep -c "탑재하지 않습니다"
# → 0 (배포 후)
```

---

## STEP 3 — 글목록 페이지당 표시 수 (선택 · 권장)

AdSense 심사 봇이 `/posts/` 첫 화면만 볼 때 콘텐츠 밀도 개선.

### 수정 파일

`src/config.ts`

```ts
postPerIndex: 4,   // → 8 (홈 최근 글과 정렬; 현재 index는 max(postPerIndex, 6) 사용)
postPerPage: 4,    // → 8
```

> **주의:** `postPerIndex`는 홈 최근 글 상한. `6` 이상이면 홈은 이미 6편 노출 중이므로 `8`로 올려도 무방.

### 검증

```bash
pnpm run build
# /posts/ 1페이지 카드 수 = min(8, 현재 라이브 포스트 수)
```

---

## STEP 4 — 커밋 · 배포 · _handoff

### 커밋 메시지 (예시)

```
fix: unify contact email and align privacy policy with live GA4

- SOCIALS mail icon → asiaunion@gmail.com
- Privacy ko/en/ja §4·§7 disclose GA4 G-86NS9E5Y20
- (optional) postPerPage 4 → 8
```

### _handoff.md 템플릿

```markdown
## [YYYY-MM-DD HH:MM] AG 배포 완료
- 작업 내용: AdSense 신뢰도 polish — 이메일 asiaunion 통일 · Privacy GA4 §4·§7 정합성 · (선택) postPerPage 8
- 커밋 해시: ______
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 아니오
- 특이사항: tokyokorean78은 비상용 비공개 유지. 라이브 curl 검증 완료.
```

### 라이브 최종 체크리스트

| # | 항목 | AG |
|---|------|-----|
| 1 | `src` 내 `tokyokorean78` 0건 | ☐ |
| 2 | 라이브 mailto 전부 `asiaunion@gmail.com` | ☐ |
| 3 | `/privacy-policy/` GA4 ID + “미사용” 문구 없음 | ☐ |
| 4 | `pnpm run build` PASS | ☐ |
| 5 | Vercel 배포 완료 | ☐ |
| 6 | `_handoff.md` 기록 | ☐ |

---

## 하지 말 것

| 금지 | 이유 |
|------|------|
| `tokyokorean78@gmail.com` 사이트에 다시 노출 | Joseph 비상용 비공개 정책 |
| GA4 / AdSense ID를 git에 새 env 파일로 커밋 | Vercel env only |
| 사진 삽입 · placeholder 복구 | Joseph 촬영 후 별도 TASK |
| CookieConsent 배너 마운트 | Plan B 원칙 |
| Privacy 발효일(2026-04-17) 변경 | **최종 업데이트**만 갱신 |

---

## Joseph → AG 시작 메시지 (복사용)

```
TokyoKorean AdSense trust polish 시작해줘.
지시서: docs/AG_TASK_2026-06-25_adsense-trust-polish.md

필수:
1) src/constants.ts Mail → mailto:asiaunion@gmail.com
2) src/data/privacy/ko.md, en.md, ja.md §4·§7 GA4(G-86NS9E5Y20) 반영 + 최종 업데이트일 갱신

선택(권장):
3) src/config.ts postPerPage·postPerIndex 4 → 8

범위 밖: 사진, URL 색인, CookieConsent, env 변경.
완료 후 pnpm build, push, _handoff 기록.
```

---

*선행 완료: Phase 2A (`1f23724`) · modDatetime (`dbbfc1b`) · vercel.json 정리 (`42e25ab`)*  
*다음 대형 작업: [`AG_TASK_2026-06-24_photos-route-a.md`](./AG_TASK_2026-06-24_photos-route-a.md) — Joseph 촬영 트리거 시*
