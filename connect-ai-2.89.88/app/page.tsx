import { createClient } from '@/utils/supabase/server';
import AdPlayer from '../components/AdPlayer';
import AuthForm from '../components/AuthForm';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export default async function Home() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 relative">
      
      {/* Header/Nav (Simplified) */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap className="w-8 h-8 text-brand-neon animate-pulse" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-neon to-brand-light">
            RewardClick
          </span>
        </div>
        {session && (
          <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition">
            대시보드
          </Link>
        )}
      </header>

      <div className="max-w-4xl w-full text-center mt-20 z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-dark/20 border border-brand-light/30 text-brand-light mb-8 animate-glow">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">리워드 플랫폼의 새로운 기준</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg">
          시청만 해도 쏟아지는 <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-neon to-blue-400">
            초고속 수익화 경험
          </span>
        </h1>
        
        <p className="text-lg md:text-xl mb-12 text-slate-300 max-w-2xl mx-auto leading-relaxed">
          웹 3.0 시대의 진정한 리워드 시스템. 웰컴 광고 하나로 시작되는 무한한 수익 창출의 세계로 초대합니다.
        </p>
        
        <div className="glass-panel p-8 max-w-md mx-auto">
          {session ? (
            <div className="flex flex-col items-center gap-6">
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-full mb-2">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold">환영합니다!</h2>
              <p className="text-slate-400">수익 창출을 시작할 준비가 되었습니다.</p>
              
              <Link href="/dashboard" className="glass-button w-full flex items-center justify-center gap-2 text-lg mt-4">
                내 수익 확인하기 <ArrowRight className="w-5 h-5" />
              </Link>
              
              <div className="w-full mt-4">
                <AdPlayer userId={session.user.id} />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-2">지금 바로 시작하세요</h2>
              <p className="text-slate-400 mb-8 text-sm">3초만에 가입하고 1,000P 받기</p>
              <AuthForm />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
