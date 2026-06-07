'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // In production, compare with an env var or a dedicated admin table
    if (!session || (session.user.email !== 'admin@rewardclick.com' && session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL)) {
      router.push('/dashboard');
      return;
    }
    
    setIsAdmin(true);
    fetchWithdrawals();
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setWithdrawals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      
      // Update local state
      setWithdrawals(prev => 
        prev.map(w => w.id === id ? { ...w, status: newStatus } : w)
      );
    } catch (error) {
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-300" />
        </Link>
        <div className="p-3 bg-brand-dark/30 rounded-xl border border-brand/30">
          <ShieldCheck className="w-8 h-8 text-brand-neon" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            관리자 대시보드
          </h1>
          <p className="text-slate-400">출금 신청 내역 정산 관리</p>
        </div>
      </div>

      <div className="glass-panel p-1">
        <div className="bg-slate-900/50 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400">
              <tr>
                <th className="px-6 py-4">신청일시</th>
                <th className="px-6 py-4">회원코드 (이메일)</th>
                <th className="px-6 py-4">신청 금액</th>
                <th className="px-6 py-4">계좌 정보</th>
                <th className="px-6 py-4">상태</th>
                <th className="px-6 py-4 text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-2"></div>
                      데이터 불러오는 중...
                    </div>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    출금 신청 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(w.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{w.users?.member_code}</div>
                      <div className="text-xs text-slate-500">{w.users?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-light">
                      {w.amount.toLocaleString()} P
                    </td>
                    <td className="px-6 py-4">
                      <div>{w.bank_name}</div>
                      <div className="font-mono text-slate-400">{w.account_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      {w.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> 대기중
                        </span>
                      )}
                      {w.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> 정산완료
                        </span>
                      )}
                      {w.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" /> 반려됨
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        {w.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(w.id, 'COMPLETED')}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors border border-emerald-500/20"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(w.id, 'REJECTED')}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors border border-red-500/20"
                            >
                              반려
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
