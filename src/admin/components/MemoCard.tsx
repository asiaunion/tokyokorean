import React, { useState } from "react";

export type Memo = {
  id: string;
  content: string;
  status: "pending" | "expanded" | "archived";
  created_at: string;
};

interface MemoCardProps {
  memo: Memo;
  onExpandSuccess?: (postId: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, content: string) => void;
}

export default function MemoCard({ memo, onExpandSuccess, onDelete, onUpdate }: MemoCardProps) {
  const [expanding, setExpanding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 인라인 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(memo.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExpand = async () => {
    if (!confirm("이 메모를 바탕으로 초안을 생성하시겠습니까? (AI 처리 시간이 약 10~30초 소요될 수 있습니다)")) return;
    
    setExpanding(true);
    setError(null);
    try {
      const res = await fetch(`/admin/api/memos/${memo.id}/expand/`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "살붙이기 실패");
      }
      const data = await res.json();
      if (onExpandSuccess && data.postId) {
        onExpandSuccess(data.postId);
      }
    } catch (err: any) {
      setError(err.message || "살붙이기 중 에러가 발생했습니다.");
    } finally {
      setExpanding(false);
    }
  };

  // 편집 저장
  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/admin/api/memos/${memo.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "저장 실패");
      }
      onUpdate?.(memo.id, editContent);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setEditContent(memo.content);
    setIsEditing(false);
    setError(null);
  };

  // 삭제
  const handleDelete = async () => {
    if (!confirm("이 메모를 삭제하시겠어요?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/admin/api/memos/${memo.id}/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "삭제 실패");
      }
      onDelete?.(memo.id);
    } catch (err: any) {
      setError(err.message || "삭제 중 오류가 발생했습니다.");
      setDeleting(false);
    }
  };

  const isExpanded = memo.status === "expanded";

  return (
    <div className={`p-5 rounded-2xl border transition-colors ${isExpanded ? "bg-muted/50 border-border/50" : "bg-card-bg border-border hover:border-accent/50"} flex flex-col gap-3 shadow-sm`}>
      <div className="flex justify-between items-start gap-4">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 text-sm p-2 bg-background border border-accent rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-accent min-h-[80px] text-foreground"
            autoFocus
          />
        ) : (
          <p className={`text-sm whitespace-pre-wrap leading-relaxed flex-1 ${isExpanded ? "text-foreground/60" : "text-foreground"}`}>
            {memo.content}
          </p>
        )}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] opacity-50 whitespace-nowrap pt-1">
            {new Date(memo.created_at).toLocaleDateString()}
          </span>
          {/* 편집/삭제 버튼 (expanded 상태에서도 삭제 가능) */}
          {!isEditing && (
            <div className="flex gap-1 mt-1">
              {!isExpanded && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-card-bg border border-border hover:border-accent hover:text-accent transition-colors cursor-pointer text-foreground/70"
                  title="편집"
                >
                  ✏️
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[10px] px-2 py-0.5 rounded-md bg-card-bg border border-border hover:border-red-500/40 hover:text-red-400 transition-colors cursor-pointer text-foreground/70 disabled:opacity-50"
                title="삭제"
              >
                {deleting ? "..." : "🗑️"}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      
      {/* 편집 모드 액션 버튼 */}
      {isEditing ? (
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={handleCancelEdit}
            className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer text-foreground/70"
          >
            취소
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={saving || !editContent.trim()}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-background hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      ) : (
        <div className="flex justify-end mt-2">
          <button
            onClick={handleExpand}
            disabled={expanding || isExpanded}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 
              ${isExpanded 
                ? "bg-transparent text-foreground/40 cursor-not-allowed" 
                : expanding
                  ? "bg-accent/20 text-accent cursor-wait"
                  : "bg-accent/10 hover:bg-accent hover:text-background text-accent border border-accent/20 cursor-pointer"
              }`}
          >
            {expanding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                생성 중...
              </>
            ) : isExpanded ? (
              <>✅ 변환 완료됨</>
            ) : (
              <>✨ 내용 보강</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
