import type { RawResearchItem } from "@/lib/research-adapter/types";

export interface ResearchProvider {
  collect(keyword: string): Promise<RawResearchItem[]>;
}

export class InMemoryResearchProvider implements ResearchProvider {
  constructor(private readonly data: RawResearchItem[] = []) {}
  async collect(keyword: string) {
    if (this.data.length > 0) return this.data;
    return [
      {
        title: `${keyword} - Bank of Japan Statistics`,
        url: "https://www.boj.or.jp/en/statistics/index.htm/",
        excerpt: "Official statistics related to macro and finance.",
      },
      {
        title: `${keyword} - REINS`,
        url: "https://www.reins.or.jp/",
        excerpt: "Japanese real estate transaction information network.",
      },
      {
        title: `${keyword} - Global Property Guide`,
        url: "https://www.globalpropertyguide.com/asia/japan/price-history",
        excerpt: "Historical housing price overview.",
      },
    ];
  }
}
