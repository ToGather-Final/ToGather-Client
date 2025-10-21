'use client';

import { useEffect, useState } from 'react';

export default function DevelopersPage() {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    // 비눗방울 생성
    const newBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="h-full relative overflow-hidden" style={{ background: '#6592FD' }}>
      {/* 비눗방울 배경 애니메이션 */}
      <div className="absolute inset-0">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white/20 border border-white/30 animate-float"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="space-y-8">
          <h1 className="text-2xl font-medium text-white">
            ToGather를 사용해주셔서<br />
            감사합니다!
          </h1>
          
          <div className="space-y-2">
            <div className="text-lg font-semibold text-white">
              고잉메리호
            </div>
            <div className="text-base text-white/90">
              김지수 김태헌 박순영 정다영 황인찬
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0px) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(50px) scale(1);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
