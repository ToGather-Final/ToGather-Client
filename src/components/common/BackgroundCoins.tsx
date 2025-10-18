import Image from 'next/image'

interface BackgroundCoinsProps {
  className?: string
}

export default function BackgroundCoins({ className = "" }: BackgroundCoinsProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Star coin top right */}
      <div className="absolute top-10 -right-4 w-36 h-36 transform -rotate-42 z-0">
        <Image 
          src="/images/star_coin.webp" 
          alt="Star coin" 
          width={144}
          height={144}
          priority
          fetchPriority="high"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>

      {/* Smile coin bottom left */}
      <div className="absolute bottom-64 -left-2 w-40 h-40 transform rotate-28 scale-x-[-1] z-0">
        <Image 
          src="/images/smile_coin.webp" 
          alt="Smile coin" 
          width={160}
          height={160}
          priority
          fetchPriority="high"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>

      {/* Heart coin bottom right - LCP 이미지 */}
      <div className="absolute -bottom-6 -right-4 w-56 h-56 transform -rotate-32 z-0">
        <Image 
          src="/images/heart_coin.webp" 
          alt="Heart coin" 
          width={224}
          height={224}
          priority
          fetchPriority="high"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
    </div>
  )
}
