import React, { useRef, useState } from "react";

interface ImageUploaderProps {
  postId: string;
  onUploadSuccess: (url: string) => void;
}

export default function ImageUploader({ postId, onUploadSuccess }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("postId", postId);

      const res = await fetch("/admin/api/upload/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      onUploadSuccess(data.url);
    } catch (error: any) {
      alert(error.message || "업로드 실패");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/jpeg,image/png,image/gif,image/webp,image/heic" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-3 py-1.5 bg-card-bg hover:bg-muted text-accent border border-accent rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
      >
        {uploading ? (
          <>
            <div className="w-3 h-3 border-2 border-accent border-t-emerald-500 rounded-full animate-spin"></div>
            업로드 중...
          </>
        ) : (
          "📸 이미지 삽입"
        )}
      </button>
    </div>
  );
}
