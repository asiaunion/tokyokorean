import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PreviewPaneProps {
  markdown: string;
}

export default function PreviewPane({ markdown }: PreviewPaneProps) {
  return (
    <div className="bg-card-bg border border-border rounded-2xl p-4 md:p-6 h-[600px] flex flex-col">
      <label className="block text-[10px] uppercase font-bold tracking-wider opacity-70 mb-4 select-none shrink-0">
        미리보기
      </label>
      
      <div className="prose dark:prose-invert max-w-none overflow-y-auto flex-1 pr-2 custom-scrollbar">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown || '*내용이 없습니다.*'}
        </ReactMarkdown>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
