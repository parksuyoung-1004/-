import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Wallet, TrendingUp, History, UserCircle, ChevronLeft, CreditCard } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  // 1. 유저 정보 조회 (회원 코드, 포인트 등)
  const { data: userData } = await supabase
    .from('users')
    .select('member_code, point_balance')
    .eq('id', session.user.id)
    .single();

  // 2. 가입 상태 (광고 시청 여부로 판단)
  const { data: adViews } = await supabase
    .from('ad_views')
    .select('status')
    .eq('user_id', session.user.id)
    .eq('source_user_id', session.user.id)
    .single();

  const isAdCompleted = adViews?.status === 'COMPLETED';

  // 3. 오늘 발생한 수익 합계 (point_transactions 기준)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayTransactions } = await supabase
    .from('point_transactions')
    .select('amount')
    .eq('user_id', session.user.id)
    .gte('created_at', today.toISOString());

  const todayPoints = todayTransactions?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto pt-10">
      
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-slate-800 transition">
            <ChevronLeft className="w-6 h-6 text-slate-300" />
          </Link>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-neon to-blue-400">
            대시보드
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* 회원 정보 카드 */}
        <div className="glass-panel p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/10 rounded-full blur-2xl group-hover:bg-brand-neon/20 transition-all"></div>
          <UserCircle className="w-8 h-8 text-brand-light mb-4" />
          <p className="text-slate-400 text-sm mb-1">회원 코드</p>
          <p className="text-xl font-bold mb-4 font-mono">{userData?.member_code || '발급 대기'}</p>
          
          <p className="text-slate-400 text-sm mb-1">계정 상태</p>
          {isAdCompleted ? (
            <p className="text-emerald-400 font-bold flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></span>
              활성 (웰컴 보상 완료)
            </p>
          ) : (
            <p className="text-amber-400 font-bold flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]"></span>
              대기 (광고 시청 필요)
            </p>
          )}
        </div>

        {/* 포인트 메인 카드 */}
        <div className="glass-panel p-8 md:col-span-2 flex flex-col justify-between relative overflow-hidden group border-brand-light/20">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/20 to-transparent"></div>
          <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-brand-neon/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-brand-neon" />
              <p className="text-slate-300 text-sm font-medium">출금 가능 포인트</p>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              {userData?.point_balance?.toLocaleString() || 0} 
              <span className="text-3xl font-medium text-brand-light ml-2">P</span>
            </h2>
          </div>
          
          <div className="flex justify-end mt-8 relative z-10">
            <Link href="/withdrawal" className="glass-button flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> 출금 신청
            </Link>
          </div>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h3 className="text-xl font-bold">수익 요약</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-xl">
            <History className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">오늘의 수익</p>
            <p className="text-2xl font-bold text-emerald-400">+ {todayPoints.toLocaleString()} P</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-xl">
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">누적 보유 수익</p>
            <p className="text-2xl font-bold text-blue-400">+ {userData?.point_balance?.toLocaleString() || 0} P</p>
          </div>
        </div>
      </div>

    </main>
  );
}
