# AG TASK — TokyoKorean ⭐⭐⭐ 사진 삽입 (루트 A · Phase 2B)
> 생성: 2026-06-24  
> **트리거:** Joseph가 루트 A 촬영 완료 + 채팅/지정 폴더로 **원본 사진 제공** 후 AG 시작  
> 선행: [`AG_TASK Phase 2A`](./AG_TASK_2026-06-24_phase2-adsense-prep.md) AdSense meta·GA4 권장  
> SSOT: [`PHOTO_NEEDED_TRACKER.md`](./PHOTO_NEEDED_TRACKER.md) · [`BLOG_IMAGE_RULES_1PAGE.md`](../BLOG_IMAGE_RULES_1PAGE.md) · [`BLOG_IMAGE_INTENT_RULES.md`](../BLOG_IMAGE_INTENT_RULES.md)

---

## 범위

**⭐⭐⭐ 6편 · 27곳** (AdSense·GSC URL 색인 1순위)

| # | slug | 위치 수 |
|---|------|---------|
| 1 | `nihonbashi-hidden-cafes` | 5 |
| 2 | `japan-convenience-store-must-buys` | 4 |
| 3 | `nihonbashi-history-and-modern-life` | 4 |
| 4 | `nihonbashi-why-i-live-here` | 4 |
| 5 | `tokyo-supermarket-guide` | 5 |
| 6 | `tokyo-weekend-getaway-spots` | 5 |

**루트 A (Joseph 도보):** 니혼바시 다리·도로원표·강변·닌교초·코레도·피코크·와쿠와쿠·카페 5곳·편의점 등 — TRACKER §촬영 루트 A 참조.

**범위 밖:** ⭐⭐·⭐ 14편 · `tokyo-weekend-getaway-spots` 중 **루트 B**(요코하마·가마쿠라 등) 컷은 Joseph **별도 촬영 후** 추가 배치.

---

## Joseph → AG 전달 (시작 조건)

```
TokyoKorean 사진 TASK 시작.

편: [ 6편 전체 / nihonbashi-hidden-cafes 만 / … ]

원본 위치:
- [채팅 첨부 N장]
- [폴더 경로: /Users/.../route-a/]

히어로 vs 본문 매핑 (선택):
- nihonbashi-hidden-cafes: hero=___ , body NEXPECT=___

「이 정도면 충분」 확인: [ 예 / 편별 검수 ]
```

**금지:** Downloads 자동 탐색 · Joseph 미지정 파일 사용 · hero=body 동일 MD5

---

## AG 작업 순서 (편당)

1. **의도·후보 분류** — `BLOG_IMAGE_INTENT_RULES.md` §3-3
2. **에셋 처리** — webp + hero-og.jpg(1200×630) · `BLOG_IMAGE_RULES_1PAGE.md` Option A
3. **MD 갱신** — `src/data/blog/ko/<slug>.md` · frontmatter `ogImage` · 본문 `![]()` (표정/「사진 왼쪽」 문구 0건)
4. **검증**
   ```bash
   pnpm run build
   # hero ≠ body MD5, ogImage 경로 200
   ```
5. **TRACKER** — 완료 항목 `[x]` · 요약表 갱신
6. **배포** — Joseph 지시 시 commit + push (Vercel)

---

## 편당 최소 PASS

| 항목 | 기준 |
|------|------|
| 히어로 | 1장 · 주제 장면 · 개인 셀카/실내 난무 X |
| 본문 | TRACKER 해당 섹션 1장+ (Joseph 「충분」 시 섹션 생략 가능) |
| 3-language | TokyoKorean KO 단일 — **ko.md만** |
| noindex | 없음 |
| build | exit 0 |

---

## 완료 후

1. `_handoff.md` — 배포 URL · 커밋 · TRACKER N/61
2. Joseph — **~7/10** [`ADSENSE_AND_GSC_CHECKLIST.md`](./ADSENSE_AND_GSC_CHECKLIST.md) Phase 4 URL 색인 요청
3. ⭐⭐⭐ 6 URL + 홈·About·Contact·Privacy

---

## Joseph → AG 트리거 (복사용)

```
TokyoKorean 사진 TASK (루트 A / ⭐⭐⭐) 시작.
지시서: docs/AG_TASK_2026-06-24_photos-route-a.md
원본: [첨부 / 폴더 경로]
```

---

*Phase 2B — Joseph 촬영 완료 전 AG 시작 금지*
