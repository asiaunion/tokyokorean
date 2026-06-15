export type PostDisclaimerCategory = "investment" | "safety" | "general";
export type PostDisclaimerLang = "en" | "ko" | "ja";

/** Resolved category for layout `PostDisclaimer` (top of article body). */
export function resolvePostDisclaimerCategory(
  category?: "investment" | "safety" | "life" | "local" | "essay" | null
): PostDisclaimerCategory {
  if (category === "investment" || category === "safety") return category;
  return "general";
}

export const POST_DISCLAIMER_COPY: Record<
  PostDisclaimerCategory,
  Record<PostDisclaimerLang, string>
> = {
  investment: {
    ko: "※ 본 글은 정보 제공 목적의 개인적 분석이며, 특정 부동산·투자 상품의 매수·매도를 권유하지 않습니다. 투자·세무·법무·이민 판단은 공식 자료와 자격을 갖춘 전문가 상담 후 본인 책임으로 내려 주세요. 수치·제도·시세·운영 정보는 게시 시점 기준이며, 확인 없이 의사결정에 사용하지 마십시오. 작성 이후 시장·제도가 변경될 수 있습니다.",
    en: "※ This article is for informational purposes and personal analysis only—not investment, legal, tax, or immigration advice, and not a recommendation to buy or sell any property or financial product. Verify figures, rules, and market data against official sources and consult qualified professionals; you are solely responsible for your decisions. Information reflects the time of writing and may change afterward.",
    ja: "※ 本記事は情報提供を目的とした個人的な分析であり、特定の不動産・投資商品の売買を推奨するものではありません。投資・税務・法務・入国管理等の判断は、公的資料の確認と有資格の専門家への相談のうえ、ご自身の責任で行ってください。数値・制度・相場・運営情報は掲載時点のものです。確認なく意思決定に用いないでください。執筆後も市場・制度は変更される場合があります。",
  },
  safety: {
    ko: "※ 본 글은 재해·안전에 관한 일반 소개이며, 긴급 대피 지침이나 공식 경보를 대체하지 않습니다. 지도·수치·대피 경로 등은 게시 시점 기준이며, 재난 시에는 방송·지자체·소방 등 공식 안내를 최우선으로 따르고 현장 상황을 확인하세요.",
    en: "※ This article is a general overview of hazards and safety—not a substitute for emergency instructions or official alerts. Maps, figures, and routes reflect the time of writing; in an emergency, follow government and local authority guidance first and verify conditions on the ground.",
    ja: "※ 本記事は災害・安全に関する一般的な紹介であり、緊急時の避難指示や公式警報に代わるものではありません。地図・数値・避難経路等は掲載時点のものです。災害時は放送・自治体・消防などの公式情報を最優先し、現地の状況を確認してください。",
  },
  general: {
    ko: "※ 본 글은 정보 제공 목적이며, 투자·법무·세무·이민 등 개별 조언이나 권유가 아닙니다. 수치·제도·운영·영업시간 등은 게시 시점 기준이며, 이용·방문 전 공식 안내를 확인해 주세요.",
    en: "※ This article is for informational purposes only and is not investment, legal, tax, or immigration advice. Figures, rules, hours, and operational details were accurate when published—verify with official sources before you rely on them.",
    ja: "※ 本記事は情報提供を目的としており、投資・法務・税務・入国管理等の個別助言や勧誘ではありません。数値・制度・運営・営業時間等は掲載時点のものです。利用・訪問前に公式情報をご確認ください。",
  },
};

export function postDisclaimerText(
  category: PostDisclaimerCategory,
  lang: PostDisclaimerLang
): string {
  return POST_DISCLAIMER_COPY[category][lang];
}
