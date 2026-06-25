# AG TASK — AdSense Prep 배포 (면책 lang · modDatetime · CookieConsent)
> 생성: 2026-06-25  
> 작성: Cursor (Joseph 요청)  
> 목적: **Cursor가 로컬 완료한 AdSense 준비 수정**을 검증·커밋·배포·라이브 확인  
> **범위 밖:** 사진 촬영·삽입 · GSC URL 색인 요청 · AdSense 신청 · env 변경 · 콘텐츠 본문 재작성

---

## 배경

Claude 7/20 AdSense 승인률 재평가를 Cursor가 교차검증한 결과, **코드는 이미 로컬에 반영됨** — AG는 **재구현하지 말고** 검증 → 커밋 → push → 라이브 curl 확인만 수행.

| # | 이슈 | 조치 (Cursor 완료) |
|---|------|-------------------|
| 1 | KO 포스트 면책문구가 **영문 general**으로 노출 (`lang` 기본값 `en` 버그) | `resolvePostLang()` + `htmlLang` 전달 |
| 2 | `a87afab`에서 KO 20편 `modDatetime` 동일일 일괄 추가 → **14편 "수정:" 라벨** 위험 | KO 20편 `modDatetime` 제거 |
| 3 | KO frontmatter에 `lang` 없음 | KO 20편 `lang: ko` 추가 |
| 4 | CookieConsent 배너 없음 (신뢰도·GDPR 권고) | `_archived/`에서 복원, **AdSense meta는 비차단 유지** |

**SSOT:** [`_handoff.md`](../_handoff.md) · [`WEEKLY_STATUS.md`](../WEEKLY_STATUS.md) · [`ADSENSE_AND_GSC_CHECKLIST.md`](./ADSENSE_AND_GSC_CHECKLIST.md)

---

## STEP 0 — 시작 스냅샷 (복사 실행)

```bash
cd /Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean

echo "=== git 상태 (Cursor 변경 미커밋 여부) ==="
git status --short

echo "=== 신규/수정 파일 존재 ==="
test -f src/utils/postLang.ts && echo "postLang.ts OK" || echo "MISSING postLang.ts"
test -f src/components/CookieConsent.astro && echo "CookieConsent OK" || echo "MISSING CookieConsent"

echo "=== KO lang / modDatetime ==="
rg -c '^lang: ko' src/data/blog/ko/*.md | wc -l    # 기대: 20
rg -c '^modDatetime:' src/data/blog/ko/*.md 2>/dev/null | wc -l  # 기대: 0

echo "=== PostDetails htmlLang ==="
rg -n "resolvePostLang|htmlLang" src/layouts/PostDetails.astro

echo "=== Layout CookieConsent ==="
rg -n "CookieConsent" src/layouts/Layout.astro

npm run build
```

**기대 (작업 전 — Cursor 변경이 워킹트리에 있어야 함)**

| 항목 | 기대 |
|------|------|
| `src/utils/postLang.ts` | 존재 |
| `src/components/CookieConsent.astro` | 존재 (untracked 또는 staged) |
| KO `lang: ko` | 20편 |
| KO `modDatetime` | 0편 |
| `npm run build` | exit 0 |

**⚠️ 워킹트리가 clean이고 위 파일이 없으면** — Joseph에게 보고. 이 지시서의 코드 diff를 임의 재작성하지 말 것.

---

## STEP 1 — 로컬 빌드 검증 (필수)

```bash
npm run build
```

**PASS 기준**

- exit 0
- Astro **ERROR** 0건 (privacy route WARN은 기존과 동일, 무시 가능)
- `dist/posts/japan-banking-credit-card/index.html`에 한국어 **투자** 면책 포함 확인:

```bash
rg '본 글은 정보 제공 목적의 개인적 분석' dist/posts/japan-banking-credit-card/index.html
rg 'cookie-consent-banner' dist/posts/japan-banking-credit-card/index.html
```

**FAIL 시:** 빌드 로그 저장 → Joseph 보고. push 금지.

---

## STEP 2 — 커밋 · push (필수)

### 포함 파일 (전부)

```
src/utils/postLang.ts
src/components/CookieConsent.astro
src/layouts/PostDetails.astro
src/layouts/Layout.astro
src/data/blog/ko/*.md          (20편 — lang 추가, modDatetime 제거)
WEEKLY_STATUS.md
_handoff.md
docs/AG_TASK_2026-06-25_adsense-prep-deploy.md
```

### 커밋 메시지 (예시)

```
fix: AdSense prep — KO disclaimer lang, cookie banner, modDatetime cleanup

- resolvePostLang for KO/JA posts (disclaimer + html lang)
- Restore CookieConsent banner (AdSense meta remains unconditional)
- Remove batch modDatetime from 20 KO posts; add lang: ko frontmatter
```

```bash
git add src/utils/postLang.ts \
        src/components/CookieConsent.astro \
        src/layouts/PostDetails.astro \
        src/layouts/Layout.astro \
        src/data/blog/ko/ \
        WEEKLY_STATUS.md \
        _handoff.md \
        docs/AG_TASK_2026-06-25_adsense-prep-deploy.md

git commit -m "$(cat <<'EOF'
fix: AdSense prep — KO disclaimer lang, cookie banner, modDatetime cleanup

EOF
)"

git push origin main
```

---

## STEP 3 — 라이브 검증 (필수, 배포 완료 후)

Vercel 배포 완료 대기 후 curl:

```bash
BASE=https://tokyokorean.net

echo "=== 1. 투자 포스트 — 한국어 면책 ==="
curl -s "$BASE/posts/japan-banking-credit-card/" | rg -o '본 글은 정보 제공 목적의 개인적 분석[^<]{0,40}'

echo "=== 2. 안전 포스트 — 한국어 면책 ==="
curl -s "$BASE/posts/japan-healthcare-hospital-visit/" | rg -o '재해·안전에 관한 일반 소개[^<]{0,30}'

echo "=== 3. 일반 포스트 — 한국어 면책 (영문 general 아님) ==="
curl -s "$BASE/posts/tokyo-public-transportation-tips/" | rg -o '본 글은 정보 제공 목적이며' 

echo "=== 4. 수정 라벨 없음 (은행 포스트 pub 6/19) ==="
curl -s "$BASE/posts/japan-banking-credit-card/" | rg '수정:|Updated' || echo "OK: no updated label"

echo "=== 5. html lang=ko ==="
curl -s "$BASE/posts/japan-banking-credit-card/" | rg -o '<html[^>]*lang="ko"'

echo "=== 6. CookieConsent 배너 마크업 ==="
curl -s "$BASE/posts/tokyo-public-transportation-tips/" | rg 'cookie-consent-banner|이 사이트는 기능 개선과 광고'

echo "=== 7. AdSense meta (비차단 유지) ==="
curl -s "$BASE/" | rg 'google-adsense-account|adsbygoogle'
```

### 라이브 체크리스트

| # | 항목 | AG |
|---|------|-----|
| 1 | 투자 3편 면책 = 한국어 investment 문구 | ☐ |
| 2 | `japan-healthcare-hospital-visit` = 한국어 safety 문구 | ☐ |
| 3 | 일반 포스트 면책 ≠ 영문 "This article is for informational purposes only" | ☐ |
| 4 | KO 포스트에 "수정:" / "Updated" 라벨 없음 (pub < 오늘인 글) | ☐ |
| 5 | `<html lang="ko">` on post pages | ☐ |
| 6 | `cookie-consent-banner` HTML 존재 | ☐ |
| 7 | `google-adsense-account` + `adsbygoogle.js` 라이브 | ☐ |
| 8 | 3개 스모크 URL HTTP 200 | ☐ |

**스모크 URL (200 + 제목 존재)**

- `/posts/tokyo-public-transportation-tips/`
- `/posts/nihonbashi-history-and-modern-life/`
- `/posts/japan-healthcare-hospital-visit/`

---

## STEP 4 — _handoff.md 기록 (필수)

`_handoff.md`에 **별도 커밋** 또는 STEP 2 커밋에 포함. 아래 템플릿 사용:

```markdown
## [YYYY-MM-DD HH:MM] AG 배포 완료 (AdSense Prep)
- 작업 내용: KO 면책 한국어 정상화 · modDatetime 20편 제거 · lang:ko · CookieConsent 복원
- 커밋 해시: ______
- 배포 URL: https://tokyokorean.net
- Claude 부재 여부: 예/아니오
- 특이사항: Cursor 지시서 `docs/AG_TASK_2026-06-25_adsense-prep-deploy.md` 기준 라이브 curl 8항목 PASS.
```

---

## 하지 말 것

| 금지 | 이유 |
|------|------|
| KO 포스트 본문 재작성 · pubDatetime 변경 | `a87afab` 범위 밖 |
| 사진 삽입·`[사진 필요]` 복구 | Joseph 촬영 → [`AG_TASK_2026-06-24_photos-route-a.md`](./AG_TASK_2026-06-24_photos-route-a.md) |
| GSC URL 색인 요청 | Joseph 담당 (~7/10, 사진 배포 후) |
| AdSense 신청 | Joseph 7/13~15 |
| GA4 / AdSense env·`.env` git 커밋 | Vercel env only |
| CookieConsent가 AdSense `<meta>`·`adsbygoogle.js` 로딩을 막도록 변경 | Phase 2A 원칙 유지 |
| `modDatetime` 일괄 재추가 | 의도적 제거 항목 |

---

## 완료 보고 형식 (Joseph에게)

```
TokyoKorean AdSense Prep 배포 완료.

커밋: ______
배포: https://tokyokorean.net

라이브 검증:
- KO 투자 면책 (은행): PASS/FAIL
- KO 안전 면책 (병원): PASS/FAIL
- 수정 라벨 없음: PASS/FAIL
- CookieConsent: PASS/FAIL
- AdSense meta: PASS/FAIL

미완(범위 밖): 사진 10/62 · GSC URL 색인 · AdSense 신청 7/13~15
```

---

## Joseph → AG 시작 메시지 (복사용)

```
TokyoKorean AdSense Prep 배포 시작해줘.
지시서: docs/AG_TASK_2026-06-25_adsense-prep-deploy.md

Cursor가 로컬에 이미 반영한 변경을 재구현하지 말고:
1) STEP 0 스냅샷으로 워킹트리 확인
2) npm run build
3) 커밋 + push main
4) Vercel 배포 후 STEP 3 라이브 curl 8항목
5) _handoff.md 기록

범위 밖: 사진, GSC 색인, AdSense 신청, 콘텐츠 본문 수정.
완료 후 위 완료 보고 형식으로 회신.
```

---

*선행 완료: 콘텐츠 보강 (`a87afab`) · trust polish (`1c33a25`) · Giscus 언마운트 (`8ef0234`)*  
*다음 대형 작업: Joseph 루트 A 촬영 → [`AG_TASK_2026-06-24_photos-route-a.md`](./AG_TASK_2026-06-24_photos-route-a.md)*
