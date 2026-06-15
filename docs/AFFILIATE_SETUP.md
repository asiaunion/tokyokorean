# Affiliate Setup (A8.net + もしもアフィリエイト)

> **정책**: AdSense 승인 **전**에는 가입·심사만 진행하고, **승인 후** 포스트에 링크 삽입 (전략 문서 §11 #3).  
> **YMYL**: 투자·이주 글에는 [`AffiliateDisclosure.astro`](../src/components/AffiliateDisclosure.astro) 블록을 함께 사용합니다.

---

## 1. Registration checklist

| Program | URL | Status | Site ID / notes |
|---------|-----|--------|-----------------|
| **A8.net** | https://www.a8.net/ | [ ] 가입 | 사이트 `gsfark.com` 등록 |
| **もしもアフィリエイト** | https://af.moshimo.com/ | [ ] 가입 | 동일 |

**가입 시 사이트 설명 (일본語例)**:

> 東京の不動産・移住・生活情報を扱う3言語ブログ（韓国語・英語・日本語）。在住者による実務ガイドと公式ソース引用を重視。

---

## 2. Link insertion rules

1. **자연스러운 맥락** — 이주·부동산·서비스 비교 글에만 (에세이 제외 가능).
2. **`rel="sponsored noopener"`** + `target="_blank"` on external affiliate URLs.
3. **출처(`sources`)와 혼동 금지** — affiliate URL은 본문 하단 또는 전용 CTA 블록.
4. **구체 수익·매수 권유 금지** — 기존 YMYL 가드레일 유지.

### Config stub

Edit [`src/config/affiliate.ts`](../src/config/affiliate.ts) after approval — placeholder IDs only until programs approve.

---

## 3. Pilot posts (Week 4)

| Slug | Suggested program | Placement |
|------|-------------------|-----------|
| `japan-visa-paths-permanent-business-manager-asset-holders` | 移住・ビザ関連 | 본문 하단 CTA |
| `tokyo-moving-contracts-two-notes` | 引越し・生活 | 본문 하단 |
| `korea-japan-inheritance-gift-tax-cross-border-basics` | 税務・相談 | disclaimer 아래 |

---

## 4. Kill criteria (from strategy §9)

- **6개월**, 전환 **0건** → 프로그램/배치 전면 재검토.

---

## 5. Disclosure copy

Rendered via `AffiliateDisclosure` — EN/KO/JA strings in component. Privacy policy may reference affiliate relationships on next update.
