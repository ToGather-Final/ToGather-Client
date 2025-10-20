"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getGroupStatus } from "@/utils/api"
import { useGroupId } from "@/contexts/groupIdContext"
import { GroupInfo } from "@/types/api/auth"
import type { ApiErrorWithStatus } from "@/types/api/auth"
import Image from "next/image"

export default function GroupWaitingPage() {
  const router = useRouter()
  const params = useParams()
  const { setGroupId } = useGroupId()
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [groupStatus, setGroupStatus] = useState<{
    currentMembers: number
    maxMembers: number
    isFull: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // console.log("=== GroupWaitingPage useEffect 시작 ===")
    const groupId = params.groupId as string
    // console.log("GroupWaitingPage - groupId:", groupId)
    
    if (!groupId) {
      // console.log("GroupWaitingPage - groupId 없음, 로그인 페이지로 이동")
      router.push("/login")
      return
    }

    // 로그인 응답에서 받은 그룹 정보 확인 (sessionStorage에서)
    const loginGroupInfoStr = sessionStorage.getItem('loginGroupInfo')
    if (loginGroupInfoStr) {
      try {
        const loginGroupInfo: GroupInfo = JSON.parse(loginGroupInfoStr)
        // console.log("GroupWaitingPage - 로그인 응답에서 받은 그룹 정보:", loginGroupInfo)
        
        // 로그인 응답의 그룹 정보 사용
        setGroupInfo(loginGroupInfo)
        
        // 사용 후 sessionStorage에서 제거
        sessionStorage.removeItem('loginGroupInfo')
        // console.log("GroupWaitingPage - 로그인 응답 그룹 정보 사용 완료")
      } catch (error) {
        // console.error("로그인 응답 그룹 정보 파싱 실패:", error)
        sessionStorage.removeItem('loginGroupInfo')
      }
    }
    // console.log("=== GroupWaitingPage useEffect 끝 ===")
  }, [params.groupId, router])

  // 그룹 상태 폴링
  useEffect(() => {
    if (!groupInfo) return

    const pollGroupStatus = async () => {
      try {
        // console.log("그룹 상태 확인:", groupInfo.groupId)
        const status = await getGroupStatus(groupInfo.groupId)
        // console.log("그룹 상태:", status)
        
        setGroupStatus({
          currentMembers: status.currentMembers,
          maxMembers: status.maxMembers,
          isFull: status.isFull
        })

        // 그룹이 꽉 찼으면 그룹 페이지로 이동
        if (status.isFull) {
          // console.log("그룹이 꽉 참 - 그룹 페이지로 이동")
          // console.log("🔑 GroupWaitingPage - setGroupId 호출:", groupInfo.groupId)
          setGroupId(groupInfo.groupId)
          // console.log("✅ GroupWaitingPage - setGroupId 완료")
          router.push("/group")
        }
      } catch (err) {
        // console.error("그룹 상태 확인 실패:", err)
        
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
  }, [groupInfo, setGroupId, router])

  // 진행률 계산
  const progressPercentage = groupStatus 
    ? Math.min((groupStatus.currentMembers / groupStatus.maxMembers) * 100, 100)
    : 0

  if (!groupInfo) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 relative z-10 flex-shrink-0">
        <Image 
          src="/images/logo-blue.png"
          alt="ToGather Logo"
          width={32}
          height={32}
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
            {groupInfo.groupName}에 입장하고 있어요
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
