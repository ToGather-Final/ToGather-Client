"use client"

import Image from "next/image"
import MainButton from "@/components/common/MainButton"

interface AccountCompleteContainerProps {
  onCreateGroup: () => void
  onJoinGroup: () => void
  userNickname: string
}

export default function AccountCompleteContainer({ 
  onCreateGroup, 
  onJoinGroup,
  userNickname
}: AccountCompleteContainerProps) {
  return (
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 relative z-10">
        <Image 
          src="/images/logo-blue.webp"
          alt="ToGather Logo"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Title */}
        <h1 
          className="text-4xl font-extrabold text-center mb-8 leading-tight"
          style={{ 
            backgroundImage: 'linear-gradient(to right, #264989, #6989D4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 900,
            WebkitTextStroke: '0.4px #264989'
          }}
        >
          {userNickname}의
          <br />
          투자 계좌가
          <br />
          개설되었어요
        </h1>

        {/* Account Image */}
        <div className="mb-8 relative w-80 h-80">
          <Image 
            src="/images/account-create.webp"
            alt="Account Created"
            fill
            priority
            fetchPriority="high"
            className="object-contain"
          />
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <MainButton onClick={onCreateGroup}>
            그룹 생성하기
          </MainButton>
          <MainButton onClick={onJoinGroup}>
            그룹 참여하기
          </MainButton>
        </div>
      </div>
    </div>
  )
}
