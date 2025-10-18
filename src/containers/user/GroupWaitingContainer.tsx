"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getGroupStatus } from "@/utils/api"
import { useGroupId } from "@/contexts/groupIdContext"
import type { ApiErrorWithStatus } from "@/types/api/auth"

interface GroupWaitingContainerProps {
  groupId: string
  groupName: string
}

export default function GroupWaitingContainer({ groupId, groupName }: GroupWaitingContainerProps) {
  const router = useRouter()
  const { setGroupId } = useGroupId()
  const [groupStatus, setGroupStatus] = useState<{
    currentMembers: number
    maxMembers: number
    isFull: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 그룹 상태 폴링
  useEffect(() => {
    const pollGroupStatus = async () => {
      try {
        console.log("그룹 상태 확인:", groupId)
        const status = await getGroupStatus(groupId)
        console.log("그룹 상태:", status)
        
        setGroupStatus({
          currentMembers: status.currentMembers,
          maxMembers: status.maxMembers,
          isFull: status.isFull
        })

        // 그룹이 꽉 찼으면 그룹 페이지로 이동
        if (status.isFull) {
          console.log("그룹이 꽉 참 - 그룹 페이지로 이동")
          setGroupId(groupId)
          router.push("/group")
        }
      } catch (err) {
        console.error("그룹 상태 확인 실패:", err)
        
        let errorMessage = "그룹 상태 확인에 실패했습니다."
        
        if (err instanceof Error) {
          errorMessage = err.message
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessage = (err as ApiErrorWithStatus).message
        }
        
        setError(errorMessage)
      }
    }

    // 즉시 한 번 실행
    pollGroupStatus()

    // 3초마다 폴링
    const interval = setInterval(pollGroupStatus, 3000)

    return () => clearInterval(interval)
  }, [groupId, setGroupId, router])

  // 진행률 계산
  const progressPercentage = groupStatus 
    ? Math.min((groupStatus.currentMembers / groupStatus.maxMembers) * 100, 100)
    : 0

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
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #264989, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            대기중...
          </h1>
          <p 
            className="text-lg font-semibold"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #234085, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {groupName}에 입장하고 있어요
          </p>
        </div>

        {/* Progress Section */}
        <div className="w-full max-w-sm">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Member Count */}
          {groupStatus && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {groupStatus.currentMembers}/{groupStatus.maxMembers}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                초대 링크로 그룹원들이 들어오고 있어요!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
