import React from "react";

interface TranslationStatusProps {
  translations: Record<string, { updated_at?: string; body_md: string }>;
  baseLang?: string;
}

export default function TranslationStatus({ translations, baseLang = "ko" }: TranslationStatusProps) {
  const baseUpdated = translations[baseLang]?.updated_at;

  const getStatus = (lang: string) => {
    if (!translations[lang] || !translations[lang].body_md.trim()) {
      return { status: "missing", label: "미작성", color: "bg-red-500/10 text-red-400 border-red-500/20" };
    }
    
    // 단순 시간 비교를 위한 Date 파싱 (baseUpdated가 더 최근이면 오래됨)
    if (baseUpdated && translations[lang].updated_at) {
      const baseTime = new Date(baseUpdated).getTime();
      const langTime = new Date(translations[lang].updated_at).getTime();
      if (baseTime > langTime + 5000) { // 5초 오차 허용
        return { status: "outdated", label: "오래됨", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      }
    }
    
    return { status: "latest", label: "최신", color: "bg-accent text-background text-accent border-accent" };
  };

  return (
    <div className="flex gap-2">
      {(["ko", "en", "ja"] as const).map(lang => {
        const { label, color } = getStatus(lang);
        return (
          <div key={lang} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border ${color}`}>
            <span>{lang.toUpperCase()}</span>
            <span className="opacity-75">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
