"use client"

import Image from "next/image"

interface GroupCompleteContainerProps {
  onFinish?: () => void
}

export default function GroupCompleteContainer({ onFinish }: GroupCompleteContainerProps) {
  return (
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 relative z-10 flex-shrink-0">
        <Image 
          src="/images/logo-blue.webp"
          alt="ToGather Logo"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Title Section */}
        <div className="px-8">
          <h1 
            className="text-4xl font-extrabold text-center mb-4 leading-tight"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #264989, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 900,
              WebkitTextStroke: '0.4px #264989'
            }}
          >
            고잉메리호
            <br />
            그룹이 생성됐어요
          </h1>

          <p 
            className="text-lg font-semibold text-center mb-4"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #234085, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            그룹 코드 혹은 초대 링크를 공유하세요
          </p>
        </div>

        {/* Group Image - Full Width */}
        <div className="w-full mb-4 relative h-[400px]">
          <Image 
            src="/images/group-create.webp"
            alt="Group Created"
            fill
            className="object-contain"
          />
        </div>

        {/* Code and Link Section */}
        <div className="px-8 w-full">
          {/* Code Section */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">코드 번호</p>
            <p 
              className="text-5xl font-medium mb-6"
              style={{ 
                backgroundImage: 'linear-gradient(to right, #345699, #111D33)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              1A4P
            </p>
          </div>

          {/* Link Box */}
          <div className="w-full max-w-sm mx-auto mb-8">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center">
              <p className="text-base text-gray-700">https://github.com/Jixoo-IT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
