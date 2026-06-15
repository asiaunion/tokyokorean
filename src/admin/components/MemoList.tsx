import React, { useState, useEffect } from "react";
import MemoCard, { type Memo } from "./MemoCard";

export default function MemoList() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchMemos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/admin/api/memos/");
      if (!res.ok) throw new Error("메모 목록을 불러오지 못했습니다.");
      const data = await res.json();
      setMemos(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/admin/api/memos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "메모 등록 실패");
      }
      const newMemo = await res.json();
      setMemos([newMemo, ...memos]);
      setNewContent("");
    } catch (err: any) {
      alert(err.message || "등록 중 오류가 발생했습니다.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent">📝 아이디어 메모장</h1>
        <p className="opacity-80 mt-2 text-sm">
          번뜩이는 아이디어를 메모해 두면, AG가 초안으로 살을 붙여줍니다.
        </p>
      </div>

      {/* 새 메모 작성 폼 */}
      <div className="bg-card-bg border border-border rounded-2xl p-4 md:p-6 mb-8 shadow-sm">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <textarea
            placeholder="어떤 주제로 글을 쓰고 싶으신가요? 핵심 내용이나 키워드를 적어주세요."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full h-24 p-4 bg-background border border-border rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:border-accent transition-colors resize-none text-sm"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating || !newContent.trim()}
              className="px-5 py-2.5 bg-accent text-background text-sm font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {creating ? "저장 중..." : "+ 메모 등록하기"}
            </button>
          </div>
        </form>
      </div>

      {/* 메모 목록 */}
      {loading ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-accent rounded-full animate-spin"></div>
          <p className="mt-4 opacity-70 text-sm">메모를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-2xl text-center">
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      ) : memos.length === 0 ? (
        <div className="py-20 text-center border border-border rounded-2xl bg-card-bg/50">
          <span className="text-4xl">💡</span>
          <p className="mt-4 opacity-70 text-sm">아직 등록된 메모가 없습니다.<br/>첫 번째 아이디어를 남겨보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              onExpandSuccess={(postId) => {
                window.location.href = `/admin/posts/${postId}/`;
              }}
              onDelete={(id) => {
                setMemos(prev => prev.filter(m => m.id !== id));
              }}
              onUpdate={(id, content) => {
                setMemos(prev => prev.map(m => m.id === id ? { ...m, content } : m));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
