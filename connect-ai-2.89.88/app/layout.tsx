import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RewardClick | 초고속 수익화 플랫폼',
  description: '최고의 보상을 제공하는 블록체인 기반 광고 리워드 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable}`}>
      <body className="font-sans min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Animated Background blobs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-dark/20 blur-[120px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-neon/10 blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="flex-grow z-0">
          {children}
        </div>
      </body>
    </html>
  );
}
