import React, { useState, useEffect } from "react";
import CustomSelect, { type SelectOption } from "./CustomSelect";

// 카테고리 영어 → 한국어 매핑
const categoryLabels: Record<string, string> = {
  investment: "투자",
  safety: "안전",
  life: "라이프",
  local: "로컬",
  essay: "에세이",
};

// 드롭다운 옵션 정의
const categoryOptions: SelectOption[] = [
  { value: "all", label: "전체", emoji: "📋" },
  { value: "investment", label: "투자", emoji: "📈" },
  { value: "safety", label: "안전", emoji: "🛡️" },
  { value: "life", label: "라이프", emoji: "🌱" },
  { value: "local", label: "로컬", emoji: "🇯🇵" },
  { value: "essay", label: "에세이", emoji: "✍️" },
];

const statusOptions: SelectOption[] = [
  { value: "all", label: "전체" },
  { value: "db-draft", label: "작성 중", emoji: "📁" },
  { value: "git-only", label: "발행됨", emoji: "🌍" },
  { value: "unsynced", label: "수정됨", emoji: "⚠️" },
  { value: "published", label: "발행 완료", emoji: "✅" },
  { value: "draft", label: "임시 저장" },
  { value: "editing", label: "편집 중" },
  { value: "review", label: "검토 요청" },
];

const modalCategoryOptions: SelectOption[] = [
  { value: "investment", label: "투자", emoji: "📈" },
  { value: "safety", label: "안전", emoji: "🛡️" },
  { value: "life", label: "라이프", emoji: "🌱" },
  { value: "local", label: "로컬", emoji: "🇯🇵" },
  { value: "essay", label: "에세이", emoji: "✍️" },
];

const langOptions: SelectOption[] = [
  { value: "ko", label: "한국어 (KO)", emoji: "🇰🇷" },
  { value: "en", label: "영어 (EN)", emoji: "🇺🇸" },
  { value: "ja", label: "일본어 (JA)", emoji: "🇯🇵" },
];

export type PostTranslation = {
  title: string;
};

export type MergedPost = {
  id: string;
  slug: string;
  category: "investment" | "safety" | "life" | "local" | "essay";
  tags: string[];
  status: "memo" | "draft" | "editing" | "review" | "published";
  author: string;
  git_sha: string | null;
  created_at: string;
  updated_at: string;
  translations: Record<string, PostTranslation>;
  displayTitle: string;
  isDbOnly: boolean;
  isGitOnly: boolean;
  gitLangs: string[];
  gitShas: Record<string, string>;
  isSynced: boolean;
};

interface PostListProps {
  defaultStatusFilter?: string;
}

export default function PostList({ defaultStatusFilter = "all" }: PostListProps = {}) {
  const [posts, setPosts] = useState<MergedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 및 검색 상태
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatusFilter);

  // 포스트 생성 상태
  const [creating, setCreating] = useState(false);
  // per-item import 로딩 상태
  const [importingId, setImportingId] = useState<string | null>(null);
  // per-item delete 로딩 상태
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 데이터 fetch
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/admin/api/posts/");
      if (!res.ok) {
        throw new Error(`포스트 목록을 불러오는 데 실패했습니다 (${res.status})`);
      }
      const data = await res.json();
      setPosts(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "알 수 없는 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 포스트 즉시 생성 (MS 워드 방식)
  const handleCreatePost = async () => {
    try {
      setCreating(true);
      const timestamp = Date.now();
      const defaultSlug = `untitled-${timestamp}`;
      
      const res = await fetch("/admin/api/posts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: defaultSlug,
          title: "제목 입력", // API 스키마가 min(1)을 요구함
          category: "investment",
          lang: "ko",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        const errorMessage = typeof errData.error === "object" ? JSON.stringify(errData.error) : errData.error;
        throw new Error(errorMessage || "포스트 생성 실패");
      }

      const createdPost = await res.json();
      
      // 글 편집 페이지로 즉시 이동
      window.location.href = `/admin/posts/${createdPost.id}/`;
    } catch (err: any) {
      alert(err.message || "새 포스트 생성 중 에러 발생");
    } finally {
      setCreating(false);
    }
  };

  // isGitOnly 포스트 편집 시 자동 import
  const handleImportAndEdit = async (post: MergedPost) => {
    if (importingId) return; // 중복 클릭 방지
    setImportingId(post.slug);
    try {
      const res = await fetch(`/admin/api/posts/${post.slug}/import/`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("가져오기 실패");
      const imported = await res.json();
      window.location.href = `/admin/posts/${imported.id}/`;
    } catch (err: any) {
      alert(err.message || "가져오기 실패");
      setImportingId(null);
    }
  };

  // isDbOnly 포스트 삭제
  const handleDeletePost = async (post: MergedPost) => {
    if (!confirm(`"${post.displayTitle}"을 삭제하시겠어요?\nDB에서만 삭제됩니다. (Git 원본 보존)`)) return;
    setDeletingId(post.id);
    try {
      const res = await fetch(`/admin/api/posts/${post.id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } catch (err: any) {
      alert(err.message || "삭제 실패");
    } finally {
      setDeletingId(null);
    }
  };

  // 필터링된 포스트 목록
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.slug.toLowerCase().includes(search.toLowerCase()) ||
      post.displayTitle.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "db-draft") {
        matchesStatus = post.isDbOnly;
      } else if (statusFilter === "git-only") {
        matchesStatus = post.isGitOnly;
      } else if (statusFilter === "unsynced") {
        matchesStatus = !post.isSynced && !post.isDbOnly && !post.isGitOnly;
      } else {
        matchesStatus = post.status === statusFilter;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* 타이틀 및 헤더 영역 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            📝 포스트 라이브러리
          </h1>
          <p className="opacity-80 mt-2 text-sm">
            글 목록을 한눈에 관리할 수 있어요.
          </p>
        </div>
        <button
          onClick={handleCreatePost}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-3 hover:text-foreground font-medium rounded-xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <span className="text-lg">+</span> {creating ? "생성 중..." : "새 글 쓰기"}
        </button>
      </div>

      {/* 필터 및 검색 바 */}
      <div className="bg-card-bg border border-border rounded-2xl p-4 md:p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/3 relative">
          <input
            type="text"
            placeholder="제목 또는 주소 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          <span className="absolute left-3.5 top-3.5 opacity-70 text-sm">🔍</span>
        </div>

        <div className="flex flex-wrap w-full md:w-auto gap-4 items-center">
          {/* 카테고리 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70 whitespace-nowrap">분류</span>
            <CustomSelect
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              compact
              className="min-w-[130px]"
            />
          </div>

          {/* 상태 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70 whitespace-nowrap">상태</span>
            <CustomSelect
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              compact
              className="min-w-[140px]"
            />
          </div>
        </div>
      </div>

      {/* 로딩 / 에러 / 리스트 영역 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card-bg border border-border rounded-2xl backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-accent border-t-accent rounded-full animate-spin"></div>
          <p className="opacity-80 mt-4 text-sm animate-pulse">글 목록을 병합하여 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-2xl text-center">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-red-400 font-semibold mt-2">에러가 발생했습니다</h3>
          <p className="text-red-300/80 text-sm mt-1">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-500/20 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-20 text-center bg-card-bg border border-border rounded-2xl">
          <span className="text-4xl text-gray-600 block">📭</span>
          <p className="opacity-70 mt-4 text-sm">일치하는 포스트가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-card-bg border border-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background opacity-80 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">상태</th>
                  <th className="px-6 py-4">제목</th>
                  <th className="px-6 py-4">카테고리</th>
                  <th className="px-6 py-4">번역</th>
                  <th className="px-6 py-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPosts.map((post) => {
                  // 동기화 배지 계산
                  let badge = (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-background text-accent border border-accent">
                      ● 발행됨
                    </span>
                  );

                  if (post.isDbOnly) {
                    badge = (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
                        ● 작성 중
                      </span>
                    );
                  } else if (post.isGitOnly) {
                    badge = (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-accent border border-cyan-500/20">
                        ● 발행됨
                      </span>
                    );
                  } else if (!post.isSynced) {
                    badge = (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        ▲ 수정됨
                      </span>
                    );
                  } else if (post.status === "editing" || post.status === "review") {
                    badge = (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        ● 편집 중
                      </span>
                    );
                  }

                  // 카테고리 이모지 변환
                  const categoryEmoji: Record<string, string> = {
                    investment: "📈",
                    safety: "🛡️",
                    life: "🌱",
                    local: "🇯🇵",
                    essay: "✍️",
                  };

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-foreground/[0.03] transition-colors group"
                    >
                      <td className="px-6 py-4.5 whitespace-nowrap">{badge}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                            {post.displayTitle}
                          </span>
                          <span className="text-xs opacity-70 font-mono tracking-tight select-all">
                            /{post.slug}/
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="text-xs opacity-90 font-medium">
                          {categoryEmoji[post.category] || "📂"}{" "}
                          {categoryLabels[post.category] || post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {/* DB 상 지원 언어 뱃지 */}
                          {["ko", "en", "ja"].map((l) => {
                            const isGitHas = post.gitLangs.includes(l);
                            const isDbHas = !!post.translations[l]?.title;
                            
                            // 색상 매핑
                            let classes = "text-[10px] px-1.5 py-0.5 font-bold rounded-md border ";
                            if (isGitHas && isDbHas) {
                              classes += "bg-accent text-background text-accent border-accent";
                            } else if (isGitHas) {
                              classes += "bg-cyan-500/10 text-accent border-cyan-500/20";
                            } else if (isDbHas) {
                              classes += "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                            } else {
                              classes += "bg-card-bg text-gray-600 border-transparent";
                            }

                            return (
                              <span key={l} className={classes} title={`${l.toUpperCase()} 번역본`}>
                                {l.toUpperCase()}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.isGitOnly ? (
                            <button
                              onClick={() => handleImportAndEdit(post)}
                              disabled={importingId === post.slug}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-accent text-background border border-accent text-xs font-semibold rounded-lg transition-all duration-200 hover:scale-[1.03] cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                            >
                              {importingId === post.slug ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
                                  불러오는 중...
                                </>
                              ) : (
                                "📝 편집"
                              )}
                            </button>
                          ) : (
                            <a
                              href={`/admin/posts/${post.id}/`}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-accent text-background border border-accent text-xs font-semibold rounded-lg transition-all duration-200 hover:scale-[1.03] cursor-pointer"
                            >
                              📝 편집
                            </a>
                          )}

                          {/* isDbOnly 전용 삭제 버튼 */}
                          {post.isDbOnly && (
                            <button
                              onClick={() => handleDeletePost(post)}
                              disabled={deletingId === post.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="DB에서 삭제 (Git 원본 보존)"
                            >
                              {deletingId === post.id ? (
                                <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                "🗑️"
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 모달 제거됨 (즉시 생성 방식으로 변경) */}
    </div>
  );
}
