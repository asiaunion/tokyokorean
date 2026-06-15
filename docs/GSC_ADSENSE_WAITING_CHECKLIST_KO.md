# GSC · AdSense 대기 중 체크리스트 (gsfark.com)

> 스크린샷 기준 (2026-05-26): 색인 **121** · 미색인 **259** · AdSense 신청 후 검토 대기.

## 1. GSC 숫자 해석 (걱정 안 해도 되는 것)

| GSC 항목 | 건수 | 의미 | 조치 |
|----------|------|------|------|
| **noindex 태그** | ~136 | `/tags/` 목록·태그 페이지 — **의도적** (`robotsMeta="noindex, follow"`) | 수정 불필요. 얇은 목록 페이지를 검색 결과에서 제외하는 정상 SEO |
| **리디렉션 포함 페이지** | ~14 | 구 WP·태그 로케일·페이지네이션 정규화 **308** | 정상. canonical URL만 색인 대상 |
| **적절한 canonical 대체** | 1 | hreflang/canonical 정상 동작 | 무시 가능 |

**색인 대상은** `sitemap-0.xml`에 있는 본문·토픽·About·Privacy 등 (~121 URL)입니다. 태그 136건이 noindex인 것은 **품질·AdSense에 유리**한 설정입니다.

## 2. GSC에서 지금 할 일 (수동, 15~20분)

### A. 404 — 「수정 사항 확인」

과거 `/tags/.../2/` 등이 404였으나, 현재는 **308 → canonical 태그 URL**로 응답합니다.

1. Search Console → **페이지 색인 생성** → **찾을 수 없음(404)**
2. 상단 **「수정 사항 확인」** 클릭
3. 1~2주 후 건수 감소 확인

### B. noindex 태그 — 「수정 사항 확인」 **하지 않음**

noindex를 제거하면 얇은 태그 페이지가 대량 색인되어 **AdSense·품질에 불리**합니다.

### C. 색인 생성 요청 (우선순위 URL)

**URL 검사**에서 아래를 붙여넣고 **색인 생성 요청** (하루 6~10건 권장):

| # | URL |
|---|-----|
| 1 | `https://gsfark.com/` |
| 2 | `https://gsfark.com/topics/` |
| 3 | `https://gsfark.com/ko/topics/` |
| 4 | `https://gsfark.com/ja/topics/` |
| 5 | `https://gsfark.com/posts/tokyo-real-estate-investment-complete-guide/` |
| 6 | `https://gsfark.com/ko/posts/tokyo-meguro-setagaya/` |
| 7 | `https://gsfark.com/ja/posts/tokyo-meguro-setagaya/` |
| 8 | `https://gsfark.com/privacy-policy/` |
| 9 | `https://gsfark.com/ko/about/` |

### D. 「크롤링됨 – 색인 미생성」(12) · 「발견됨 – 미색인」(42)

- 대부분 **우선순위·품질** 이슈 — 위 핵심 URL부터 요청
- 시리즈 글(23구·니혼바시)은 내부 링크로 연결되어 있으면 순차 색인됨

### E. Sitemap

- 제출 URL: `https://gsfark.com/sitemap-index.xml` (200 확인)
- `/sitemap.xml`은 `/sitemap-index.xml`로 308 리다이렉트됨

## 3. AdSense 검토 대기 중 (이미 된 것 / 확인만)

| 항목 | 상태 |
|------|------|
| `ads.txt` | ✅ `https://gsfark.com/ads.txt` |
| `google-adsense-account` 메타 | ✅ 프로덕션 HTML |
| GA4 | ✅ `G-1JZH2YCS3Z` |
| Privacy | ✅ `/privacy-policy/` (KO/JA 동일) · `/privacy/` → 리다이렉트 배포 후 |
| Contact | ✅ `/contact/` |
| Cookie + Privacy 링크 | ✅ 배너에 privacy-policy 링크 |

**하지 말 것:** 승인 전 대량 제휴 링크 삽입, noindex 제거, 태그 페이지 색인 허용.

## 4. 배포 후 curl 스팟 체크

```bash
curl -sI https://gsfark.com/privacy/ | grep -i '^HTTP\|^location'
curl -sI https://gsfark.com/ko/tags/foo/2/ | grep -i '^HTTP\|^location'
curl -s https://gsfark.com/robots.txt
```

## 5. 주간 KPI (선택)

[`WEEKLY_KPI_REVIEW.md`](./WEEKLY_KPI_REVIEW.md) · JA 클러스터: [`SEO_JA_CLUSTER_FOCUS.md`](./SEO_JA_CLUSTER_FOCUS.md)

---

관련: [`GSC_MANUAL_STEPS_20260522.md`](./GSC_MANUAL_STEPS_20260522.md) · [`ADSENSE_AND_GSC_CHECKLIST.md`](./ADSENSE_AND_GSC_CHECKLIST.md) · [`NEXT_WORK_QUEUE.md`](./NEXT_WORK_QUEUE.md)
