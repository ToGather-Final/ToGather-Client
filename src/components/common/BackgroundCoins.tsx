interface BackgroundCoinsProps {
  className?: string
}

export default function BackgroundCoins({ className = "" }: BackgroundCoinsProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* 큰 동그라미 - 오른쪽 위 */}
      <div className="absolute top-16 right-8 w-32 h-32 bg-purple-200 rounded-full opacity-60 z-0"></div>
      
      {/* 중간 동그라미 - 왼쪽 아래 */}
      <div className="absolute bottom-32 left-4 w-24 h-24 bg-blue-200 rounded-full opacity-50 z-0"></div>
      
      {/* 작은 동그라미들 - 배경 장식용 */}
      <div className="absolute top-32 left-8 w-8 h-8 bg-purple-300 rounded-full opacity-40 z-0"></div>
      <div className="absolute top-48 right-16 w-12 h-12 bg-blue-300 rounded-full opacity-45 z-0"></div>
      <div className="absolute bottom-48 right-12 w-16 h-16 bg-purple-100 rounded-full opacity-50 z-0"></div>
      <div className="absolute bottom-16 left-16 w-6 h-6 bg-blue-400 rounded-full opacity-35 z-0"></div>
      
      {/* 추가 작은 동그라미들 */}
      <div className="absolute top-24 left-1/4 w-4 h-4 bg-purple-200 rounded-full opacity-30 z-0"></div>
      <div className="absolute top-40 right-1/4 w-6 h-6 bg-blue-200 rounded-full opacity-40 z-0"></div>
      <div className="absolute bottom-40 left-1/3 w-5 h-5 bg-purple-300 rounded-full opacity-35 z-0"></div>
      <div className="absolute bottom-24 right-1/3 w-7 h-7 bg-blue-300 rounded-full opacity-45 z-0"></div>
    </div>
  )
}
