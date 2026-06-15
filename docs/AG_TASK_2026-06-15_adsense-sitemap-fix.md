# AG TASK — AdSense 재제출을 위한 sitemap admin URL 제거
> 생성: 2026-06-15
> 작성: Claude
> 목적: AdSense "조치 필요" 통보 수신 → 재제출 전 기술 결함 수정
> 프로젝트: GSF-Ark (`scratch/projects/GSF-Ark/`)

---

## 배경

- 2026-06-13 Audit에서 `sitemap-0.xml`에 admin URL 4개 포함 결함 발견
- 2026-06-15 라이브 확인으로 현재도 미수정 상태 재확인:
  - `https://gsfark.com/admin/`
  - `https://gsfark.com/admin/login/`
  - `https://gsfark.com/admin/memos/`
  - `https://gsfark.com/admin/posts/`
- AdSense 심사관이 sitemap을 통해 admin 페이지 접근 시도 → 정책·신호 오염 위험

---

## 작업 내용

### STEP 1 — `astro.config.ts` sitemap filter 수정

**파일 경로:** `scratch/projects/GSF-Ark/astro.config.ts`

**현재 코드 (sitemap filter 블록, 약 57~70번째 줄):**

```typescript
sitemap({
  filter: page => {
    try {
      const pathname = new URL(page, SITE.website).pathname.replace(/\/+$/, "");
      // Exclude tag pages — these are noindex and mostly thin content (0-1 posts)
      if (pathname.includes("/tags")) return false;
      // Exclude pagination pages — these are duplicate list content (/posts/2/, /posts/3/, etc.)
      if (/\/posts\/\d+$/.test(pathname)) return false;
      // Exclude search pages — empty UI shell until user input (thin content)
      if (pathname.includes("/search")) return false;
      // Exclude archives — date-based index, thin content for AdSense
      if (pathname.endsWith("/archives")) return false;
      // Legacy /en/* redirect routes — not canonical EN URLs (GSC: avoid redirect URLs in sitemap)
      if (pathname === "/en" || pathname.startsWith("/en/")) return false;
      return true;
    } catch (e) {
      return false;
    }
  },
}),
```

**수정 후 코드:**

```typescript
sitemap({
  filter: page => {
    try {
      const pathname = new URL(page, SITE.website).pathname.replace(/\/+$/, "");
      // Exclude admin pages — CMS UI, not public content (AdSense policy risk)
      if (pathname === "/admin" || pathname.startsWith("/admin/")) return false;
      // Exclude tag pages — these are noindex and mostly thin content (0-1 posts)
      if (pathname.includes("/tags")) return false;
      // Exclude pagination pages — these are duplicate list content (/posts/2/, /posts/3/, etc.)
      if (/\/posts\/\d+$/.test(pathname)) return false;
      // Exclude search pages — empty UI shell until user input (thin content)
      if (pathname.includes("/search")) return false;
      // Exclude archives — date-based index, thin content for AdSense
      if (pathname.endsWith("/archives")) return false;
      // Legacy /en/* redirect routes — not canonical EN URLs (GSC: avoid redirect URLs in sitemap)
      if (pathname === "/en" || pathname.startsWith("/en/")) return false;
      return true;
    } catch (e) {
      return false;
    }
  },
}),
```

**변경 요약:** 기존 filter 블록 최상단에 1개 조건 추가:
```typescript
// Exclude admin pages — CMS UI, not public content (AdSense policy risk)
if (pathname === "/admin" || pathname.startsWith("/admin/")) return false;
```

---

### STEP 2 — 빌드 및 배포

```bash
cd scratch/projects/GSF-Ark
pnpm run build
# 빌드 성공 확인 후 Vercel 배포 (기존 배포 방식 동일)
```

---

### STEP 3 — 배포 후 라이브 검증 (필수)

아래 3가지를 순서대로 확인 후 결과를 보고:

**① sitemap에서 admin URL 제거 확인**
```bash
curl -s https://gsfark.com/sitemap-0.xml | grep admin
# 출력이 없어야 정상 (빈 결과 = 성공)
```

**② admin URL 라이브 응답 확인**
```bash
curl -sI https://gsfark.com/admin/ | grep -i '^HTTP\|^location'
curl -sI https://gsfark.com/admin/login/ | grep -i '^HTTP\|^location'
```
- 302 또는 308 리다이렉트 → 목적지 URL 함께 보고

**③ 정상 URL이 sitemap에 유지되는지 확인**
```bash
curl -s https://gsfark.com/sitemap-0.xml | grep -c '<loc>'
# 이전: admin 4개 포함된 수 / 수정 후: 4개 감소한 수여야 정상
```

---

### STEP 4 — 보고

작업 완료 후 아래 형식으로 보고:

```
[STEP 1] astro.config.ts 수정 완료 여부
[STEP 2] 빌드·배포 완료 여부 + 커밋 해시
[STEP 3-①] curl admin grep 결과 (빈 결과 확인)
[STEP 3-②] admin/ 응답 코드 + location 목적지
[STEP 3-③] sitemap <loc> 총 개수 (수정 전/후 비교)
```

---

## 완료 후 다음 스텝 (AG 작업 아님 — 목사님 직접)

1. `https://adsense.google.com` 접속
2. "애드센스 프로그램 정책을 읽었고 준수하고 있음을 확인합니다" 체크박스 체크
3. **"다시 제출"** 클릭

⚠️ STEP 3 검증 완료 보고 받은 후에만 위 재제출 진행할 것.

---

## 주의사항

- `astro.config.ts` 외 다른 파일은 수정하지 않음
- 태그 페이지, hreflang, robots.txt 등 기존 설정 건드리지 않음
- 임의 추가 작업 금지
