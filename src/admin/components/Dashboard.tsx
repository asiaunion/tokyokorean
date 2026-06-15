import React, { useState, useEffect } from "react";

interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  target: string;
  created_at: string;
}

interface DashboardStats {
  published: number;
  draft: number;
  memo: number;
  totalLogs: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/dashboard/")
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setLogs(data.logs);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 opacity-80">
        <div className="w-10 h-10 border-4 border-accent border-t-accent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm animate-pulse">대시보드 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent">대시보드 요약</h1>
        <p className="opacity-80 mt-2 text-sm">블로그 포스트 통계 및 최근 활동 내역입니다.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-card-bg border border-border p-6 rounded-2xl flex flex-col items-center shadow-xl">
          <span className="text-4xl mb-3">🟢</span>
          <span className="text-3xl font-bold text-foreground">{stats?.published || 0}</span>
          <span className="text-xs opacity-80 mt-1 uppercase tracking-widest font-semibold">발행됨</span>
        </div>
        <div className="bg-card-bg border border-border p-6 rounded-2xl flex flex-col items-center shadow-xl">
          <span className="text-4xl mb-3">🟡</span>
          <span className="text-3xl font-bold text-foreground">{stats?.draft || 0}</span>
          <span className="text-xs opacity-80 mt-1 uppercase tracking-widest font-semibold">작성 중</span>
        </div>
        <div className="bg-card-bg border border-border p-6 rounded-2xl flex flex-col items-center shadow-xl">
          <span className="text-4xl mb-3">📝</span>
          <span className="text-3xl font-bold text-foreground">{stats?.memo || 0}</span>
          <span className="text-xs opacity-80 mt-1 uppercase tracking-widest font-semibold">메모</span>
        </div>
        <div className="bg-card-bg border border-border p-6 rounded-2xl flex flex-col items-center shadow-xl">
          <span className="text-4xl mb-3">🔒</span>
          <span className="text-3xl font-bold text-foreground">{stats?.totalLogs || 0}</span>
          <span className="text-xs opacity-80 mt-1 uppercase tracking-widest font-semibold">활동 기록</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <span>📜</span> 최근 활동 내역
      </h2>
      <div className="bg-card-bg border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm opacity-90">
            <thead className="bg-background text-xs uppercase font-semibold opacity-80">
              <tr>
                <th className="px-6 py-4">일시</th>
                <th className="px-6 py-4">사용자</th>
                <th className="px-6 py-4">액션</th>
                <th className="px-6 py-4">대상</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-foreground/[0.03] transition-colors">
                  <td className="px-6 py-4 font-mono text-[11px] opacity-80">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium">{log.user_email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-accent text-background border border-accent rounded-md font-bold text-[11px] uppercase tracking-wide">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs opacity-70">{log.target || "-"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center opacity-70 text-sm">
                    기록된 활동 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
