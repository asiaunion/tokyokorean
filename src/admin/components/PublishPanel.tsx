import React, { useState, useEffect } from "react";

interface PublishPanelProps {
  postId: string;
  onPublishSuccess?: () => void;
}

export default function PublishPanel({ postId, onPublishSuccess }: PublishPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string[] | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePublish = async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      setConflict(null);
      setSuccess(false);

      const res = await fetch(`/admin/api/posts/${postId}/publish/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setConflict(data.conflicts || []);
          return;
        }
        throw new Error(data.error || "발행 중 오류가 발생했습니다.");
      }

      setSuccess(true);
      if (onPublishSuccess) {
        onPublishSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-card-bg border border-border rounded-2xl mt-4">
      <h3 className="text-lg font-semibold text-foreground mb-2">발행하기</h3>
      <p className="text-sm text-foreground opacity-70 mb-4">
        이 글을 블로그에 발행합니다.
      </p>

      {success && (
        <div className="mb-4 p-3 bg-accent/10 text-accent text-sm rounded-xl border border-accent/20 flex items-center gap-2">
          ✅ 발행이 완료되었습니다.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      {conflict && (
        <div className="mb-4 p-4 bg-amber-500/10 text-amber-400 text-sm rounded-xl border border-amber-500/20">
          <p className="font-semibold mb-2">⚠️ 외부 변경 감지</p>
          <p className="mb-2">
            이 글이 다른 경로로 수정된 것 같습니다. (대상 언어: {conflict.join(", ")})
          </p>
          <p className="mb-3">현재 내용으로 덮어쓰고 발행할까요?</p>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePublish(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-foreground rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              덮어쓰고 발행
            </button>
            <button
              onClick={() => setConflict(null)}
              className="px-3 py-1.5 bg-muted hover:bg-border text-foreground rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {!conflict && (
        <button
          onClick={() => handlePublish(false)}
          disabled={loading}
          className="flex items-center justify-center w-full px-4 py-2 bg-accent text-background hover:opacity-90 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              발행 중...
            </>
          ) : (
            "지금 발행하기"
          )}
        </button>
      )}
    </div>
  );
}
