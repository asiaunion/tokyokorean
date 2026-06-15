import React, { useState } from "react";
import { z } from "zod";
import CustomSelect, { type SelectOption } from "./CustomSelect";

export const frontmatterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있어요."),
  category: z.enum(["investment", "safety", "life", "local", "essay"]),
  tags: z.array(z.string()),
});

interface FrontmatterEditorProps {
  slug: string;
  category: "investment" | "safety" | "life" | "local" | "essay";
  tags: string[];
  onChange: (data: { slug: string; category: any; tags: string[] }) => void;
  // 슬러그 자동생성용
  postId?: string;
  currentTitle?: string;
  // AI 태그 추천
  suggestedTags?: string[];
  onSuggestedTagAdd?: (tag: string) => void;
}

export default function FrontmatterEditor({
  slug,
  category,
  tags,
  onChange,
  postId,
  currentTitle,
  suggestedTags = [],
  onSuggestedTagAdd,
}: FrontmatterEditorProps) {
  const [newTagInput, setNewTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generatingSlug, setGeneratingSlug] = useState(false);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newSlug = e.target.value.toLowerCase().replace(/\s+/g, "-");
    const result = frontmatterSchema.safeParse({ slug: newSlug, category, tags });
    if (!result.success) {
      setError(result.error.issues.find(i => i.path.includes("slug"))?.message || null);
    } else {
      setError(null);
    }
    onChange({ slug: newSlug, category, tags });
  };

  const handleCategoryChange = (value: string) => {
    onChange({ slug, category: value as any, tags });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = newTagInput.trim().toLowerCase().replace(/,/g, "");
      if (cleaned && !tags.includes(cleaned)) {
        onChange({ slug, category, tags: [...tags, cleaned] });
      }
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({ slug, category, tags: tags.filter((t) => t !== tagToRemove) });
  };

  // 슬러그 자동생성 (Gemini Flash 경유 API)
  const handleGenerateSlug = async () => {
    if (!currentTitle?.trim()) {
      setError("제목을 먼저 입력해주세요.");
      return;
    }
    setGeneratingSlug(true);
    setError(null);
    try {
      const res = await fetch("/admin/api/posts/generate-slug/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: currentTitle }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "슬러그 생성 실패");
      }
      const data = await res.json();
      if (data.slug) {
        onChange({ slug: data.slug, category, tags });
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || "슬러그 생성 중 오류가 발생했습니다.");
    } finally {
      setGeneratingSlug(false);
    }
  };

  return (
    <div className="bg-card-bg border border-border rounded-2xl p-5 flex flex-col gap-5">
      <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
        ⚙️ 게시글 설정
      </h3>

      {/* 슬러그 입력 */}
      <div>
        <label className="block text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1.5">
          웹 주소 (영문)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={slug}
            onChange={handleSlugChange}
            className={`flex-1 px-3 py-2 bg-background border ${error ? 'border-red-500/50' : 'border-border'} rounded-xl text-xs opacity-90 focus:outline-none focus:border-accent transition-colors font-mono`}
          />
          <button
            type="button"
            onClick={handleGenerateSlug}
            disabled={generatingSlug || !currentTitle?.trim()}
            className="flex items-center gap-1 px-2.5 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 text-[10px] font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            title={!currentTitle?.trim() ? "제목을 먼저 입력해주세요" : "제목으로 슬러그 자동생성"}
          >
            {generatingSlug ? (
              <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              "✨ 자동생성"
            )}
          </button>
        </div>
        {error && <span className="text-[9px] text-red-400 mt-1 block leading-tight">{error}</span>}
        <span className="text-[9px] opacity-70 mt-1 block leading-tight">
          영문 소문자, 숫자, 하이픈(-)만 사용할 수 있어요.
        </span>
      </div>

      {/* 카테고리 셀렉터 */}
      <div>
        <label className="block text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1.5">
          카테고리
        </label>
        <CustomSelect
          options={[
            { value: "investment", label: "투자", emoji: "📈" },
            { value: "safety", label: "안전", emoji: "🛡️" },
            { value: "life", label: "라이프", emoji: "🌱" },
            { value: "local", label: "로컬", emoji: "🇯🇵" },
            { value: "essay", label: "에세이", emoji: "✍️" },
          ]}
          value={category}
          onChange={handleCategoryChange}
          compact
        />
      </div>

      {/* 태그 지정 */}
      <div>
        <label className="block text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1.5">
          태그
        </label>
        <input
          type="text"
          placeholder="태그 입력 후 Enter..."
          value={newTagInput}
          onChange={(e) => setNewTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs opacity-90 focus:outline-none focus:border-accent transition-colors placeholder-gray-600 mb-2"
        />
        
        {/* 태그 리스트 */}
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {tags.length === 0 ? (
            <span className="text-[10px] opacity-50 italic">아직 태그가 없어요.</span>
          ) : (
            tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded bg-accent text-background text-accent border border-accent text-[10px] font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-accent hover:text-accent font-bold ml-0.5 text-xs focus:outline-none cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))
          )}
        </div>

        {/* AI 추천 태그 (자동저장 성공 후 표시) */}
        {suggestedTags.length > 0 ? (
          <div className="mt-2.5 pt-2.5 border-t border-border/50">
            <span className="text-[9px] opacity-60 uppercase font-semibold tracking-wider block mb-1.5">
              ✨ AI 추천 태그 (클릭하면 추가)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSuggestedTagAdd?.(tag)}
                  className="inline-flex items-center gap-1 pl-2 pr-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-medium hover:bg-blue-500/20 transition-colors cursor-pointer"
                >
                  + #{tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[9px] opacity-40 mt-1.5 leading-tight">
            💡 본문 200자 이상 작성 후 자동저장되면 AI 태그 추천이 표시됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
