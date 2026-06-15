/** Macro-micro matrix copy for macro-barrier pilot column (single source of truth). */

export type MacroMicroMatrixData = {
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
};

export const macroBarrierMatrixKo: MacroMicroMatrixData = {
  leftTitle: "MACRO BARRIER (거시 악재)",
  leftItems: [
    "• <strong>한국</strong>: 스트레스 DSR 2단계 강행(2024년 9월 1일 시행) ➔ 수도권 외곽 거래량 <strong>-24.4% 급감</strong> (전월비)",
    "• <strong>일본</strong>: BOJ 금리인상(2024년 7월 31일 연 0.25% 결정) ➔ 수도권 중고 맨션 평균가 <strong>+2.2% 상승 (23구는 +3.9%로 사상 최고가)</strong> (2024년 9월 기준)",
  ],
  rightTitle: "ULTRA SCARCITY (초희소 미시 호조)",
  rightItems: [
    "• <strong>서울</strong>: 반포·서초 국평 래미안 원베일리 <strong>50억 돌파</strong> (2024년 8월 2일 신고가)",
    "• <strong>도쿄</strong>: 미나토·시부야 랜드마크 맨션 <strong>하방 경직 & 상승 유지</strong> (2024년 9월 기준)",
  ],
};

export const macroBarrierMatrixEn: MacroMicroMatrixData = {
  leftTitle: "MACRO BARRIER",
  leftItems: [
    "• <strong>Korea</strong>: Stage 2 Stress DSR (implemented Sept 1, 2024) ➔ Outskirt transaction volume <strong>plummets by 24.4%</strong> (MoM)",
    "• <strong>Japan</strong>: BOJ rate hike (0.25% on July 31, 2024) ➔ Pre-owned mansions <strong>rise +2.2% MoM (23 wards surge +3.9% to record high)</strong> (as of Sept 2024)",
  ],
  rightTitle: "ULTRA SCARCITY",
  rightItems: [
    "• <strong>Seoul</strong>: Banpo/Seocho standard apartments Raemian One Bailey <strong>exceed 5 billion KRW without loans</strong> (Aug 2, 2024 record high)",
    "• <strong>Tokyo</strong>: Minato/Shibuya landmark mansions maintain <strong>strong downside resilience & upward trends</strong> (as of Sept 2024)",
  ],
};

export const macroBarrierMatrixJa: MacroMicroMatrixData = {
  leftTitle: "MACRO BARRIER（マクロの逆風）",
  leftItems: [
    "• <strong>韓国</strong>：ストレスDSR第2段階（2024年9月1日施行）➔ 首都圏郊外の取引量 <strong>前月比▲24.4%</strong>",
    "• <strong>日本</strong>：日銀利上げ（2024年7月31日、政策金利約0.25%）➔ 中古マンション <strong>前月比+2.2%（23区+3.9%で史上最高）</strong>（2024年9月時点）",
  ],
  rightTitle: "ULTRA SCARCITY（超希少ミクロの好調）",
  rightItems: [
    "• <strong>ソウル</strong>：盤浦・瑞草 84㎡ レミアンワンベイリー <strong>融資なしで50億ウォン超</strong>（2024年8月2日 新高値）",
    "• <strong>東京</strong>：港・渋谷のランドマークマンションが <strong>強い下値支持線と上昇を維持</strong>（2024年9月時点）",
  ],
};
