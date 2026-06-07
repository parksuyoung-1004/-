'use client';

import { useState, useEffect, useRef } from 'react';
import { PlaySquare, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdPlayer({ userId }: { userId: string }) {
  const [status, setStatus] = useState('아래 웰컴 광고를 끝까지 시청하시면 1,000 P가 즉시 지급됩니다.');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: 'jNQXAC9IVRw', 
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === 1) setIsPlaying(true); // Playing
            if (event.data === 0 && !isCompleted) { // Ended
              handleAdComplete();
            }
          }
        }
      });
    };
  }, [isCompleted]);

  const handleAdComplete = async () => {
    setStatus('광고 시청 완료! 포인트를 지급 중입니다... 🚀');
    
    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'COMPLETE_AD_VIEW' })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus('🎉 완료! 1,000 P가 성공적으로 지급되었습니다. 🎉');
        setIsCompleted(true);
      } else {
        setStatus('앗, 포인트 지급 중 에러가 발생했습니다.');
      }
    } catch (error) {
      setStatus('서버와 통신할 수 없습니다.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4 text-brand-light">
        <PlaySquare className="w-5 h-5" />
        <h3 className="font-bold text-lg">웰컴 리워드 광고</h3>
      </div>
      
      <p className="mb-6 text-slate-300 text-sm font-medium">{status}</p>
      
      <div className={`w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border transition-all duration-500 relative ${isCompleted ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-slate-700/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]'}`}>
        {!isCompleted ? (
          <>
            <div id="youtube-player" className="w-full h-full absolute top-0 left-0"></div>
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none z-10">
                <Loader2 className="w-10 h-10 text-brand-neon animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-950/80 text-emerald-400">
            <CheckCircle2 className="w-16 h-16 mb-4 animate-bounce" />
            <span className="font-bold text-2xl tracking-tight">지급 완료</span>
          </div>
        )}
      </div>

      {!isCompleted && (
        <div className="mt-4 px-4 py-3 bg-brand-dark/20 border border-brand/20 rounded-xl w-full max-w-sm flex items-center justify-center gap-2 text-brand-light text-sm">
          <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse"></span>
          영상을 끝까지 시청해야 보상이 지급됩니다
        </div>
      )}
    </div>
  );
}
