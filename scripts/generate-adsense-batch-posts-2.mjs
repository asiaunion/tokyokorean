import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const blogRoot = path.join(root, "src/data/blog");

const disclaimer = {
  ko: `

<div class="post-disclaimer">
<p class="post-disclaimer__title">면책 문구</p>
<p>※ 본 글은 정보 제공 목적의 개인적 분석이며, 특정 투자 상품의 매수·매도를 권유하지 않습니다. 투자 판단과 책임은 독자 본인에게 있습니다. 글의 작성 시점 이후 내용이 변경될 수도 있습니다.</p>
</div>
`,
  en: `

<div class="post-disclaimer">
<p class="post-disclaimer__title">Disclaimer</p>
<p>This article is for informational purposes only and reflects personal analysis. It does not recommend buying or selling any specific investment product. Investment decisions and responsibility rest solely with the reader. Content may change after the time of writing.</p>
</div>
`,
  ja: `

<div class="post-disclaimer">
<p class="post-disclaimer__title">免責事項</p>
<p>※ 本記事は情報提供を目的とした個人的な分析であり、特定の投資商品の売買を推奨するものではありません。投資判断と責任は読者ご本人にあります。内容は執筆時点以降に変更される可能性があります。</p>
</div>
`,
};

/** Macro B1–B5 */
const posts = [
  {
    slug: "weak-yen-korean-japan-asset-allocation-fx-scenarios",
    category: "investment",
    date: "2026-04-21T01:00:00Z",
    sources: ["https://www.boj.or.jp/en/statistics/index.htm/", "https://www.imf.org/en/Home"],
    tags: { ko: ["엔화", "환율", "한일", "자산배분"], en: ["Yen", "FX", "Korea-Japan", "Allocation"], ja: ["円", "為替", "日韓", "資産配分"] },
    title: { ko: "엔저와 한국인의 일본 자산 편입: 환율 시나리오 세 가지", en: "Weak Yen and Korean Allocations to Japan: Three FX Scenarios", ja: "円安と韓国人の日本資産配分：為替シナリオ三つ" },
    desc: { ko: "엔·원·달러의 상대 움직임을 단순화해, 일본 부동산·리츠·현금 보유의 민감도를 시나리오별로 정리합니다.", en: "Simplify JPY/KRW/USD paths to stress-test Japan real assets, J-REITs, and cash for Korean investors.", ja: "円・ウォン・ドルの相対変動を単純化し、日本の実物資産とJ-REIT、現金の感応度を整理します。" },
    body: {
      ko: `<p class="post-section-heading">1. 환율은 ‘수익’이 아니라 ‘레버리지’</p>
일본 현지 자산을 엔으로 벌고 원화로 환산할 때, 환율은 수익률에 **승수**로 작용합니다. 같은 임대 수익이라도 엔저가 극단으로 갈수록 원화 환산 총수익은 커질 수 있지만, 반대로 엔고가 오면 **현금흐름의 원화 가치**가 빠르게 줄어듭니다.

<p class="post-section-heading">2. 시나리오 A: 엔 약세 지속</p>
글로벌 금리 차와 일본의 완화 기조가 맞물릴 때 나타나는 전형적 경로입니다. 일본 **현금·단기채** 매력은 낮아지고 실물·주식·리츠로 자금이 기울기 쉽습니다.

<p class="post-section-heading">3. 시나리오 B: 엔 반등(리스크 오프)</p>
위기 시 엔은 단기적으로 **안전자산**으로 자금이 몰릴 수 있습니다. 이때 해외 투자자의 원화·달러 환산 손익은 급변할 수 있으니 **환헤지 여부**를 사전에 정책으로 두는 편이 낫습니다.

<p class="post-section-heading">4. 시나리오 C: 구조적 중립 밴드</p>
변동성이 줄어 환율이 박스권에 들어가면 **운영 현금흐름·세금·관리비**가 투자 수익의 대부분을 차지합니다. 이 구간에서는 환율보다 **현지 실물 펀더멘털**이 주도권을 가집니다.

<p class="post-section-heading">5. 참고 출처</p>
금리·대차대조표는 [일본은행 통계](https://www.boj.or.jp/en/statistics/index.htm/), 글로벌 거시 프레임은 [IMF](https://www.imf.org/en/Home) 자료가 출발점입니다. 본 글은 개인 메모입니다.`,
      en: `<p class="post-section-heading">1. FX is leverage, not “return” itself</p>
When yen cash flows convert to KRW, FX acts as a **multiplier**. Extreme yen weakness can inflate KRW totals; yen strength can erode **KRW value of the same coupon**.

<p class="post-section-heading">2. Scenario A: sustained yen weakness</p>
Rate differentials and accommodative Japan conditions can push funds toward **real assets, equities, and REITs** rather than cash.

<p class="post-section-heading">3. Scenario B: yen bounce (risk-off)</p>
In crises the yen can attract **safe-haven** flows. Decide **hedging policy** before volatility spikes.

<p class="post-section-heading">4. Scenario C: range-bound stability</p>
When FX calms, **operating cash flow, tax, and fees** dominate. Fundamentals matter more than spot FX.

<p class="post-section-heading">5. References</p>
Start with [BOJ statistics](https://www.boj.or.jp/en/statistics/index.htm/) and [IMF](https://www.imf.org/en/Home) macro primers. Observational note only.`,
      ja: `<p class="post-section-heading">1. 為替はリターンではなくレバレッジ</p>
円建てキャッシュフローを外貨に換算すると、為替は**倍率**として効きます。極端な円安は外貨換算を押し上げ、円高は同じクーポンの**外貨価値**を削ります。

<p class="post-section-heading">2. シナリオA：円安継続</p>
金利差と金融緩和が重なる典型的な経路で、**実物・株式・REIT**へ資金が傾きやすいです。

<p class="post-section-heading">3. シナリオB：円高（リスクオフ）</p>
危機局面では円に**安全資金**が流入することがあり、ヘッジ方針は事前に決めておくのが安全です。

<p class="post-section-heading">4. シナリオC：レンジ安定</p>
為替が静かなときは**運用CF・税・諸費用**が主役になり、現地ファンダメンタルが主導権を持ちます。

<p class="post-section-heading">5. 参照</p>
[日銀統計](https://www.boj.or.jp/en/statistics/index.htm/)と[IMF](https://www.imf.org/en/Home)が出発点です。個人的観察にすぎません。`,
    },
  },
  {
    slug: "japan-rate-hike-cycle-j-reit-three-lessons",
    category: "investment",
    date: "2026-04-21T02:30:00Z",
    sources: ["https://www.boj.or.jp/en/statistics/index.htm/", "https://www.fsa.go.jp/en/"],
    tags: { ko: ["금리", "J-REIT", "일본", "매크로"], en: ["Rates", "J-REIT", "Japan", "Macro"], ja: ["金利", "J-REIT", "日本", "マクロ"] },
    title: { ko: "일본 금리 인상 사이클과 J-REIT: 과거에서 배우는 세 가지", en: "Japan Rate-Hike Cycles and J-REITs: Three Historical Lessons", ja: "日本の金利上昇サイクルとJ-REIT：過去から学ぶ三つ" },
    desc: { ko: "정책 금리·장기 금리·크레딥 스프레드가 J-REIT 밸류에 미친 패턴을 일반화해, 과도한 단선 낙관·비관을 피하는 틀을 제시합니다.", en: "Generalize how policy rates, JGB curves, and credit spreads interacted with J-REIT valuations—avoiding single-line optimism or fear.", ja: "政策金利・長期金利・スプレッドがJ-REIT評価に与えた型を一般化し、単線の楽観・悲観を避ける枠を示します。" },
    body: {
      ko: `<p class="post-section-heading">1. 금리는 ‘배당 할인율’이자 ‘자금 조달 비용’</p>
리츠는 **자산 가치**와 **부채 구조**를 동시에 안고 갑니다. 금리 상승기에는 할인율 상승으로 NAV 프레셔가 오지만, 동시에 인플레이션·임대 성장 기대가 상쇄할 수도 있습니다.

<p class="post-section-heading">2. 교훈 1: 곡선의 기울기가 중요</p>
단기만 오르고 장기가 둔하면 **스테그플레이션형** 우려가, 장기가 함께 오르면 **성장 재평가형** 해석이 나올 수 있습니다. [BOJ 통계](https://www.boj.or.jp/en/statistics/index.htm/)로 곡선을 먼저 봅니다.

<p class="post-section-heading">3. 교훈 2: 레버리지 품질</p>
같은 금리 충격이라도 **고정·변동 부채 비중**, **이자보상배율**에 따라 배당 안정성이 갈립니다. [FSA](https://www.fsa.go.jp/en/) 자료는 금융 시스템 리스크를 읽는 보조선입니다.

<p class="post-section-heading">4. 교훈 3: 섹터별 임대 구조</p>
오피스·물류·리테일·호텔은 금리 민감도가 같지 않습니다. **가중평균 임대 잔존**이 짧을수록 재계약 리스크는 크지만, 금리 전망 반영도 빠릅니다.

<p class="post-section-heading">5. 맺으며</p>
과거 패턴은 미래를 보장하지 않습니다. 종목별 공시와 사업보고서를 확인하십시오.`,
      en: `<p class="post-section-heading">1. Rates are both discount and funding</p>
REITs carry **asset value** and **liability structure**. Rising rates pressure NAV via discounting but can be offset by rent growth expectations.

<p class="post-section-heading">2. Lesson 1: curve slope matters</p>
Steepening vs flattening carries different macro reads. Start with [BOJ statistics](https://www.boj.or.jp/en/statistics/index.htm/).

<p class="post-section-heading">3. Lesson 2: leverage quality</p>
Fixed vs floating debt and **interest coverage** split outcomes. [FSA](https://www.fsa.go.jp/en/) materials help on systemic risk.

<p class="post-section-heading">4. Lesson 3: sector lease structures</p>
Office, logistics, retail, and hotels do not share the same rate beta. Shorter **WAULT** can mean faster repricing.

<p class="post-section-heading">5. Closing</p>
History is not prophecy—read filings.`,
      ja: `<p class="post-section-heading">1. 金利は割引率であり調達コスト</p>
REITは**資産価値**と**負債構造**を同時に持ちます。金利上昇はNAVを圧迫しつつ、賃料成長期待で相殺され得ます。

<p class="post-section-heading">2. 教訓1：カーブの勾配</p>
短期と長期の組み合わせで読みが変わります。まず[日銀統計](https://www.boj.or.jp/en/statistics/index.htm/)を。

<p class="post-section-heading">3. 教訓2：レバレッジの質</p>
固定・変動比率と**インタレストカバレッジ**が結果を分けます。[金融庁](https://www.fsa.go.jp/en/)資料が補助線になります。

<p class="post-section-heading">4. 教訓3：セクター別リース</p>
オフィス・物流・小売・ホテルで感応度は異なり、**残存契約**の長短が再定价速度を変えます。

<p class="post-section-heading">5. おわりに</p>
過去は未来を保証しません。開示を読んでください。`,
    },
  },
  {
    slug: "korea-japan-inheritance-gift-tax-cross-border-basics",
    category: "investment",
    date: "2026-04-21T04:00:00Z",
    sources: ["https://www.nta.go.jp/english/", "https://www.nts.go.kr/eng.do"],
    tags: { ko: ["상속", "증여", "세금", "한일"], en: ["Inheritance", "Gift tax", "Korea-Japan"], ja: ["相続", "贈与", "税", "日韓"] },
    title: { ko: "한일 상속·증여세 비교: 국경을 넘는 자산 이전의 출발점", en: "Korea–Japan Inheritance and Gift Tax: A Starting Map for Cross-Border Transfers", ja: "日韓の相続・贈与税：国境を越える資産移転の出発点" },
    desc: { ko: "거주·재산 소재·과세 관할이라는 세 축으로만 먼저 정리하고, 왜 개별 사건에서 반드시 전문가 자문이 필요한지를 강조합니다.", en: "Sort residency, situs, and taxing jurisdiction first—then why every case still needs professional advice.", ja: "居住・財産の所在・課税管轄の三軸だけ先に整理し、個別案件で専門家が必要な理由を強調します。" },
    body: {
      ko: `<p class="post-section-heading">1. 세 축: 거주·소재·관할</p>
상속·증여는 **피상속인·수증자의 거주**, **자산 소재지**, **각 국가의 국제조세 규칙**이 동시에 얽힙니다. 표면적으로 비슷한 세율표라도 과세 **연결점**이 다를 수 있습니다.

<p class="post-section-heading">2. 일본 측 출발점</p>
국세청 계열 영문 자료는 [NTA](https://www.nta.go.jp/english/)에서, 개별 판정은 반드시 세무사·税理士와 확인해야 합니다.

<p class="post-section-heading">3. 한국 측 출발점</p>
국세청 영문 포털은 [NTS](https://www.nts.go.kr/eng.do)를 참고하되, 본 글은 법률 자문이 아닙니다.

<p class="post-section-heading">4. 실무에서 빈번한 착시</p>
“현금은 과세가 없다”는 식의 단정, **외환 신고·부동산 등기** 절차 생략, 증여를 분할해 보이는 패턴 등은 모두 리스크를 키울 수 있습니다.

<p class="post-section-heading">5. 맺으며</p>
한일 자산 이전은 가족·기업 승계에서 가장 비싼 실수가 나오는 영역입니다. 반드시 공인 전문가와 1차 자료를 대조하십시오.`,
      en: `<p class="post-section-heading">1. Three axes: residency, situs, jurisdiction</p>
Inheritance and gifts tangle **decedent/donee residency**, **asset location**, and **treaty rules**. Similar rate tables can connect differently.

<p class="post-section-heading">2. Japan starting point</p>
Use [NTA English](https://www.nta.go.jp/english/) as a portal; confirm facts with a licensed tax accountant.

<p class="post-section-heading">3. Korea starting point</p>
Use [NTS English](https://www.nts.go.kr/eng.do); this article is not legal advice.

<p class="post-section-heading">4. Common illusions</p>
Assuming cash has “no tax event,” skipping **registration/FX reporting**, or structuring gifts to “look smaller” can amplify risk.

<p class="post-section-heading">5. Closing</p>
Cross-border succession is where expensive mistakes cluster—verify with professionals.`,
      ja: `<p class="post-section-heading">1. 三軸：居住・所在・管轄</p>
相続・贈与は**被相続者・受贈者の居住**、**資産の所在地**、**条約と各国ルール**が絡みます。税率表が似ていても接続点は異なり得ます。

<p class="post-section-heading">2. 日本の出発点</p>
[NTA英語](https://www.nta.go.jp/english/)が入口、個別判断は税理士へ。

<p class="post-section-heading">3. 韓国の出発点</p>
[NTS英語](https://www.nts.go.kr/eng.do)を参照。本稿はアドバイスではありません。

<p class="post-section-heading">4. よくある錯覚</p>
現金は非課税と決めつける、**登記・外為報告**を飛ばす、贈与を分割して見せる、などはリスクを増やします。

<p class="post-section-heading">5. おわりに</p>
国境を跨ぐ承継は高コストの誤りが出やすい領域です。専門家と一次資料で照合を。`,
    },
  },
  {
    slug: "japan-visa-paths-permanent-business-manager-asset-holders",
    category: "investment",
    date: "2026-04-22T01:00:00Z",
    sources: ["https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00147.html", "https://www.isa.go.jp/en/index.html"],
    tags: { ko: ["비자", "영주", "경영", "일본"], en: ["Visa", "PR", "Business manager", "Japan"], ja: ["ビザ", "永住", "経営管理", "日本"] },
    title: { ko: "일본 영주·경영관리 비자, 자산가 관점의 경로 비교(개관)", en: "Japan PR and Business Manager Visa: A High-Level Map for Asset Holders", ja: "日本の永住・経営管理ビザ：資産家視点のざっくり地図" },
    desc: { ko: "입국·재류는 법무성·출입국 당국 공개 정보에 따르며, 자산 규모와 무관하게 개별 심사 요소가 지배적임을 분명히 합니다.", en: "Residence status follows MOJ/Immigration publications—case facts dominate, regardless of balance-sheet size.", ja: "在留は法務省・出入国の公表に従い、資産額より個別事情が支配することを明確にします。" },
    body: {
      ko: `<p class="post-section-heading">1. 자산 규모는 ‘자격’이 아니다</p>
일본의 재류 자격은 **사업 실체·지속성·컴플라이언스** 같은 요소가 중심입니다. “얼마를 가지고 있으니 통과” 식의 공식은 없습니다.

<p class="post-section-heading">2. 공식 정보는 MOJ/Immigration</p>
절차 개요는 [法務省入管](https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00147.html) 및 [出入国在留庁英語](https://www.isa.go.jp/en/index.html)를 우선 확인합니다.

<p class="post-section-heading">3. 경영관리 루트를 볼 때</p>
사업 계획·고용·세무·거래 투명성이 함께 평가됩니다. 부동산 임대만으로 충분한지 여부는 **개별 사건**입니다.

<p class="post-section-heading">4. 영주(永住)를 볼 때</p>
재류 기간·납세·사회 통합 요소 등 넓은 체크리스트가 있습니다. 공개 기준과 개인 기록을 **행정서사·専門家**와 대조해야 합니다.

<p class="post-section-heading">5. 맺으며</p>
본 글은 절차 안내가 아닙니다. 최신 법령과 개별 상담을 우선하십시오.`,
      en: `<p class="post-section-heading">1. Balance-sheet size is not a visa</p>
Status of residence hinges on **business substance, sustainability, and compliance**—not net worth shortcuts.

<p class="post-section-heading">2. Start at MOJ/Immigration</p>
See [MOJ ISA procedures](https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00147.html) and [Immigration Services Agency (EN)](https://www.isa.go.jp/en/index.html).

<p class="post-section-heading">3. Business Manager route</p>
Plans, hiring, tax compliance, and transparency matter. Whether rent-only operations suffice is **case-specific**.

<p class="post-section-heading">4. Permanent residence</p>
Long checklists on stay length, tax, and integration—verify with **licensed immigration counsel**.

<p class="post-section-heading">5. Closing</p>
Not procedural advice; follow current law and counsel.`,
      ja: `<p class="post-section-heading">1. 資産額はビザではない</p>
在留資格の中心は**事業実体・継続性・コンプライアンス**で、純資産ショートカットはありません。

<p class="post-section-heading">2. 法務省・出入国が起点</p>
[法務省手続](https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00147.html)と[出入国英語](https://www.isa.go.jp/en/index.html)を先に。

<p class="post-section-heading">3. 経営管理ルート</p>
計画・雇用・税務・透明性が評価されます。賃貸のみで足りるかは**個案**です。

<p class="post-section-heading">4. 永住</p>
滞在年数・納税・統合など広いチェックリスト—**専門家**と照合を。

<p class="post-section-heading">5. おわりに</p>
手続案内ではありません。最新法令と相談を優先してください。`,
    },
  },
  {
    slug: "japan-corporate-vs-personal-rental-after-tax-sketch",
    category: "investment",
    date: "2026-04-22T02:30:00Z",
    sources: ["https://www.nta.go.jp/english/", "https://www.mlit.go.jp/en/"],
    tags: { ko: ["법인", "개인", "임대", "세금"], en: ["Corporate", "Personal", "Rental", "Tax"], ja: ["法人", "個人", "賃貸", "税金"] },
    title: { ko: "일본 법인 vs 개인 부동산 임대: 세후 수익률 스케치(개관)", en: "Japan Corporate vs Personal Rental Ownership: A After-Tax Sketch", ja: "日本：法人と個人の賃貸保有—税後イメージのスケッチ" },
    desc: { ko: "법인세·소득세·인보이스·경비 인정이라는 네 레이어를 나열하고, 왜 모델링이 없으면 결론이 불가능한지 설명합니다.", en: "Lay corporate tax, income tax, invoicing, and deductible expense layers—why modeling is mandatory.", ja: "法人税・所得税・インボイス・経費認識の四層を並べ、モデルなしに結論が出ない理由を説明します。" },
    body: {
      ko: `<p class="post-section-heading">1. 구조가 다르면 세계가 다르다</p>
법인은 **사업所得·법인세·배당·사회보험** 레이어가 얽히고, 개인은 **不動産所得・総合課税**의 다른 공제와 충돌할 수 있습니다.

<p class="post-section-heading">2. 경비·인보이스</p>
적격 청구서 저장 방식과 경비 인정 범위는 현금흐름에 직접 영향을 줍니다. [NTA](https://www.nta.go.jp/english/) 영문 자료가 개념 정리에 도움이 됩니다.

<p class="post-section-heading">3. 자산 규모와 Exit</p>
매각 시 **양도세·정리비용**이 법인·개인에 따라 달라질 수 있습니다. [MLIT](https://www.mlit.go.jp/en/)는 거래 제도의 큰 틀을 제공합니다.

<p class="post-section-heading">4. 모델링 없이는 답이 없다</p>
같은 임대료라도 **금리·상환·배당 정책·재투자**에 따라 법인/개인 우위가 바뀝니다.

<p class="post-section-heading">5. 맺으며</p>
세무사·税理士와 표 모델을 만든 뒤 결정하십시오. 본 글은 정보 소개입니다.`,
      en: `<p class="post-section-heading">1. Structure changes the tax world</p>
Corporates stack **business income, corporate tax, dividends, social charges**; individuals face different **real-estate income** integration.

<p class="post-section-heading">2. Invoicing and expenses</p>
Qualified invoice rules and deductibility hit cash flow—see [NTA English](https://www.nta.go.jp/english/).

<p class="post-section-heading">3. Size and exit</p>
Disposal taxes and wind-up costs can diverge by wrapper. [MLIT](https://www.mlit.go.jp/en/) frames transaction rules.

<p class="post-section-heading">4. No model, no answer</p>
Same rent can favor different wrappers depending on **rates, amortization, dividend policy, reinvestment**.

<p class="post-section-heading">5. Closing</p>
Build spreadsheets with CPAs on both sides; this is not advice.`,
      ja: `<p class="post-section-heading">1. 構造で税の世界が変わる</p>
法人は**事業所得・法人税・配当・社保**、個人は**不動産所得の総合課税**と異なる層があります。

<p class="post-section-heading">2. インボイスと経費</p>
適格請求書と認識範囲がCFに直撃します。[NTA英語](https://www.nta.go.jp/english/)が概念整理に役立ちます。

<p class="post-section-heading">3. 規模とExit</p>
譲渡・清算コストは枠組みで変わり得ます。[MLIT](https://www.mlit.go.jp/en/)が取引制度の枠です。

<p class="post-section-heading">4. モデルなき答えなし</p>
同じ賃料でも**金利・償却・配当・再投資**で優劣が入れ替わります。

<p class="post-section-heading">5. おわりに</p>
日韓の税理士と表を作ってから判断を。本稿は紹介にすぎません。`,
    },
  },
  // Life C1–C5
  {
    slug: "nihonbashi-hamacho-walking-guide",
    category: "life",
    date: "2026-04-23T01:00:00Z",
    sources: ["https://www.jnto.go.jp/eng/", "https://www.metro.tokyo.lg.jp/english/"],
    tags: { ko: ["니혼바시", "하마초", "산책", "도쿄"], en: ["Nihonbashi", "Hamacho", "Walking", "Tokyo"], ja: ["日本橋", "浜町", "散歩", "東京"] },
    title: { ko: "니혼바시 하마초, 동네 산책 가이드: 카페·서점·다리", en: "Nihonbashi Hamacho Walking Notes: Cafés, Bookstores, Bridges", ja: "日本橋浜町ウォーキングノート：カフェ・書店・橋" },
    desc: { ko: "거주자 시선으로 하마초에서 니혼바시 코어까지 이어지는 보행 동선과 쉬어갈 지점을 정리한 짧은 로컬 리포트입니다.", en: "A resident’s short walking map from Hamacho toward the Nihonbashi core—where to pause and what to notice.", ja: "浜町から日本橋コアへ歩く短い地図—休憩点と見どころ。" },
    body: {
      ko: `<p class="post-section-heading">1. 물가와 책 냄새 사이</p>
하마초는 스카이라인보다 **물결 소리와 보행 속도**가 먼저 느껴지는 동네입니다. 아침에는 다리 위 통행이 잦고, 점심 무렵에는 작은 카페 앞에 짧은 줄이 생깁니다.

<p class="post-section-heading">2. 산책 동선 제안</p>
강변 쪽 보행로에서 니혼바시 방향으로 올라오며 **상점街 아치**를 통과하는 코스는 동선과 역사를 동시에 보여 줍니다. 급하지 않을수록 간판 디테일이 보입니다.

<p class="post-section-heading">3. 서점·잡화</p>
대형 체인보다 **편집 서점·잡화**가 여행자에게는 기억에 남는 경우가 많습니다. 지역 상권과 연결된 곳을 고르는 편이 재방문 이유가 됩니다.

<p class="post-section-heading">4. 참고</p>
관광 개요는 [JNTO](https://www.jnto.go.jp/eng/), 광역 정보는 [東京都英語](https://www.metro.tokyo.lg.jp/english/)를 참고합니다.

<p class="post-section-heading">5. 맺으며</p>
개인적인 산책 메모입니다. 영업 시간·휴무는 현지 확인이 필요합니다.`,
      en: `<p class="post-section-heading">1. Between water and paper</p>
Hamacho reads first through **footsteps and river sound** more than skyline. Mornings bring bridge traffic; lunch brings café queues.

<p class="post-section-heading">2. A walking line</p>
Riverside to Nihonbashi via **arcaded shopping** mixes history with circulation—slow down to read signage.

<p class="post-section-heading">3. Bookstores and miscellany</p>
Curated shops often beat big chains for memory. Pick places tied to the local economy.

<p class="post-section-heading">4. References</p>
See [JNTO](https://www.jnto.go.jp/eng/) and [TMG English](https://www.metro.tokyo.lg.jp/english/).

<p class="post-section-heading">5. Closing</p>
Personal notes—verify hours locally.`,
      ja: `<p class="post-section-heading">1. 水辺と紙のあいだ</p>
浜町はスカイラインより**足音と水音**が先に立つ町です。朝は橋の交通、昼は小さなカフェの列。

<p class="post-section-heading">2. 歩き線</p>
水辺から**アーケード**を抜け日本橋へ。看板の細部はゆっくり。

<p class="post-section-heading">3. 書店・雑貨</p>
編集型の店が記憶に残りやすい。地域商圏とつながる店を。

<p class="post-section-heading">4. 参照</p>
[JNTO](https://www.jnto.go.jp/eng/)と[東京都英語](https://www.metro.tokyo.lg.jp/english/)。

<p class="post-section-heading">5. おわりに</p>
個人的メモ。営業時間は要確認。`,
    },
  },
  {
    slug: "tsukiji-to-toyosu-morning-tokyo",
    category: "life",
    date: "2026-04-23T02:30:00Z",
    sources: ["https://www.metro.tokyo.lg.jp/english/", "https://www.jnto.go.jp/eng/"],
    tags: { ko: ["츠키지", "토요스", "도쿄", "라이프"], en: ["Tsukiji", "Toyosu", "Tokyo", "Life"], ja: ["築地", "豊洲", "東京", "ライフ"] },
    title: { ko: "츠키지에서 토요스로: 이전이 바꾼 도쿄의 아침", en: "From Tsukiji to Toyosu: How the Move Reshaped Tokyo Mornings", ja: "築地から豊洲へ：移転が変えた東京の朝" },
    desc: { ko: "도매 기능 이전 이후에도 남은 외곽 상권과 토요스의 물류·관광 동선이 어떻게 갈렸는지 거주자 관찰로 정리합니다.", en: "How wholesale relocation split logistics and tourism flows while outer Tsukiji retail kept a different rhythm.", ja: "卸機能移転後も残る外縁商圏と豊洲の物流・観光動線の分岐を居住者目線で。" },
    body: {
      ko: `<p class="post-section-heading">1. ‘시장’은 한 지점이 아니다</p>
도매의 중심이 이동했다고 해서 **아침의 수요**가 한 번에 따라가지는 않습니다. 외국인 관광 동선과 도매 상인 동선은 서로 다른 시간표를 가집니다.

<p class="post-section-heading">2. 토요스의 아침</p>
시설·주차·물류 접근이 **차량 중심**으로 최적화된 면이 있습니다. 보행 관광과는 다른 설계 철학입니다.

<p class="post-section-heading">3. 츠키지 외곽</p>
소매·식당 밀도가 여전히 높은 구간은 **거리의 기억**이 상권을 지탱합니다. 재개발과 함께 점진적으로 변합니다.

<p class="post-section-heading">4. 참고</p>
[東京都英語](https://www.metro.tokyo.lg.jp/english/)와 [JNTO](https://www.jnto.go.jp/eng/)를 병행합니다.

<p class="post-section-heading">5. 맺으며</p>
사실 관계는 시점별로 변합니다. 방문 전 공지를 확인하십시오.`,
      en: `<p class="post-section-heading">1. A market is not one pin on the map</p>
Wholesale centers moved, but **morning demand** did not move as a single block. Tourist hours and merchant hours differ.

<p class="post-section-heading">2. Toyosu mornings</p>
Logistics and parking favor **vehicle-first** optimization—different from stroll tourism.

<p class="post-section-heading">3. Tsukiji outer streets</p>
Retail density still carries **street memory**; redevelopment shifts it gradually.

<p class="post-section-heading">4. References</p>
Pair [TMG English](https://www.metro.tokyo.lg.jp/english/) with [JNTO](https://www.jnto.go.jp/eng/).

<p class="post-section-heading">5. Closing</p>
Facts change—check notices before visits.`,
      ja: `<p class="post-section-heading">1. 「市場」は一点ではない</p>
卸の中心が動いても**朝の需要**は一塊で移動しません。観光と商人の時間割は別です。

<p class="post-section-heading">2. 豊洲の朝</p>
物流・駐車は**車優先**の設計思想。散歩観光とは異なります。

<p class="post-section-heading">3. 築地外縁</p>
小売密度は**街の記憶**で支えられ、再開発で少しずつ変わる。

<p class="post-section-heading">4. 参照</p>
[東京都英語](https://www.metro.tokyo.lg.jp/english/)と[JNTO](https://www.jnto.go.jp/eng/)。

<p class="post-section-heading">5. おわりに</p>
事情は変化します。訪問前に要確認。`,
    },
  },
  {
    slug: "ginza-marunouchi-walk-dna",
    category: "life",
    date: "2026-04-24T01:00:00Z",
    sources: ["https://www.jnto.go.jp/eng/", "https://www.jreast.co.jp/e/"],
    tags: { ko: ["긴자", "마루노우치", "도쿄", "산책"], en: ["Ginza", "Marunouchi", "Tokyo", "Walk"], ja: ["銀座", "丸の内", "東京", "散歩"] },
    title: { ko: "긴자와 마루노우치의 경계: 걸어서 비교하는 두 거리의 DNA", en: "Ginza vs Marunouchi: Walking the Boundary of Two DNAs", ja: "銀座と丸の内：歩いて比べる二つのDNA" },
    desc: { ko: "백화점과 오피스 타워의 비율, 보행 네트워크, 야간 조명까지 묶어 두 거리의 ‘사용 설명서’를 비교합니다.", en: "Compare department-store gravity, office towers, pedestrian grids, and night lighting as two instruction manuals.", ja: "百貨・オフィスの比率、歩行者網、夜景までを二つの取説として比較。" },
    body: {
      ko: `<p class="post-section-heading">1. 긴자의 중력</p>
백화점·플래그십이 **보행 속도를 늦추는** 중력을 만듭니다. 주말の歩行者天国は 그 중력이 가장 드러나는 순간입니다.

<p class="post-section-heading">2. 마루노우치의 중력</p>
역 앞 오피스와 라운지형 로비가 **평일 낮**의 리듬을 지배합니다. 식사 시간대에 유동 인구가 급변합니다.

<p class="post-section-heading">3. 경계를 걷기</p>
두 중력 사이를 직선으로 잇는 루트를 걸으면 **브랜드 밀도**와 **창고·백사이드 동선**의 대비가 보입니다.

<p class="post-section-heading">4. 참고</p>
[JNTO](https://www.jnto.go.jp/eng/)와 역 구역 정보 [JR East](https://www.jreast.co.jp/e/)를 활용합니다.

<p class="post-section-heading">5. 맺으며</p>
주관적 산책 메모입니다.`,
      en: `<p class="post-section-heading">1. Ginza gravity</p>
Flagships and department stores **slow pedestrian pace**. Pedestrian paradises on weekends make it visible.

<p class="post-section-heading">2. Marunouchi gravity</p>
Station-front offices and lounge lobbies dominate **weekday lunch** flows.

<p class="post-section-heading">3. Walk the seam</p>
Straight lines across the boundary reveal contrasts in **brand density** and back-of-house grids.

<p class="post-section-heading">4. References</p>
[JNTO](https://www.jnto.go.jp/eng/) plus [JR East](https://www.jreast.co.jp/e/) station maps.

<p class="post-section-heading">5. Closing</p>
Subjective walking notes.`,
      ja: `<p class="post-section-heading">1. 銀座の重力</p>
旗艦と百貨が歩幅を**遅くする**。週末の歩行者天国で顕在化します。

<p class="post-section-heading">2. 丸の内の重力</p>
駅前オフィスとラウンジ型ロビーが**平日昼**を支配。

<p class="post-section-heading">3. 境界を歩く</p>
直線で縫うと**ブランド密度**と裏動線の対比が見えます。

<p class="post-section-heading">4. 参照</p>
[JNTO](https://www.jnto.go.jp/eng/)と[JR東日本](https://www.jreast.co.jp/e/)。

<p class="post-section-heading">5. おわりに</p>
主観的ウォーキングメモ。`,
    },
  },
  {
    slug: "tokyo-korean-community-beyond-shinokubo",
    category: "life",
    date: "2026-04-24T02:30:00Z",
    sources: ["https://www.metro.tokyo.lg.jp/english/", "https://www.mofa.go.jp/"],
    tags: { ko: ["신오쿠보", "한국", "도쿄", "커뮤니티"], en: ["Shin-Okubo", "Korean", "Tokyo", "Community"], ja: ["新大久保", "韓国", "東京", "コミュニティ"] },
    title: { ko: "도쿄의 한국 커뮤니티: 신오쿠보 이후의 지도", en: "Korean Community in Tokyo: A Map Beyond Shin-Okubo", ja: "東京の韓国コミュニティ：新大久保の先の地図" },
    desc: { ko: "상권 중심 서술을 넘어, 거주·업무·문화가 흩어진 노드를 가리키는 개관 글입니다.", en: "Beyond restaurant rows: where living, work, and culture nodes spread across the metro area.", ja: "飲食街の語りを超え、居住・仕事・文化の結節点を示す概観。" },
    body: {
      ko: `<p class="post-section-heading">1. 한 장의 거리에 담기지 않는다</p>
신오쿠보는 상징적이지만, 실제 **거주·교육·창업** 노드는 광역으로 분산되어 있습니다.

<p class="post-section-heading">2. 광역 도쿄의 봉합부</p>
재택·하이브리드 업무가 늘면서 **주거 선택**이 노선보다 생활권 중심으로 이동하는 경향이 있습니다.

<p class="post-section-heading">3. 제도·행정 정보</p>
[東京都英語](https://www.metro.tokyo.lg.jp/english/)와 외무성 [MOFA](https://www.mofa.go.jp/)의 일반 자료를 기본으로 삼습니다.

<p class="post-section-heading">4. 맺으며</p>
개인 관찰이며 특정 단체를 대표하지 않습니다.`,
      en: `<p class="post-section-heading">1. Not one street</p>
Shin-Okubo is symbolic, but **living, schools, and startups** scatter across the metro.

<p class="post-section-heading">2. Metro seams</p>
Hybrid work nudges housing toward **life basins** more than single train lines.

<p class="post-section-heading">3. Official info</p>
Use [TMG English](https://www.metro.tokyo.lg.jp/english/) and [MOFA](https://www.mofa.go.jp/) primers.

<p class="post-section-heading">4. Closing</p>
Personal observation—not representative of any organization.`,
      ja: `<p class="post-section-heading">1. 一本の通りに収まらない</p>
新大久保は象徴だが**居住・教育・起業**の結節点は広域に散らばる。

<p class="post-section-heading">2. 首都圏の継ぎ目</p>
ハイブリッド勤務で住居は**生活圏**基準へ寄る傾向。

<p class="post-section-heading">3. 公的情報</p>
[東京都英語](https://www.metro.tokyo.lg.jp/english/)と[外務省](https://www.mofa.go.jp/)。

<p class="post-section-heading">4. おわりに</p>
個人的観察にすぎず特定団体を代表しません。`,
    },
  },
  {
    slug: "tokyo-museums-with-kids-five-picks",
    category: "life",
    date: "2026-04-25T01:00:00Z",
    sources: ["https://www.jnto.go.jp/eng/", "https://www.bunka.nii.ac.jp/heritage"],
    tags: { ko: ["박물관", "아이", "도쿄", "가족"], en: ["Museums", "Kids", "Tokyo", "Family"], ja: ["博物館", "子ども", "東京", "家族"] },
    title: { ko: "아이와 함께하는 도쿄 박물관 5곳 (실거주자의 평가)", en: "Five Tokyo Museums with Kids—A Resident’s Quick Take", ja: "子どもと行く東京の博物館5つ——居住者の短文評" },
    desc: { ko: "휴관일·예약·체류 시간을 중심으로 ‘부모의 피로도’를 기준에 넣은 비공식 리스트입니다.", en: "An informal list scoring fatigue, hours, and booking friction—not academic rankings.", ja: "休館・予約・滞在時間と「親の疲労」をスコアにした非公式リスト。" },
    body: {
      ko: `<p class="post-section-heading">1. 선정 기준</p>
학술 완성도보다 **이동·휴식·식사 접근**이 목록을 지배합니다.

<p class="post-section-heading">2. 다섯 가지 유형</p>
과학·미술·역사·산업·디지털 체험형을 한 곳씩 섞어 **주말 반나절** 단위로 계획하기 쉽게 했습니다.

<p class="post-section-heading">3. 참고</p>
관광 개요는 [JNTO](https://www.jnto.go.jp/eng/), 문화 유산 맥락은 [文化遺産オンライン](https://www.bunka.nii.ac.jp/heritage)이 도움이 됩니다.

<p class="post-section-heading">4. 맺으며</p>
영업 정보는 변동됩니다. 방문 전에 각관 사이트를 확인하십시오.`,
      en: `<p class="post-section-heading">1. Selection bias</p>
Parent fatigue, food access, and rest matter more than academic prestige.

<p class="post-section-heading">2. Five archetypes</p>
Mix science, art, history, industry, and digital interactives for **half-day** weekends.

<p class="post-section-heading">3. References</p>
[JNTO](https://www.jnto.go.jp/eng/) plus [heritage context](https://www.bunka.nii.ac.jp/heritage).

<p class="post-section-heading">4. Closing</p>
Hours change—verify museum sites.`,
      ja: `<p class="post-section-heading">1. 選定の偏り</p>
学術より**移動・休憩・食事**が親の疲労を決める。

<p class="post-section-heading">2. 五つの型</p>
科学・美術・歴史・産業・デジタル体験を半日単位に。

<p class="post-section-heading">3. 参照</p>
[JNTO](https://www.jnto.go.jp/eng/)と[文化遺産オンライン](https://www.bunka.nii.ac.jp/heritage)。

<p class="post-section-heading">4. おわりに</p>
開館情報は要確認。`,
    },
  },
  // Essay D1–D5
  {
    slug: "why-warm-investing-holds",
    category: "essay",
    date: "2026-04-26T01:00:00Z",
    sources: ["https://www.gsfark.com/", "https://www.jnto.go.jp/eng/"],
    tags: { ko: ["에세이", "투자", "철학"], en: ["Essay", "Investing", "Philosophy"], ja: ["エッセイ", "投資", "哲学"] },
    title: { ko: "왜 '따뜻한 투자'라는 말을 붙잡는가", en: "Why I Keep Saying “Warm Investing”", ja: "なぜ「温かい投資」という言葉を手放さないか" },
    desc: { ko: "숫자의 냉기와 사람의 온도 사이에서 균형을 잡으려는 개인적 선언에 가까운 짧은 글입니다.", en: "A short personal note on balancing cold numbers with human-scale warmth.", ja: "冷たい数字と人の温度のあいだを探る短文。" },
    body: {
      ko: `<p class="post-section-heading">1. 차가운 표의 필요</p>
투자에는 손익계산서와 금리가 필요합니다. 감정만으로는 버티기 어렵습니다.

<p class="post-section-heading">2. 그러나 표 뒤의 사람</p>
임대인과 임차인, 시공사와 이웃, 세입자의 출퇴근 동선은 **표 밖**에 있습니다.

<p class="post-section-heading">3. 따뜻함의 의미</p>
연민과 봉사만을 말하는 것이 아니라, **장기적 신뢰**를 자산의 일부로 인정하는 태도입니다.

<p class="post-section-heading">4. 맺으며</p>
Blog 브랜드 [GSF](https://www.gsfark.com/)의 출발점이기도 합니다. 여행 영감은 [JNTO](https://www.jnto.go.jp/eng/)를 종종 읽습니다.`,
      en: `<p class="post-section-heading">1. Cold tables help</p>
P&Ls and rates keep you honest—emotion alone is fragile.

<p class="post-section-heading">2. People behind rows</p>
Landlords, tenants, builders, and neighbors live **off spreadsheet**.

<p class="post-section-heading">3. What warmth means</p>
Not mere kindness—treating **long-term trust** as part of the asset.

<p class="post-section-heading">4. Closing</p>
Also the ethos of [GSF](https://www.gsfark.com/); I read [JNTO](https://www.jnto.go.jp/eng/) for travel context.`,
      ja: `<p class="post-section-heading">1. 冷たい表が要る</p>
損益と金利は正直さを保つために必要。

<p class="post-section-heading">2. 行の外の人</p>
貸主・借主・施工・近隣は**表の外**にいる。

<p class="post-section-heading">3. 温かさの意味</p>
善意だけでなく**長期の信頼**を資産の一部と見なす態度。

<p class="post-section-heading">4. おわりに</p>
[GSF](https://www.gsfark.com/)の気質。[JNTO](https://www.jnto.go.jp/eng/)は旅の文脈取りに。`,
    },
  },
  {
    slug: "tokyo-moving-contracts-two-notes",
    category: "essay",
    date: "2026-04-26T02:30:00Z",
    sources: ["https://www.mlit.go.jp/en/", "https://www.metro.tokyo.lg.jp/english/"],
    tags: { ko: ["이사", "계약", "도쿄", "에세이"], en: ["Moving", "Contracts", "Tokyo", "Essay"], ja: ["引越し", "契約", "東京", "エッセイ"] },
    title: { ko: "이사와 계약: 도쿄에서 부동산 절차를 겪어본 두 번의 기록", en: "Moving and Contracts: Two Rounds of Tokyo Rental Paperwork", ja: "引越しと契約：東京の賃貸手続きを二度踏んだ記録" },
    desc: { ko: "보증·연립 보험·해지 통지 기한처럼 ‘사소하지만 비싼’ 조항만 추려 기록합니다.", en: "Only the small, expensive clauses—guarantors, insurance, notice windows.", ja: "保証・保険・解約通知のような「小さくて高い」条項だけ拾う。" },
    body: {
      ko: `<p class="post-section-heading">1. 첫 번째 실수에서 배운 것</p>
서류 언어가 익숙하지 않을수록 **해지·갱신** 조항을 먼저 읽어야 합니다.

<p class="post-section-heading">2. 두 번째 이사에서 달라진 것</p>
사진·계량기·원본 계약의 **디지털 백업**을 습관화했습니다.

<p class="post-section-heading">3. 공식 정보</p>
[MLIT](https://www.mlit.go.jp/en/)와 [東京都英語](https://www.metro.tokyo.lg.jp/english/)가 개념 정리에 도움이 됩니다.

<p class="post-section-heading">4. 맺으며</p>
법률 자문이 아닌 개인 경험입니다.`,
      en: `<p class="post-section-heading">1. First mistake</p>
When language is unfamiliar, read **termination/renewal** first.

<p class="post-section-heading">2. Second move</p>
Habitual **digital backups** of photos, meters, and contracts.

<p class="post-section-heading">3. Official primers</p>
[MLIT](https://www.mlit.go.jp/en/) and [TMG English](https://www.metro.tokyo.lg.jp/english/).

<p class="post-section-heading">4. Closing</p>
Experience, not legal advice.`,
      ja: `<p class="post-section-heading">1. 最初の失敗</p>
言語に不慣れなら**解約・更新**を先に。

<p class="post-section-heading">2. 二度目</p>
写真・メーター・契約の**デジタルバックアップ**を習慣に。

<p class="post-section-heading">3. 公的資料</p>
[MLIT](https://www.mlit.go.jp/en/)と[東京都英語](https://www.metro.tokyo.lg.jp/english/)。

<p class="post-section-heading">4. おわりに</p>
体験談にすぎず法的助言ではありません。`,
    },
  },
  {
    slug: "three-things-when-fx-shakes",
    category: "essay",
    date: "2026-04-27T01:00:00Z",
    sources: ["https://www.boj.or.jp/en/statistics/index.htm/", "https://www.imf.org/en/Home"],
    tags: { ko: ["환율", "투자", "에세이"], en: ["FX", "Investing", "Essay"], ja: ["為替", "投資", "エッセイ"] },
    title: { ko: "환율이 흔들릴 때 투자자가 해야 할 3가지", en: "Three Things Investors Do When FX Shakes", ja: "為替が揺れたとき投資家がやる三つのこと" },
    desc: { ko: "예측이 아니라 절차: 기록·유동성·전문가 호출을 반복하는 이유입니다.", en: "Not forecasts—process: log, liquidity, call experts.", ja: "予測ではなく手順：記録・流動性・専門家。" },
    body: {
      ko: `<p class="post-section-heading">1. 기록</p>
감정이 들쭉날쭉할수록 **날짜·환율·포지션**을 적습니다.

<p class="post-section-heading">2. 유동성</p>
급변 시 생존은 **현금 버퍼**가 결정합니다.

<p class="post-section-heading">3. 전문가</p>
세금·법률·파생은 혼자 추측하지 않습니다.

<p class="post-section-heading">4. 참고</p>
[BOJ](https://www.boj.or.jp/en/statistics/index.htm/), [IMF](https://www.imf.org/en/Home).`,
      en: `<p class="post-section-heading">1. Log</p>
When emotions spike, write **date, FX, exposure**.

<p class="post-section-heading">2. Liquidity</p>
Survival in shocks is often **cash buffers**.

<p class="post-section-heading">3. Experts</p>
Don’t solo tax/law/derivatives guesses.

<p class="post-section-heading">4. References</p>
[BOJ stats](https://www.boj.or.jp/en/statistics/index.htm/), [IMF](https://www.imf.org/en/Home).`,
      ja: `<p class="post-section-heading">1. 記録</p>
感情が荒れるほど**日付・為替・エクスポージャー**を書く。

<p class="post-section-heading">2. 流動性</p>
ショック生存は**現金バッファ**が決める。

<p class="post-section-heading">3. 専門家</p>
税・法・デリバティブを独り推測しない。

<p class="post-section-heading">4. 参照</p>
[日銀統計](https://www.boj.or.jp/en/statistics/index.htm/)、[IMF](https://www.imf.org/en/Home)。`,
    },
  },
  {
    slug: "reading-korea-japan-markets-together",
    category: "essay",
    date: "2026-04-27T02:30:00Z",
    sources: ["https://www.boj.or.jp/en/statistics/index.htm/", "https://www.bok.or.kr/eng/main/main.do"],
    tags: { ko: ["한국", "일본", "매크로", "에세이"], en: ["Korea", "Japan", "Macro", "Essay"], ja: ["韓国", "日本", "マクロ", "エッセイ"] },
    title: { ko: "한국과 일본, 두 시장을 동시에 읽는 법", en: "Reading Korea and Japan Together", ja: "韓国と日本を同時に読む" },
    desc: { ko: "금리·수출·인구의 세 줄기로만 거시를 묶어보는 연습 글입니다.", en: "Practice tying macro with rates, exports, and demographics—nothing fancy.", ja: "金利・輸出・人口の三筋でマクロを結ぶ練習。" },
    body: {
      ko: `<p class="post-section-heading">1. 금리의 시차</p>
[한국은행](https://www.bok.or.kr/eng/main/main.do)과 [일본은행](https://www.boj.or.jp/en/statistics/index.htm/)은 다른 제약을 안고 있습니다.

<p class="post-section-heading">2. 수출 구조</p>
반도체·자동차·중간재의 **공급망**이 두 나라를 잇습니다.

<p class="post-section-heading">3. 인구</p>
도시 집중과 지방 공동화가 **부동산·임금**에 다른 파장을 줍니다.

<p class="post-section-heading">4. 맺으며</p>
개인 학습 노트입니다.`,
      en: `<p class="post-section-heading">1. Rate lags</p>
[BOK](https://www.bok.or.kr/eng/main/main.do) and [BOJ](https://www.boj.or.jp/en/statistics/index.htm/) face different constraints.

<p class="post-section-heading">2. Export stack</p>
Chips, autos, and intermediates **link supply chains**.

<p class="post-section-heading">3. Demography</p>
Urban concentration vs regional hollowing hits **rents and wages** differently.

<p class="post-section-heading">4. Closing</p>
Study notes only.`,
      ja: `<p class="post-section-heading">1. 金利のタイムラグ</p>
[韓国銀行](https://www.bok.or.kr/eng/main/main.do)と[日銀](https://www.boj.or.jp/en/statistics/index.htm/)は制約が違う。

<p class="post-section-heading">2. 輸出スタック</p>
半導体・自動車・中間財が**サプライチェーン**を結ぶ。

<p class="post-section-heading">3. 人口</p>
都市集中と地方の空洞化が**賃金・賃料**に違う波。

<p class="post-section-heading">4. おわりに</p>
学習メモにすぎません。`,
    },
  },
  {
    slug: "one-failure-three-lessons-postmortem",
    category: "essay",
    date: "2026-04-28T01:00:00Z",
    sources: ["https://www.fsa.go.jp/en/", "https://www.imf.org/en/Home"],
    tags: { ko: ["실패", "교훈", "투자"], en: ["Failure", "Lessons", "Investing"], ja: ["失敗", "教訓", "投資"] },
    title: { ko: "실패한 한 건, 배운 세 가지: 투자 복기", en: "One Failed Trade, Three Lessons: A Postmortem", ja: "一度の失敗、三つの教訓：投資のポストモーテム" },
    desc: { ko: "특정 사건 세부는 생략하고, 절차·기록·리스크 한도만 남깁니다.", en: "Strip the drama—keep process, journaling, and risk limits.", ja: "ドラマを削ぎ、手順・記録・リミットだけ残す。" },
    body: {
      ko: `<p class="post-section-heading">1. 기록이 없으면 학습도 없다</p>
진입 근거가 **메모**로 남지 않으면 복기가 불가능합니다.

<p class="post-section-heading">2. 유동성은 보이지 않는 비용</p>
급매는 **가격**이 아니라 **시간**으로 지불합니다.

<p class="post-section-heading">3. 한도</p>
계좌·심리·시간 셋 모두에 **상한**을 둡니다.

<p class="post-section-heading">4. 참고</p>
규제 맥락은 [FSA](https://www.fsa.go.jp/en/), 거시는 [IMF](https://www.imf.org/en/Home).`,
      en: `<p class="post-section-heading">1. No journal, no lesson</p>
If entry thesis isn’t **written**, postmortems lie.

<p class="post-section-heading">2. Liquidity tax</p>
Fire-sales pay in **time**, not just price.

<p class="post-section-heading">3. Caps</p>
Account, mind, and calendar all need **limits**.

<p class="post-section-heading">4. References</p>
[FSA](https://www.fsa.go.jp/en/) for regulatory context; [IMF](https://www.imf.org/en/Home) for macro framing.`,
      ja: `<p class="post-section-heading">1. 記録なき学びなし</p>
エントリー論理を**書かなければ**ポストモーテムは嘘になる。

<p class="post-section-heading">2. 流動性の税</p>
急売は**時間**でも支払う。

<p class="post-section-heading">3. 上限</p>
口座・心理・時間に**キャップ**を。

<p class="post-section-heading">4. 参照</p>
[金融庁](https://www.fsa.go.jp/en/)、[IMF](https://www.imf.org/en/Home)。`,
    },
  },
];

function fm(lang, p) {
  const src = p.sources;
  const ref = src;
  return `---
title: "${p.title[lang]}"
description: "${p.desc[lang]}"
pubDatetime: ${p.date}
author: GSF
lang: ${lang}
category: ${p.category}
tags:
${p.tags[lang].map(t => `  - ${t}`).join("\n")}
sources:
${src.map(s => `  - "${s}"`).join("\n")}
references:
${ref.map(s => `  - "${s}"`).join("\n")}
---

${p.body[lang].trim()}
${disclaimer[lang]}
`;
}

for (const p of posts) {
  for (const lang of ["ko", "en", "ja"]) {
    const dir = path.join(blogRoot, lang);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${p.slug}.md`), fm(lang, p), "utf8");
  }
}

console.log("Wrote", posts.length * 3, "files (batch 2)");
