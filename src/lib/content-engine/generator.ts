import type { ParsedAuthorNotes } from "@/lib/author-notes/types";
import { disclaimerFor, softenHardClaims } from "@/lib/content-engine/rules";
import type { ResearchPack } from "@/lib/research-adapter/types";

export interface DraftBundle {
  koV1: string;
  koV2: string;
  en: string;
  ja: string;
}

export interface ClaimMapItem {
  claim: string;
  evidenceUrls: string[];
  uncertainty: string;
}

const KO_SECTION_HEADINGS = [
  "## 1) 문제 제기",
  "## 2) 핵심 사실/데이터",
  "## 3) 해석과 인사이트",
  "## 4) 실무적 시사점",
  "## 5) 결론",
] as const;

const KO_SECTION_MIN_CHARS: Record<(typeof KO_SECTION_HEADINGS)[number], number> = {
  "## 1) 문제 제기": 220,
  "## 2) 핵심 사실/데이터": 460,
  "## 3) 해석과 인사이트": 420,
  "## 4) 실무적 시사점": 300,
  "## 5) 결론": 180,
};

function normalizeKeyword(keyword: string) {
  const compact = keyword.replace(/\s+/g, " ").trim();
  if (!compact) return keyword;
  const tokens = compact.split(" ");
  const deduped: string[] = [];
  for (const token of tokens) {
    if (deduped.length === 0 || deduped[deduped.length - 1] !== token) {
      deduped.push(token);
    }
  }
  return deduped.join(" ");
}

function withObjectParticle(word: string) {
  const trimmed = word.trim();
  if (!trimmed) return word;
  const last = trimmed.charCodeAt(trimmed.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return `${trimmed}를`;
  const jong = (last - 0xac00) % 28;
  return `${trimmed}${jong === 0 ? "를" : "을"}`;
}

function cleanResearchTitle(rawTitle: string, keyword: string) {
  const base = normalizeKeyword(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return rawTitle.replace(new RegExp(`^${base}\\s*-\\s*`, "i"), "").trim();
}

function localizedExcerpt(excerpt?: string) {
  const raw = (excerpt ?? "").trim();
  if (!raw) return "관련 지표의 방향성과 구조 변화를 확인하는 데 유효합니다.";
  const koreanCount = (raw.match(/[가-힣]/g) ?? []).length;
  if (koreanCount < Math.max(8, Math.floor(raw.length * 0.2))) {
    return "거시 지표와 거래 구조를 교차 점검하는 데 유효한 보조 근거입니다.";
  }
  return raw;
}

function excerptToSentence(excerpt?: string) {
  const text = localizedExcerpt(excerpt).trim();
  if (!text) return "관련 신호를 확인할 수 있습니다.";
  if (/[.!?]$/.test(text)) return text;
  return `${text}.`;
}

function toFrontmatterBlock(
  title: string,
  description: string,
  tags: string[],
  sources: string[],
  references: string[]
) {
  const sourceLines = sources.map(url => `  - "${url}"`).join("\n");
  const referenceLines = references.map(url => `  - "${url}"`).join("\n");
  return `---
title: "${title}"
description: "${description}"
pubDatetime: ${new Date().toISOString()}
author: "GSF"
tags: [${tags.map(tag => `"${tag}"`).join(", ")}]
sources:
${sourceLines}
references:
${referenceLines}
---
`;
}

function summarizeResearch(pack: ResearchPack, limit = 6) {
  const picked = pack.items.slice(0, limit);
  if (picked.length === 0) {
    return "현재 확보된 공개 자료가 제한적이므로, 핵심 사실은 보수적으로 정리하며 추가 근거 확보가 필요합니다.";
  }
  return picked
    .map((item, idx) => {
      const sourceLabel =
        item.tier === "government"
          ? "정부"
          : item.tier === "public"
            ? "공공"
            : item.tier === "media"
              ? "언론"
              : "일반";
      const opener =
        idx === 0
          ? `우선 ${cleanResearchTitle(item.title, pack.keyword)} 자료(${item.domain}, ${sourceLabel})를 보면`
          : idx === 1
            ? `다음으로 ${cleanResearchTitle(item.title, pack.keyword)} 자료(${item.domain}, ${sourceLabel})에서는`
            : idx === 2
              ? `또한 ${cleanResearchTitle(item.title, pack.keyword)} 자료(${item.domain}, ${sourceLabel})를 통해`
              : `마지막으로 ${cleanResearchTitle(item.title, pack.keyword)} 자료(${item.domain}, ${sourceLabel})를 기준으로`;
      const bridges = [
        "이 대목에서 확인되는 핵심은 아래와 같습니다.",
        "실무적으로 읽히는 포인트를 정리하면 다음과 같습니다.",
        "의미 있는 변화 신호를 요약하면 다음과 같습니다.",
        "판단에 직접 연결되는 지점은 다음과 같습니다.",
      ] as const;
      const bridge = bridges[idx % bridges.length];
      return `${opener} ${bridge} ${excerptToSentence(item.excerpt)}`;
    })
    .join("\n\n");
}

export function buildClaimMap(pack: ResearchPack, limit = 5): ClaimMapItem[] {
  return pack.items.slice(0, limit).map((item, idx) => ({
    claim: `${idx + 1}. ${cleanResearchTitle(item.title, pack.keyword)}는 ${normalizeKeyword(pack.keyword)} 맥락에서 ${item.tier} 신뢰도 관점의 근거로 해석할 수 있습니다.`,
    evidenceUrls: [item.url, ...pack.sources.filter(url => url !== item.url).slice(0, 1)],
    uncertainty: item.excerpt
      ? `요약 근거는 존재하지만, ${item.excerpt.slice(0, 80)} 구간은 추가 원문 검증이 필요합니다.`
      : "요약 정보 기반 해석이므로 수치·기간 조건은 원문 재확인이 필요합니다.",
  }));
}

function makeKoTitle(keyword: string) {
  const normalized = normalizeKeyword(keyword).replace(/\s+/g, " ").trim();
  const core = normalized.replace(/(재개발)\s*$/u, "").trim();
  const base = core || normalized;
  return `${base} 재개발이 보여주는 도시형 투자·라이프스타일의 균형`;
}

function evidenceNarrative(pack: ResearchPack, limit = 5) {
  const picked = pack.items.slice(0, limit);
  if (picked.length === 0) {
    return "현재 확보된 공개 자료가 제한적이므로, 본문 해석은 보수적으로 접근하며 추가 검증이 필요합니다.";
  }
  const connectors = [
    "핵심 단서로 해석할 수 있습니다.",
    "실무 판단의 보조 근거로 활용할 수 있습니다.",
    "시장 흐름을 읽는 참고 신호로 볼 수 있습니다.",
  ] as const;
  const lines = picked.map(item => {
    const signal =
      item.tier === "government"
        ? "정책·제도 신호"
        : item.tier === "public"
          ? "공식 통계·거래 구조"
          : item.tier === "media"
            ? "시장 반응·산업 맥락"
            : "보조 시장 해설";
    const tail = connectors[Math.abs(item.domain.length + item.title.length) % connectors.length];
    return `${item.domain} 자료는 ${withObjectParticle(signal)} 확인하는 데 유효하며, "${cleanResearchTitle(item.title, pack.keyword)}"에서 ${excerptToSentence(item.excerpt)} 이는 ${tail}`;
  });
  return lines.join("\n\n");
}

function researchNarrative(pack: ResearchPack, limit = 8) {
  const picked = pack.items.slice(0, limit);
  if (picked.length === 0) {
    return "현재 확보된 공개 자료가 제한적이므로, 해석의 확정성을 낮추고 추가 검증이 필요합니다.";
  }
  const endings = [
    "이러한 흐름은 운영 전략의 정교화 필요성을 시사합니다.",
    "해당 신호는 단기 판단보다 중기 검증 프레임의 중요성을 보여줍니다.",
    "결과적으로 지표 해석에서 맥락 비교가 필수라는 점을 확인할 수 있습니다.",
  ] as const;
  return picked
    .map((item, idx) => {
      const excerpt =
        localizedExcerpt(item.excerpt) || "정책·수요·운영 변수의 상호작용을 보여주는 단서";
      const ending = endings[idx % endings.length];
      return `${cleanResearchTitle(item.title, pack.keyword)} 자료는 ${item.domain} 출처(${item.tier})로 확인되며, 핵심적으로 ${excerptToSentence(excerpt)} ${ending}`;
    })
    .join("\n\n");
}

function dataEvidenceExpansion(pack: ResearchPack) {
  const publicCount = pack.items.filter(item => item.tier === "public").length;
  const govCount = pack.items.filter(item => item.tier === "government").length;
  const mediaCount = pack.items.filter(item => item.tier === "media").length;
  const generalCount = pack.items.filter(item => item.tier === "general").length;
  const domains = Array.from(new Set(pack.items.map(item => item.domain))).slice(0, 6);
  return `추가로 자료군 구성을 보면, 공공 출처 ${publicCount}건, 정부 출처 ${govCount}건, 언론 출처 ${mediaCount}건, 일반 출처 ${generalCount}건으로 분포합니다.
이는 단일 시각이 아닌 다층적 관점에서 검토할 수 있는 최소 기반을 제공하며, 출처 다변성 측면에서도 의사결정 신뢰도를 높이는 요소로 작동할 수 있습니다.
실무적으로는 ${domains.join(", ")} 등 서로 성격이 다른 도메인의 데이터를 교차 확인해, 지표 해석의 편향을 줄이는 절차가 중요합니다.`;
}

function josephAugmentationParagraph(pack: ResearchPack) {
  return `현 시점에서 ${withObjectParticle(normalizeKeyword(pack.keyword))} 평가할 때 핵심은 '가격 수준' 자체보다 '지속 가능한 운영 조건'을 먼저 확인하는 것입니다.
특히 금리·정책·유동인구 구조가 동시에 변하는 구간에서는 단기 체감 수치만으로 결론을 내리기보다, 거래량 추세와 수요의 질적 변화를 함께 보아야 판단 오차를 줄일 수 있습니다.
따라서 본 주제는 단기 매수·매도 관점보다, 중기 운영 안정성과 리스크 관리 프레임으로 접근하는 것이 보다 합리적이며, 이는 부동산·투자·라이프스타일 축을 통합적으로 해석하는 데에도 유효합니다.`;
}

function koreanCharCount(text: string) {
  return (text.match(/[가-힣]/g) ?? []).length;
}

function splitSections(body: string) {
  const positions = KO_SECTION_HEADINGS.map(heading => ({
    heading,
    start: body.indexOf(heading),
  })).filter(item => item.start >= 0);
  if (positions.length === 0) {
    return [] as Array<{ heading: (typeof KO_SECTION_HEADINGS)[number]; content: string }>;
  }
  positions.sort((a, b) => a.start - b.start);
  return positions.map((item, idx) => {
    const end = idx + 1 < positions.length ? positions[idx + 1].start : body.length;
    const chunk = body.slice(item.start, end).trim();
    return { heading: item.heading, content: chunk };
  });
}

function sectionBooster(
  heading: (typeof KO_SECTION_HEADINGS)[number],
  keyword: string,
  pack?: ResearchPack
) {
  const domainSignal = pack
    ? pack.items
        .slice(0, 3)
        .map(item => `${item.domain}(${item.tier})`)
        .join(", ")
    : "다중 출처";
  if (heading === "## 1) 문제 제기") {
    return `${keyword}를 검토할 때 중요한 지점은 단일 이벤트의 강도보다 구조 변화의 지속성입니다. 현 시점에서는 과장된 확신보다 검증 가능한 신호를 중심으로 판단하는 접근이 더 유효합니다.`;
  }
  if (heading === "## 2) 핵심 사실/데이터") {
    return `특히 ${domainSignal} 자료를 교차 확인하면, 동일 현상을 서로 다른 관측 프레임에서 해석할 수 있어 판단 편향을 줄이는 데 도움이 됩니다. 수치와 서술 근거를 함께 관리하면 해석의 일관성도 높아집니다.`;
  }
  if (heading === "## 3) 해석과 인사이트") {
    return `이 지점에서 중요한 것은 결과 값 자체보다 결과가 형성되는 메커니즘입니다. 수요 구조, 운영 역량, 정책 환경이 동시에 움직일 때 어떤 변수가 선행 신호로 작동하는지를 구분하면 해석의 정밀도가 높아집니다.`;
  }
  if (heading === "## 4) 실무적 시사점") {
    return `실무적으로 보면 지표의 우선순위를 고정하고, 월 단위로 점검 주기를 일관되게 유지하는 것이 중요합니다. 체크리스트 기반 점검을 반복하면 단기 변동 구간에서도 판단 품질을 안정적으로 유지할 수 있습니다.`;
  }
  return `${keyword} 관점에서 결론은 확정적 예측이 아니라, 현 시점에서의 합리적 해석으로 정리하는 것이 타당합니다. 이후 신규 데이터가 축적되면 동일 프레임으로 재검증하는 방식이 바람직합니다.`;
}

function reinforceSectionDepth(body: string, keyword: string, pack?: ResearchPack) {
  let next = body;
  const sections = splitSections(next);
  for (const section of sections) {
    const minChars = KO_SECTION_MIN_CHARS[section.heading];
    const contentOnly = section.content.replace(section.heading, "").trim();
    if (koreanCharCount(contentOnly) >= minChars) continue;
    const boosted = `${section.content}\n${sectionBooster(section.heading, keyword, pack)}`;
    next = next.replace(section.content, boosted);
  }
  return next;
}

function reinforceJosephTone(body: string) {
  const endings = (body.match(/([가-힣]{2,}(다\.))/g) ?? []).length;
  if (endings <= 8) return body;
  const guide =
    "결론은 단정적 확신보다, 현 시점의 근거 기반 관찰을 중심으로 정리하는 편이 타당합니다.";
  if (body.includes(guide)) return body;
  if (body.includes("## 5) 결론")) {
    return body.replace("## 5) 결론", `## 5) 결론\n${guide}`);
  }
  return `${body}\n\n${guide}`;
}

function dedupeAdjacentParagraphs(body: string) {
  const blocks = body
    .split("\n\n")
    .map(block => block.trim())
    .filter(Boolean);
  const deduped: string[] = [];
  for (const block of blocks) {
    if (deduped.length === 0 || deduped[deduped.length - 1] !== block) {
      deduped.push(block);
    }
  }
  return deduped.join("\n\n");
}

function dedupeRepeatedParagraphs(body: string) {
  const blocks = body
    .split("\n\n")
    .map(block => block.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const block of blocks) {
    if (!seen.has(block)) {
      seen.add(block);
      kept.push(block);
    }
  }
  return kept.join("\n\n");
}

function cleanupAwkwardPhrases(body: string) {
  return body
    .replaceAll("입니다.라는 점", "입니다. 이 점은")
    .replaceAll("보조 시장 해설을 확인하는 데 유효하며", "보조 시장 해설로 참고할 수 있으며")
    .replaceAll("를 보여줍니다. 이 점은 이 점은", "를 보여줍니다. 이 점은")
    .replaceAll("재개발 재개발", "재개발");
}

function cleanupStructuralNoise(body: string) {
  let next = body;
  // Keep the conclusion focused on reader value, not generation metadata.
  next = next.replace(/^- 반영할 요소:.*$/gm, "");
  next = next.replace(/^- 피할 요소:.*$/gm, "");
  next = next.replace(/^- 문체 원칙:.*$/gm, "");
  next = next.replace(/\n{3,}/g, "\n\n");
  return next.trim();
}

function applyJosephToneCadence(body: string) {
  const replacements: Array<[RegExp, string]> = [
    [/본 초안은 정보 밀도와 가독성의 균형을 우선해 구성했습니다\./g, "핵심은 균형입니다. 정보 밀도와 가독성을 함께 고려해 정리했습니다."],
    [/따라서 본문은 단정적 결론을 제시하기보다, 독자가 즉시 활용할 수 있는 검증 가능한 근거 중심의 프레임을 제시하는 방식으로 전개합니다\./g, "이 지점에서 중요한 것은 단정이 아니라 검증 가능한 근거입니다. 독자가 바로 활용할 수 있도록 판단 프레임 중심으로 전개합니다."],
    [/실무적으로는 ([^\\n]+) 중요합니다\\./g, "실무적으로 보면 $1 중요합니다. 이 원칙을 고정하면 판단 오차를 줄일 수 있습니다."],
    [/결국 단기 수치의 변동보다, 운영 시나리오의 재현 가능성과 지표의 질적 개선이 지속되는지를 확인하는 체계가 필요합니다\\./g, "결론을 서두를 필요는 없습니다. 단기 변동보다 운영 시나리오의 재현 가능성과 지표의 질적 개선 흐름을 꾸준히 확인하는 체계가 필요합니다."],
    [/현 시점에서는 공격적 가정보다 근거 축적형 접근이 더 합리적이며, 후속 업데이트에서는 신규 근거를 반영해 판단 정확도를 단계적으로 높이겠습니다\\./g, "현 시점에서는 공격적 가정보다 근거 축적형 접근이 더 합리적입니다. 이후 신규 근거를 반영해 판단 정확도를 단계적으로 높이는 전략이 바람직합니다."],
  ];
  let next = body;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }
  // Reduce list-heavy feel in section 2 by softening bullet markers.
  next = next.replace(/## 2\) 핵심 사실\/데이터\s*\n((?:-\s.*\n?){2,8})/m, (_m, listBlock: string) => {
    const lines = listBlock
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => line.replace(/^-+\s*/, ""))
      .slice(0, 4);
    if (lines.length === 0) return "## 2) 핵심 사실/데이터\n";
    const merged = lines
      .map((line, idx) => {
        const lead =
          idx === 0 ? "우선" : idx === 1 ? "다음으로" : idx === 2 ? "또한" : "마지막으로";
        return `${lead} ${line} 자료를 확인할 수 있습니다.`;
      })
      .join(" ");
    return `## 2) 핵심 사실/데이터\n${merged}\n`;
  });
  return next;
}

function ensureSectionSkeleton(body: string, keyword: string) {
  let next = body.trim();
  for (const heading of KO_SECTION_HEADINGS) {
    if (!next.includes(heading)) {
      next += `\n\n${heading}\n${keyword} 관점에서 핵심 쟁점을 보수적으로 점검할 필요가 있습니다.`;
    }
  }
  return next;
}

function reinforceKeywordAlignment(body: string, keyword: string) {
  let next = body;
  if (!next.includes(`## 1) 문제 제기`)) return next;
  if (!next.includes(`## 5) 결론`)) return next;
  const introAnchor = "## 1) 문제 제기";
  const conclusionAnchor = "## 5) 결론";
  const introIdx = next.indexOf(introAnchor);
  const conclusionIdx = next.indexOf(conclusionAnchor);
  const introChunk = next.slice(introIdx, Math.max(introIdx, conclusionIdx));
  const conclusionChunk = next.slice(conclusionIdx);
  if (!introChunk.includes(keyword)) {
    next = next.replace(
      introAnchor,
      `${introAnchor}\n${keyword}의 중요성은 단기 이슈보다 구조적 변화 관점에서 이해할 필요가 있습니다.`
    );
  }
  if (!conclusionChunk.includes(keyword)) {
    next = next.replace(
      conclusionAnchor,
      `${conclusionAnchor}\n${keyword}를 기준으로 보면, 현 시점의 합리적 판단은 근거 축적형 접근에 가깝습니다.`
    );
  }
  return next;
}

function ensureDisclaimer(body: string) {
  return body;
}

function expandForTargetLength(body: string, pack?: ResearchPack, minKoreanChars = 1800) {
  const current = koreanCharCount(body);
  if (current >= minKoreanChars) return body;
  const support = pack
    ? `보완 관점에서 ${normalizeKeyword(pack.keyword)} 관련 출처를 교차하면, ${pack.items
        .slice(0, 3)
        .map(item => `${item.domain}(${item.tier})`)
        .join(", ")} 자료가 서로 다른 각도에서 신호를 제공합니다. 실무적으로는 단일 수치보다 추세와 맥락을 함께 확인하는 절차가 유효합니다.`
    : "보완 관점에서는 단일 수치보다 추세와 맥락을 함께 확인하는 절차가 필요합니다.";
  const gapParagraph = `${support}\n또한 의사결정 과정에서는 리스크 요인을 먼저 분리한 뒤, 실행 우선순위를 단계적으로 점검하는 방식이 안정적입니다.`;
  if (body.includes("## 4) 실무적 시사점")) {
    return body.replace("## 5) 결론", `${gapParagraph}\n\n## 5) 결론`);
  }
  return `${body}\n\n${gapParagraph}`;
}

export function polishKoBody(body: string, keyword: string, pack?: ResearchPack) {
  let next = ensureSectionSkeleton(body, keyword);
  next = reinforceKeywordAlignment(next, keyword);
  next = reinforceSectionDepth(next, keyword, pack);
  next = reinforceJosephTone(next);
  next = expandForTargetLength(next, pack);
  next = dedupeAdjacentParagraphs(next);
  next = dedupeRepeatedParagraphs(next);
  next = cleanupAwkwardPhrases(next);
  next = applyJosephToneCadence(next);
  next = dedupeAdjacentParagraphs(next);
  next = dedupeRepeatedParagraphs(next);
  next = cleanupStructuralNoise(next);
  next = ensureDisclaimer(next);
  return softenHardClaims(next.trim());
}

function buildKoBody(
  pack: ResearchPack,
  notes: ParsedAuthorNotes,
  version: "v1" | "v2",
  style: "balanced" | "concise" | "deep" = "balanced"
) {
  const extra = version === "v2" ? "추가 검색과 사용자 피드백을 반영해 근거 범위를 확장했습니다." : "";
  const include = notes.mustInclude.length > 0 ? notes.mustInclude.join(", ") : "사용자 메모 핵심 포인트";
  const avoid = notes.mustAvoid.length > 0 ? notes.mustAvoid.join(", ") : "과도한 단정 표현";
  const openingByStyle = {
    balanced: "본 초안은 정보 밀도와 가독성의 균형을 우선해 구성했습니다.",
    concise: "본 초안은 핵심만 빠르게 파악할 수 있도록 문단을 압축해 구성했습니다.",
    deep: "본 초안은 근거의 맥락과 해석 논리를 깊게 서술하는 방식으로 구성했습니다.",
  } as const;
  const executionByStyle = {
    balanced:
      "실무적으로는 핵심 지표를 우선순위화해 점검하고, 보조 지표는 월 단위 추세로 확인하는 접근이 적절합니다.",
    concise:
      "실무적으로는 지표 3개를 먼저 고정하고, 조건 변화가 생길 때만 추가 검토 범위를 넓히는 방식이 효율적입니다.",
    deep:
      "실무적으로는 수요·정책·운영 변수를 분리해 가설을 세우고, 분기 단위로 반증 데이터를 축적하는 절차가 필요합니다.",
  } as const;
  const base = `## 1) 문제 제기
${withObjectParticle(normalizeKeyword(pack.keyword))} 둘러싼 의사결정은 단기 화제성보다 구조적 수요, 정책 변화, 운영 역량을 함께 검토해야 한다는 점에서 중요합니다. ${extra}
${openingByStyle[style]} 특히 도심 복합자산은 건물의 물리적 완성도만으로 성과를 설명하기 어려우며, 반복 방문을 만드는 동선과 운영 구조가 실질 가치를 좌우하는 경우가 많습니다.
따라서 본문은 단정적 결론을 제시하기보다, 독자가 즉시 활용할 수 있는 검증 가능한 근거 중심의 프레임을 제시하는 방식으로 전개합니다.

## 2) 핵심 사실/데이터
${summarizeResearch(pack)}

위 자료를 종합하면, 정책·거래·시장 반응이 단절된 신호가 아니라 서로 영향을 주고받는 연결 구조로 관찰됩니다.
${evidenceNarrative(pack)}
${dataEvidenceExpansion(pack)}

## 3) 해석과 인사이트
${researchNarrative(pack)}

도심 자산의 성과는 단순 가격 수준보다 운영 품질의 누적 속도에 의해 좌우되는 경향이 있으며, 이는 상권 체류시간·재방문률·임차인 구성 안정성에서 비교적 선명하게 확인됩니다.
${josephAugmentationParagraph(pack)}
또한 본 주제는 부동산·투자·라이프스타일 축이 분리되어 움직이는 사안이 아니라, 소비 동선과 자본 효율이 동시에 재편되는 복합 전환 구간으로 해석하는 것이 더 타당합니다.

## 4) 실무적 시사점
실무적으로는 첫째, 입지·브랜드·운영지표를 분리해 점검함으로써 리스크 과소평가를 방지해야 합니다.
둘째, 정책 신호와 수요 지표를 동시 추적해 실행 타이밍 오차를 줄여야 합니다.
셋째, 공실·회전율·재방문 데이터는 월 단위로 누적 추적해 의사결정의 일관성을 유지해야 합니다.
${executionByStyle[style]}
결국 단기 수치의 변동보다, 운영 시나리오의 재현 가능성과 지표의 질적 개선이 지속되는지를 확인하는 체계가 필요합니다.

## 5) 결론
${normalizeKeyword(pack.keyword)} 재개발 사례를 제목과 연결해 정리하면, 도심형 자산에서 투자성과와 라이프스타일 가치는 분리되지 않고 함께 축적됩니다.
입지 희소성은 여전히 중요하지만, 이용자의 시간을 어떻게 설계하고 반복 방문의 이유를 어떻게 축적하는지가 실질 가치를 결정합니다.
현 시점에서는 공격적 가정보다 근거 축적형 접근이 더 합리적이며, 후속 업데이트에서는 신규 근거를 반영해 판단 정확도를 단계적으로 높이겠습니다.
- 반영할 요소: ${include}
- 피할 요소: ${avoid}
- 문체 원칙: 공손체(합니다/입니다) 유지, 단정적 표현 최소화

${disclaimerFor("ko")}
`;
  return polishKoBody(base, normalizeKeyword(pack.keyword), pack);
}

export function buildDraftCandidates(
  pack: ResearchPack,
  notes: ParsedAuthorNotes,
  candidateCount = 2
) {
  const all = {
    balanced: buildKoBody(pack, notes, "v2", "balanced"),
    concise: buildKoBody(pack, notes, "v2", "concise"),
    deep: buildKoBody(pack, notes, "v2", "deep"),
  };
  const order: Array<keyof typeof all> = ["balanced", "deep", "concise"];
  const selected = order.slice(0, Math.max(1, Math.min(3, candidateCount)));
  return selected.reduce<Record<string, string>>((acc, key) => {
    acc[key] = all[key];
    return acc;
  }, {});
}

function keywordTokenSet(keyword: string) {
  return new Set(
    normalizeKeyword(keyword)
      .split(/\s+/)
      .map(token => token.trim())
      .filter(token => token.length >= 2)
  );
}

function envWeight(name: string, fallback: number) {
  const raw = Number(process.env[name] ?? "");
  if (!Number.isFinite(raw)) return fallback;
  return raw;
}

const QUALITY_WEIGHTS = {
  readability: envWeight("BLOG_QUALITY_WEIGHT_READABILITY", 1.0),
  tone: envWeight("BLOG_QUALITY_WEIGHT_TONE", 0.75),
  length: envWeight("BLOG_QUALITY_WEIGHT_LENGTH", 0.6),
  keyword: envWeight("BLOG_QUALITY_WEIGHT_KEYWORD", 0.5),
};

function pickSection(text: string, heading: string) {
  const start = text.indexOf(heading);
  if (start < 0) return "";
  const next = text.indexOf("\n## ", start + heading.length);
  if (next < 0) return text.slice(start).trim();
  return text.slice(start, next).trim();
}

function scoreCandidateQuality(markdown: string, keyword: string) {
  const keywordTokens = keywordTokenSet(keyword);
  const chars = koreanCharCount(markdown);
  const readabilitySignals =
    (markdown.match(/(이 지점에서 중요한 것은|실무적으로 보면|현 시점에서는|우선 검토할 만합니다)/g) ?? [])
      .length;
  const readabilityPenalty = (markdown.match(/(요약하면|결론적으로)\s*(요약하면|결론적으로)/g) ?? []).length;
  const formalCount = (markdown.match(/(합니다\.|입니다\.)/g) ?? []).length;
  const plainCount = (markdown.match(/([가-힣]{2,}다\.)/g) ?? []).length;
  const hardClaimPenalty =
    (markdown.match(/(반드시|무조건|확정 수익|보장|틀림없이|100%)/g) ?? []).length * 8;
  const intro = pickSection(markdown, "## 1) 문제 제기");
  const conclusion = pickSection(markdown, "## 5) 결론");
  let keywordHits = 0;
  for (const token of keywordTokens) {
    if (intro.includes(token)) keywordHits += 1;
    if (conclusion.includes(token)) keywordHits += 1;
  }
  const lengthScore = Math.max(0, 30 - Math.floor(Math.abs(chars - 2000) / 35));
  const toneScore = Math.max(0, formalCount * 3 - plainCount * 2);
  const keywordScore = keywordHits * 6;
  const readabilityScore = Math.max(0, readabilitySignals * 6 - readabilityPenalty * 10);
  return (
    readabilityScore * QUALITY_WEIGHTS.readability +
    toneScore * QUALITY_WEIGHTS.tone +
    lengthScore * QUALITY_WEIGHTS.length +
    keywordScore * QUALITY_WEIGHTS.keyword -
    hardClaimPenalty
  );
}

export function synthesizeDraftCandidates(candidates: Record<string, string>, keyword = "") {
  const entries = Object.entries(candidates);
  const ranked = entries
    .map(([name, text]) => ({
      name,
      text,
      score: scoreCandidateQuality(text, keyword),
    }))
    .sort((a, b) => b.score - a.score);
  const primary = ranked[0]?.text ?? "";
  const secondary = ranked[1]?.text ?? primary;
  const tertiary = ranked[2]?.text ?? secondary;
  const pickSection = (text: string, heading: string) => {
    const start = text.indexOf(heading);
    if (start < 0) return "";
    const next = text.indexOf("\n## ", start + heading.length);
    if (next < 0) return text.slice(start).trim();
    return text.slice(start, next).trim();
  };
  const sections = [
    pickSection(primary, "## 1) 문제 제기"),
    pickSection(secondary, "## 2) 핵심 사실/데이터"),
    pickSection(secondary, "## 3) 해석과 인사이트"),
    pickSection(tertiary, "## 4) 실무적 시사점"),
    pickSection(primary, "## 5) 결론"),
  ].filter(Boolean);
  return sections.join("\n\n");
}

function translateStub(koBody: string, locale: "en" | "ja") {
  if (locale === "en") {
    return `## Overview\nThis is a localized draft translated from the Korean final version.\n\n## Key insights\n${koBody
      .replaceAll("## ", "### ")
      .replaceAll("개요", "Overview")
      .replaceAll("핵심 인사이트", "Key insights")
      .replaceAll("작성 메모 반영", "Writer notes")
      .replaceAll("결론", "Conclusion")
      .replaceAll("자료의 공통 분모를 기준으로 보수적으로 해석하면, 단기 변동성보다 구조적 수요와 정책 변수의 조합이 중요합니다.", "A conservative reading suggests structural demand and policy variables matter more than short-term volatility.")
      .replaceAll(disclaimerFor("ko"), disclaimerFor("en"))}
\nFor global readers, funding and currency assumptions may materially change outcomes.\n`;
  }
  return `## 概要\n韓国語の最終稿を基に、事実を維持したうえで日本語向けに調整したドラフトです。\n\n## 主要インサイト\n${koBody
    .replaceAll("## ", "### ")
    .replaceAll("개요", "概要")
    .replaceAll("핵심 인사이트", "主要インサイト")
    .replaceAll("작성 메모 반영", "メモ反映")
    .replaceAll("결론", "結論")
    .replaceAll("자료의 공통 분모를 기준으로 보수적으로 해석하면, 단기 변동성보다 구조적 수요와 정책 변수의 조합이 중요합니다.", "共通する根拠を保守的に解釈すると、短期変動よりも構造需要と政策要因の組み合わせが重要です。")
    .replaceAll(disclaimerFor("ko"), disclaimerFor("ja"))}
\n国内居住者と海外投資家では、資金調達条件と為替感応度が異なる点に留意が必要です。\n`;
}

export function splitFrontmatter(markdown: string) {
  const lines = markdown.split("\n");
  if (lines[0]?.trim() !== "---") return { frontmatter: "", body: markdown };
  const end = lines.findIndex((line, idx) => idx > 0 && line.trim() === "---");
  if (end < 0) return { frontmatter: "", body: markdown };
  return {
    frontmatter: lines.slice(0, end + 1).join("\n"),
    body: lines.slice(end + 1).join("\n").trim(),
  };
}

export function composeMarkdown(frontmatter: string, body: string) {
  return `${frontmatter}\n${body}`.trim();
}

function toLocalizedFrontmatter(koFrontmatter: string, locale: "en" | "ja") {
  if (!koFrontmatter) return koFrontmatter;
  if (locale === "en") {
    return koFrontmatter
      .replace(/tags:\s*\[[^\]]*\]/, 'tags: ["insight", "research", "blog"]')
      .replace(/title:\s*"([^"]+)"/, 'title: "$1 (EN)"');
  }
  return koFrontmatter
    .replace(/tags:\s*\[[^\]]*\]/, 'tags: ["インサイト", "リサーチ", "ブログ"]')
    .replace(/title:\s*"([^"]+)"/, 'title: "$1 (JA)"');
}

export function buildTranslationsFromKoFinal(koMarkdown: string) {
  const { frontmatter, body } = splitFrontmatter(koMarkdown);
  const enFront = toLocalizedFrontmatter(frontmatter, "en");
  const jaFront = toLocalizedFrontmatter(frontmatter, "ja");
  const enBody = translateStub(body, "en");
  const jaBody = translateStub(body, "ja");
  return {
    en: `${enFront}\n\n${enBody}`.trim(),
    ja: `${jaFront}\n\n${jaBody}`.trim(),
  };
}

export function buildDraftBundle(pack: ResearchPack, notes: ParsedAuthorNotes): DraftBundle {
  const normalizedKeyword = normalizeKeyword(pack.keyword);
  const titleKo = makeKoTitle(normalizedKeyword);
  const titleEn = `${normalizedKeyword} Insight Report`;
  const titleJa = `${normalizedKeyword} インサイトレポート`;
  const description = "Auto-generated draft with human approval gates.";
  const tags = ["인사이트", "리서치", "자동화"];

  const koV1Body = buildKoBody(pack, notes, "v1");
  const koCandidates = buildDraftCandidates(pack, notes);
  const koV2Body = polishKoBody(
    synthesizeDraftCandidates(koCandidates, normalizedKeyword),
    normalizedKeyword,
    pack
  );
  const enBody = translateStub(koV2Body, "en");
  const jaBody = translateStub(koV2Body, "ja");

  return {
    koV1: `${toFrontmatterBlock(titleKo, description, tags, pack.sources, pack.references)}\n${koV1Body}`,
    koV2: `${toFrontmatterBlock(titleKo, description, tags, pack.sources, pack.references)}\n${koV2Body}`,
    en: `${toFrontmatterBlock(titleEn, description, ["insight", "research"], pack.sources, pack.references)}\n${enBody}`,
    ja: `${toFrontmatterBlock(titleJa, description, ["インサイト", "リサーチ"], pack.sources, pack.references)}\n${jaBody}`,
  };
}
