"use client"

import MainButton from "@/components/common/MainButton"

interface AccountCompleteContainerProps {
  onCreateGroup: () => void
  onJoinGroup: () => void
}

export default function AccountCompleteContainer({ 
  onCreateGroup, 
  onJoinGroup 
}: AccountCompleteContainerProps) {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 relative z-10">
        <img 
          src="/images/logo-blue.png"
          alt="ToGather Logo"
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
          지구님의
          <br />
          투자 계좌가
          <br />
          개설되었어요
        </h1>

        {/* Account Image */}
        <div className="mb-8">
          <img 
            src="/images/account-create.png"
            alt="Account Created"
            className="w-80 h-auto object-contain"
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
