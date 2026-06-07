'use client';
import { createClient } from '@/utils/supabase/client';
import { LogIn } from 'lucide-react';

export default function AuthForm() {
  const supabase = createClient();

  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('로그인 에러:', error.message);
      alert('로그인 중 에러가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <button 
        onClick={() => handleSocialLogin('kakao')}
        className="relative overflow-hidden w-full py-4 bg-[#FEE500] text-[#000000] font-bold rounded-xl shadow-lg hover:bg-[#E5CF00] transition-all hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-3 group"
      >
        <div className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="text-xl">💬</span> 
        <span>카카오로 1초 만에 시작하기</span>
      </button>

      <button 
        onClick={() => handleSocialLogin('google')}
        className="relative overflow-hidden w-full py-4 bg-white/10 text-white font-bold rounded-xl shadow-lg hover:bg-white/20 transition-all border border-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-3 group backdrop-blur-sm"
      >
        <span className="text-xl">🌐</span> 
        <span>Google로 안전하게 시작</span>
      </button>
    </div>
  );
}
