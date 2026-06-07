'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, WalletCards, Building2, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function WithdrawalPage() {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [status, setStatus] = useState<{type: 'idle'|'error'|'success', msg: string}>({ type: 'idle', msg: '' });
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchBalance() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      const { data } = await supabase
        .from('users')
        .select('point_balance')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        setBalance(data.point_balance);
      }
    }
    fetchBalance();
  }, [supabase, router]);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseInt(amount, 10);
    
    if (withdrawAmount < 10000) {
      setStatus({ type: 'error', msg: '최소 출금 가능 금액은 10,000 P 입니다.' });
      return;
    }
    if (withdrawAmount > balance) {
      setStatus({ type: 'error', msg: '보유 포인트가 부족합니다.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', msg: '' });

    try {
      const res = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawAmount, bankName, accountNumber })
      });
      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', msg: `${withdrawAmount.toLocaleString()} P 출금 신청 완료! 매주 수요일 일괄 정산됩니다.` });
        setBalance(prev => prev - withdrawAmount);
        setAmount(''); setBankName(''); setAccountNumber('');
      } else {
        setStatus({ type: 'error', msg: `에러: ${data.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: '서버 통신 중 에러가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 flex justify-center items-center relative">
      <div className="absolute top-0 left-0 w-full p-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition">
          <ChevronLeft className="w-5 h-5" /> 돌아가기
        </Link>
      </div>

      <div className="glass-panel w-full max-w-lg p-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-neon/20 rounded-full blur-[100px]"></div>

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="p-3 bg-brand/20 rounded-xl">
            <WalletCards className="w-8 h-8 text-brand-neon" />
          </div>
          <h1 className="text-3xl font-bold">출금 신청</h1>
        </div>

        <div className="p-5 bg-slate-900/50 rounded-xl mb-8 flex justify-between items-center border border-slate-700/50 relative z-10">
          <span className="text-slate-400 font-medium">출금 가능 잔액</span>
          <span className="text-2xl font-bold text-white tracking-tight">
            {balance.toLocaleString()} <span className="text-brand-light text-lg">P</span>
          </span>
        </div>

        <form onSubmit={handleWithdrawal} className="flex flex-col gap-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">출금 포인트 (10,000P 이상)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">P</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="glass-input pl-10"
                placeholder="10000"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">은행명</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="glass-input pl-12"
                placeholder="예: 토스뱅크"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">계좌번호 (숫자만)</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="glass-input pl-12 font-mono"
                placeholder="100012345678"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="glass-button w-full mt-4 flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : '안전하게 출금 신청'}
          </button>
        </form>

        {status.type !== 'idle' && (
          <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 relative z-10 ${
            status.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium leading-tight pt-0.5">{status.msg}</span>
          </div>
        )}
      </div>
    </main>
  );
}
