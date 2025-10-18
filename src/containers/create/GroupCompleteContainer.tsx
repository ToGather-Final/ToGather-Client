"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getGroupStatus } from "@/utils/api"
import { useGroupId } from "@/contexts/groupIdContext"
import MainButton from "@/components/common/MainButton"
import type { ApiErrorWithStatus } from "@/types/api/auth"

interface GroupCompleteContainerProps {
  onFinish?: () => void
  groupName?: string
  invitationCode?: string
  groupId?: string
}

export default function GroupCompleteContainer({ onFinish, groupName = "고잉메리호", invitationCode = "1A4P", groupId }: GroupCompleteContainerProps) {
  const router = useRouter()
  const { setGroupId } = useGroupId()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    if (!groupId) {
      setError("그룹 정보를 찾을 수 없습니다.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("그룹 상태 확인 시작:", groupId)
      const status = await getGroupStatus(groupId)
      console.log("그룹 상태:", status)

      if (!status.isFull) {
        setError(`아직 멤버들이 모두 들어오지 않았습니다. (${status.currentMembers}/${status.maxMembers}명)`)
        return
      }

      // 그룹이 꽉 찼으면 Context에 groupId 설정하고 그룹 페이지로 이동
      setGroupId(groupId)
      console.log("그룹 시작 - groupId 설정:", groupId)
      
      if (onFinish) {
        onFinish()
      } else {
        router.push("/group")
      }
    } catch (err) {
      console.error("그룹 상태 확인 실패:", err)
      
      let errorMessage = "그룹 상태 확인에 실패했습니다. 다시 시도해주세요."
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as ApiErrorWithStatus).message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 relative z-10 flex-shrink-0">
        <img 
          src="/images/logo-blue.png"
          alt="ToGather Logo"
          className="h-8 w-8 object-contain"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start relative z-10 pt-24">
        {/* Title Section with Image Overlay */}
        <div className="w-full relative">
          {/* Group Image - Full Width */}
          <div className="w-full">
            <img 
              src="/images/group-create.png"
              alt="Group Created"
              className="w-full h-auto object-contain"
            />
          </div>
          
          {/* Text Overlay */}
          <div className="absolute -top-24 left-0 right-0 px-8">
            <h1 
              className="text-3xl font-extrabold text-center mb-2 leading-tight"
              style={{ 
                backgroundImage: 'linear-gradient(to right, #264989, #6989D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 900,
                WebkitTextStroke: '0.4px #264989'
              }}
            >
              {groupName}
              <br />
              그룹이 생성됐어요
            </h1>

            <p 
              className="text-base font-semibold text-center"
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
        </div>

        {/* Code and Link Section */}
        <div className="px-8 w-full">
          {/* Code Section */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-1">코드 번호</p>
            <p 
              className="text-4xl font-medium mb-4"
              style={{ 
                backgroundImage: 'linear-gradient(to right, #345699, #111D33)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {invitationCode}
            </p>
          </div>

          {/* Link Box */}
          <div className="w-full max-w-sm mx-auto mb-4">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center">
              <p className="text-base text-gray-700">https://github.com/Jixoo-IT</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full max-w-sm mx-auto mb-4">
              <p className="text-sm text-red-500 text-center">{error}</p>
            </div>
          )}

          {/* Start Button */}
          <div className="w-full max-w-sm mx-auto">
            <MainButton 
              onClick={handleStart}
              disabled={isLoading || !groupId}
              className="w-full"
            >
              {isLoading ? "확인 중..." : "시작하기"}
            </MainButton>
          </div>
        </div>
      </div>
    </div>
  )
}
