import React, { useState, useEffect, useRef } from "react";
import RevisionPanel from "./RevisionPanel";
import FrontmatterEditor from "./FrontmatterEditor";
import ImageUploader from "./ImageUploader";
import PublishPanel from "./PublishPanel";
import TranslationStatus from "./TranslationStatus";
import EditorToolbar from "./EditorToolbar";

// Milkdown Crepe 스타일 및 테마 명시적 임포트
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import "@milkdown/crepe/theme/frame-dark.css";

export type PostTranslation = {
  id?: string;
  title: string;
  body_md: string;
  frontmatter?: Record<string, any>;
  updated_at?: string;
};

export type MergedPost = {
  id: string;
  slug: string;
  category: "practical" | "culture" | "local" | "essay";
  tags: string[];
  status: "memo" | "draft" | "editing" | "review" | "published";
  author: string;
  git_sha: string | null;
  created_at: string;
  updated_at: string;
  translations: Record<string, PostTranslation>;
};

interface EditorProps {
  id: string;
}

export default function Editor({ id }: EditorProps) {
  const [post, setPost] = useState<MergedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 편집 중인 언어 탭 ("ko" | "en" | "ja")
  const [activeLang, setActiveLang] = useState<"ko" | "en" | "ja">("ko");

  // 실시간 에디터 입력 상태 (언어별)
  const [localTitles, setLocalTitles] = useState<Record<string, string>>({ ko: "", en: "", ja: "" });
  const [localMarkdown, setLocalMarkdown] = useState<Record<string, string>>({ ko: "", en: "", ja: "" });

  // 프론트매터/메타데이터 로컬 편집 상태
  const [metaSlug, setMetaSlug] = useState("");
  const [metaCategory, setMetaCategory] = useState<MergedPost["category"]>("practical");
  const [metaTags, setMetaTags] = useState<string[]>([]);

  // 상태 동기화 및 자동저장 관리 상태
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"Ready" | "Saving..." | "Saved" | "Error">("Ready");
  const [revisionTrigger, setRevisionTrigger] = useState(0); // 이력 갱신용 강제 트리거
  const [showSettings, setShowSettings] = useState(false); // 설정 드로어 토글
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]); // AI 태그 추천

  // Crepe 컨테이너 레퍼런스
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<any>(null);

  // 1. 상세 정보 불러오기
  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/admin/api/posts/${id}/`);
      if (!res.ok) {
        throw new Error(`포스트 정보를 불러오지 못했습니다 (${res.status})`);
      }
      const data: MergedPost = await res.json();
      
      setPost(data);
      setMetaSlug(data.slug);
      setMetaCategory(data.category);
      setMetaTags(data.tags);

      // 언어별 본문 및 제목 매핑
      const titles: Record<string, string> = { ko: "", en: "", ja: "" };
      const markdowns: Record<string, string> = { ko: "", en: "", ja: "" };
      
      ["ko", "en", "ja"].forEach((l) => {
        titles[l] = data.translations[l]?.title || "";
        markdowns[l] = data.translations[l]?.body_md || "";
      });

      setLocalTitles(titles);
      setLocalMarkdown(markdowns);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "상세 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  // 2. Milkdown Crepe 마운트 & 리마운트 로직
  // activeLang이 바뀌거나 post가 로드될 때 에디터를 재생성(Re-mount)하여 상태 꼬임 방지
  useEffect(() => {
    if (!containerRef.current || !post) return;

    let activeCrepe: any = null;

    async function initCrepe() {
      try {
        const { Crepe } = await import("@milkdown/crepe");
        // topBar/toolbar addFeature 제거 (커스텀 React 툴바로 대체)
        
        // 이전 에디터 내용 비우기
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        const initialContent = localMarkdown[activeLang] || "";

        activeCrepe = new Crepe({
          root: containerRef.current,
          defaultValue: initialContent,
        });

        // addFeature는 사용 안 함 (TopBar는 커스텀 React 툴바로 대체)

        await activeCrepe.create();
        crepeRef.current = activeCrepe;
      } catch (e) {
        console.error("Crepe 초기화 실패:", e);
      }
    }

    initCrepe();

    return () => {
      if (activeCrepe) {
        try {
          activeCrepe.destroy();
        } catch (e) {
          // destroy 중 예외 방지
        }
      }
    };
  }, [activeLang, post?.id]);

  // 3. 에디터 텍스트 Polling 동기화 (1초 주기)
  // 에디터 본문 타이핑 시, 로컬 Markdown 상태를 동적 추출해 감지
  useEffect(() => {
    const checkTimer = setInterval(() => {
      if (crepeRef.current && post) {
        try {
          const editorText = crepeRef.current.getMarkdown() || "";
          if (editorText !== localMarkdown[activeLang]) {
            setLocalMarkdown((prev) => ({
              ...prev,
              [activeLang]: editorText,
            }));
            setIsDirty(true);
            setSaveStatus("Saving...");
          }
        } catch (e) {
          // getMarkdown API 로드 중 예외 처리 방지
        }
      }
    }, 1000);

    return () => clearInterval(checkTimer);
  }, [activeLang, post, localMarkdown]);

  // 4. 2초 Debounce 자동저장 기능 연동
  useEffect(() => {
    if (!isDirty || !post) return;

    const saveTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/admin/api/posts/${post.id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: metaSlug,
            category: metaCategory,
            tags: metaTags,
            status: post.status, // 현재 임시 상태 유지
            lang: activeLang,
            title: localTitles[activeLang] || "",
            body_md: localMarkdown[activeLang] || "",
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "저장 실패");
        }

        setIsDirty(false);
        setSaveStatus("Saved");
        setRevisionTrigger((prev) => prev + 1); // 이력 패널 목록 리프레시 강제 트리거

        // AI 태그 추천 — 조건부 트리거 (본문 200자 이상 + 현재 태그 2개 이하)
        const currentBody = localMarkdown[activeLang] || "";
        if (currentBody.length >= 200 && metaTags.length <= 2) {
          try {
            const tagRes = await fetch(`/admin/api/posts/${post.id}/suggest-tags/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                body_md: currentBody,
                title: localTitles[activeLang] || "",
                category: metaCategory,
              }),
            });
            if (tagRes.ok) {
              const tagData = await tagRes.json();
              if (tagData.tags && Array.isArray(tagData.tags)) {
                setSuggestedTags(tagData.tags.filter((t: string) => !metaTags.includes(t)));
              }
            }
            // silent fail: 에러 시 아무것도 하지 않음
          } catch {
            // 네트워크 오류도 silent fail
          }
        }
      } catch (err: any) {
        console.error(err);
        setSaveStatus("Error");
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [localMarkdown, localTitles, metaSlug, metaCategory, metaTags, isDirty, post, activeLang]);

  // 5. 이력 패널 복원 콜백 핸들링
  const handleRestore = (bodyMd: string) => {
    setLocalMarkdown((prev) => ({
      ...prev,
      [activeLang]: bodyMd,
    }));
    setIsDirty(true);
    setSaveStatus("Saving...");
    
    // 에디터 뷰 업데이트
    if (crepeRef.current) {
      try {
        // Crepe를 안전하게 리마운트하여 본문 교체
        crepeRef.current.destroy();
      } catch (e) {}
      
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        import("@milkdown/crepe").then(async ({ Crepe }) => {
          const activeCrepe = new Crepe({
            root: containerRef.current,
            defaultValue: bodyMd,
          });
          await activeCrepe.create();
          crepeRef.current = activeCrepe;
        });
      }
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 opacity-80">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm animate-pulse">에디터를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto my-20 p-6 bg-red-950/20 border border-red-500/20 rounded-2xl text-center">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-red-400 font-bold mt-3">불러오지 못했습니다</h2>
        <p className="text-red-300/80 text-sm mt-2">{error || "포스트 데이터가 존재하지 않습니다."}</p>
        <a
          href="/admin/posts/"
          className="mt-6 inline-block px-5 py-2.5 bg-card-bg hover:bg-muted opacity-90 text-xs font-semibold rounded-xl transition-colors"
        >
          목록으로 돌아가기
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* 1+2. 통합 컨트롤 행: 뒤로가기 + 언어탭 | 저장상태 + 번역상태 + 수정이력 + 설정 */}
      <div className="flex items-center gap-2 mb-3">
        {/* 왼쪽: 뒤로가기 + 언어탭 */}
        <a
          href="/admin/posts/"
          className="p-2 bg-card-bg hover:bg-muted rounded-xl border border-border text-sm transition-colors shrink-0"
          title="목록으로"
        >
          ←
        </a>
        <div className="flex gap-1 bg-card-bg border border-border rounded-xl p-1 flex-1">
          {(["ko", "en", "ja"] as const).map((l) => (
            <button
              key={l}
              onClick={() => {
                if (crepeRef.current) {
                  try {
                    const txt = crepeRef.current.getMarkdown();
                    setLocalMarkdown((prev) => ({ ...prev, [activeLang]: txt }));
                  } catch (e) {}
                }
                setActiveLang(l);
              }}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeLang === l
                  ? "text-accent border border-accent"
                  : "opacity-70 hover:text-foreground border border-transparent"
              }`}
            >
              {l === "ko" ? "🇰🇷 한국어" : l === "en" ? "🇺🇸 영어" : "🇯🇵 일본어"}
            </button>
          ))}
        </div>

        {/* 오른쪽: 저장상태 + 번역상태 + 수정이력 + 설정 */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 자동저장 인라인 표시 */}
          {saveStatus === "Saving..." && (
            <span className="text-xs text-amber-400 animate-pulse">저장 중...</span>
          )}
          {saveStatus === "Saved" && (
            <span className="text-xs text-accent">✓ 저장됨</span>
          )}
          {saveStatus === "Error" && (
            <span className="text-xs text-red-400">저장 실패</span>
          )}
          <TranslationStatus translations={post.translations} baseLang="ko" />
          <RevisionPanel
            postId={post.id}
            activeLang={activeLang}
            onRestore={handleRestore}
            triggerRefresh={revisionTrigger}
          />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border text-sm transition-colors cursor-pointer ${
              showSettings
                ? "bg-accent text-background border-accent"
                : "bg-card-bg hover:bg-muted border-border"
            }`}
            title="게시글 설정"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 포맷팅 툴바 + 이미지 업로드 — 언어탭과 에디터 카드 사이 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1">
          <EditorToolbar crepeRef={crepeRef} />
        </div>
        <div className="shrink-0">
          <ImageUploader
            postId={post.id}
            onUploadSuccess={(url) => {
              const txt = crepeRef.current?.getMarkdown() || localMarkdown[activeLang] || "";
              const newTxt = txt + `\n\n![업로드된 이미지](${url})\n\n`;
              handleRestore(newTxt);
            }}
          />
        </div>
      </div>

      {/* 3. 노션 스타일 에디터 본문 — 1단 중앙 정렬 */}
      <div className="bg-card-bg border border-border rounded-2xl p-6 md:p-8 min-h-[60vh]">
        {/* 제목 입력 — 에디터 상단에 seamless 배치 */}
        <input
          type="text"
          placeholder="제목을 입력하세요..."
          value={localTitles[activeLang]}
          onChange={(e) => {
            setLocalTitles((prev) => ({ ...prev, [activeLang]: e.target.value }));
            setIsDirty(true);
            setSaveStatus("Saving...");
          }}
          className="w-full text-2xl md:text-3xl font-bold text-foreground placeholder-foreground/30 bg-transparent border-none focus:outline-none mb-6 pb-4 border-b border-border"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        />

        {/* Milkdown Crepe 에디터 — 자동 높이 확장 */}
        <div 
          ref={containerRef} 
          className="prose dark:prose-invert max-w-none focus:outline-none min-h-[40vh]"
        ></div>
      </div>

      {/* 4. 발행 바 — 에디터 하단 고정 */}
      <div className="mt-4">
        <PublishPanel 
          postId={post.id} 
          onPublishSuccess={() => fetchPostDetails()} 
        />
      </div>

      {/* 5. 설정 드로어 (슬라이드 오버) */}
      {showSettings && (
        <>
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-background/60 z-40 animate-fadeIn"
            onClick={() => setShowSettings(false)}
          />
          {/* 드로어 패널 */}
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l border-border z-50 overflow-y-auto shadow-xl animate-slideIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">게시글 설정</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer text-foreground"
                >
                  ✕
                </button>
              </div>

              <FrontmatterEditor
                slug={metaSlug}
                category={metaCategory}
                tags={metaTags}
                postId={post.id}
                currentTitle={localTitles["ko"] || ""}
                suggestedTags={suggestedTags}
                onSuggestedTagAdd={(tag) => {
                  if (!metaTags.includes(tag)) {
                    const newTags = [...metaTags, tag];
                    setMetaTags(newTags);
                    setSuggestedTags(prev => prev.filter(t => t !== tag));
                    setIsDirty(true);
                    setSaveStatus("Saving...");
                  }
                }}
                onChange={(data) => {
                  setMetaSlug(data.slug);
                  setMetaCategory(data.category);
                  setMetaTags(data.tags);
                  setSuggestedTags([]); // 태그 수동 변경 시 추천 초기화
                  setIsDirty(true);
                  setSaveStatus("Saving...");
                }}
              />

              {/* 글 정보 */}
              <div className="bg-card-bg border border-border rounded-2xl p-5 text-xs opacity-80 mt-6">
                <h4 className="font-bold opacity-90 mb-2 select-none">📌 글 정보</h4>
                <div className="flex flex-col gap-1.5 text-[11px] leading-tight">
                  <div>작성자: <span className="text-foreground">{post.author}</span></div>
                  <div>작성일: <span className="text-foreground">{new Date(post.created_at).toLocaleDateString()}</span></div>
                  <div>수정일: <span className="text-foreground">{new Date(post.updated_at).toLocaleDateString()}</span></div>
                  {post.git_sha && (
                    <div>발행 버전: <span className="text-foreground font-mono">{post.git_sha.substring(0, 7)}</span></div>
                  )}
                  {!post.git_sha && (
                    <div className="text-amber-400">아직 발행되지 않은 글입니다</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 드로어 애니메이션 + Milkdown 테마 동기화 CSS */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        /* Milkdown Crepe — 블로그 테마 변수 동기화 */
        /* 라이트 모드 오버라이드 (기본) */
        .milkdown {
          --crepe-color-background: var(--background, #fdfdfd);
          --crepe-color-on-background: var(--foreground, #1a1a1a);
          --crepe-color-surface: var(--muted, #e6e6e6);
          --crepe-color-surface-low: var(--border, #ece9e9);
          --crepe-color-on-surface: var(--foreground, #1a1a1a);
          --crepe-color-on-surface-variant: color-mix(in srgb, var(--foreground) 60%, transparent);
          --crepe-color-outline: var(--border, #ece9e9);
          --crepe-color-primary: var(--accent, #0f4d22);
          --crepe-color-secondary: var(--muted, #e6e6e6);
          --crepe-color-on-secondary: var(--foreground, #1a1a1a);
          --crepe-color-inverse: var(--muted, #e6e6e6);
          --crepe-color-on-inverse: var(--foreground, #1a1a1a);
          --crepe-color-hover: color-mix(in srgb, var(--muted) 70%, transparent);
          --crepe-color-selected: color-mix(in srgb, var(--accent) 15%, transparent);
          --crepe-color-inline-area: color-mix(in srgb, var(--muted) 80%, transparent);
          --crepe-font-default: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --crepe-font-title: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --crepe-font-code: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, monospace;
        }

        /* 다크 모드 오버라이드 */
        html[data-theme="dark"] .milkdown {
          --crepe-color-background: var(--background, #111111);
          --crepe-color-on-background: var(--foreground, #f4f4f5);
          --crepe-color-surface: var(--muted, #2a2a2a);
          --crepe-color-surface-low: var(--border, #333333);
          --crepe-color-on-surface: var(--foreground, #f4f4f5);
          --crepe-color-on-surface-variant: color-mix(in srgb, var(--foreground) 70%, transparent);
          --crepe-color-outline: var(--border, #333333);
          --crepe-color-primary: var(--accent, #34d399);
          --crepe-color-secondary: var(--muted, #2a2a2a);
          --crepe-color-on-secondary: var(--foreground, #f4f4f5);
          --crepe-color-inverse: var(--foreground, #f4f4f5);
          --crepe-color-on-inverse: var(--background, #111111);
          --crepe-color-hover: color-mix(in srgb, var(--muted) 70%, transparent);
          --crepe-color-selected: color-mix(in srgb, var(--accent) 20%, transparent);
          --crepe-color-inline-area: color-mix(in srgb, var(--muted) 80%, transparent);
          --crepe-shadow-1:
            0px 1px 2px 0px rgba(255, 255, 255, 0.1),
            0px 1px 3px 1px rgba(255, 255, 255, 0.05);
          --crepe-shadow-2:
            0px 1px 2px 0px rgba(255, 255, 255, 0.1),
            0px 2px 6px 2px rgba(255, 255, 255, 0.05);
        }

        /* ProseMirror 렌더링 안정화 — 라이트 모드 'r' 아티팩트 방지 */
        .milkdown .ProseMirror {
          font-family: var(--crepe-font-default);
          color: var(--crepe-color-on-background);
          caret-color: var(--crepe-color-primary);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .milkdown .ProseMirror p,
        .milkdown .ProseMirror li {
          line-height: 1.75;
          letter-spacing: -0.011em;
        }

        /* Crepe 에디터 내부 코드블록 배경 동기화 */
        .milkdown .ProseMirror code {
          background: var(--crepe-color-inline-area);
          border-radius: 4px;
          padding: 0.15em 0.35em;
          font-size: 0.875em;
        }
      `}</style>
    </div>
  );
}

