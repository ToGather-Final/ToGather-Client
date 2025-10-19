"use client"

import { useState, useEffect } from "react"
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
  // 로그인 응답에서 받은 그룹 정보
  loginGroupInfo?: {
    groupName: string
    groupCode: string
    groupId: string
  }
}

export default function GroupCompleteContainer({ 
  onFinish, 
  groupName, 
  invitationCode, 
  groupId,
  loginGroupInfo 
}: GroupCompleteContainerProps) {
  const router = useRouter()
  const { setGroupId } = useGroupId()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionGroupInfo, setSessionGroupInfo] = useState<{
    groupName: string
    groupCode: string
    groupId: string
  } | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  // useEffect에서 sessionStorage의 그룹 정보 확인
  useEffect(() => {
    const loginGroupInfoStr = sessionStorage.getItem('loginGroupInfo')
    if (loginGroupInfoStr) {
      try {
        const loginGroupInfo = JSON.parse(loginGroupInfoStr)
        // console.log("GroupCompleteContainer - 로그인 응답에서 받은 그룹 정보:", loginGroupInfo)
        
        setSessionGroupInfo({
          groupName: loginGroupInfo.groupName,
          groupCode: loginGroupInfo.groupCode,
          groupId: loginGroupInfo.groupId
        })
        
        // 사용 후 sessionStorage에서 제거
        sessionStorage.removeItem('loginGroupInfo')
        // console.log("GroupCompleteContainer - 로그인 응답 그룹 정보 사용 완료")
      } catch (error) {
        // console.error("로그인 응답 그룹 정보 파싱 실패:", error)
        sessionStorage.removeItem('loginGroupInfo')
      }
    }
    setIsSessionLoading(false)
  }, [])

  // 데이터 소스 우선순위:
  // 1. props로 직접 전달된 값 (그룹 생성 직후)
  // 2. sessionStorage의 로그인 응답 값 (재로그인 시)
  // 3. loginGroupInfo props (fallback)
  // 4. 기본값 (fallback)
  const displayGroupName = groupName || sessionGroupInfo?.groupName || loginGroupInfo?.groupName || "고잉메리호"
  const displayInvitationCode = invitationCode || sessionGroupInfo?.groupCode || loginGroupInfo?.groupCode || "1A4P"
  const displayGroupId = groupId || sessionGroupInfo?.groupId || loginGroupInfo?.groupId

  // 그룹 상태 폴링 (그룹이 꽉 차지 않은 경우에만)
  useEffect(() => {
    if (!displayGroupId) return
    
    const pollGroupStatus = async () => {
      try {
        const status = await getGroupStatus(displayGroupId)
        // console.log("GroupCompleteContainer - 그룹 상태:", status)
        
        // 그룹이 꽉 찬 경우 자동으로 메인 그룹 페이지로 이동
        if (status.isFull) {
          // console.log("GroupCompleteContainer - 그룹이 꽉 참, 메인 그룹 페이지로 이동")
          setGroupId(displayGroupId)
          router.push('/group')
        }
      } catch (error) {
        // console.error('GroupCompleteContainer - 그룹 상태 확인 실패:', error)
      }
    }
    
    // 즉시 한 번 실행
    pollGroupStatus()
    
    // 3초마다 폴링
    const interval = setInterval(pollGroupStatus, 3000)
    
    return () => clearInterval(interval)
  }, [displayGroupId, setGroupId, router])

  // 로딩 중일 때 로딩 화면 표시
  if (isSessionLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  const handleStart = async () => {
    if (!displayGroupId) {
      setError("그룹 정보를 찾을 수 없습니다.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // console.log("그룹 상태 확인 시작:", displayGroupId)
      const status = await getGroupStatus(displayGroupId)
      // console.log("그룹 상태:", status)

      if (!status.isFull) {
        setError(`아직 멤버들이 모두 들어오지 않았습니다. (${status.currentMembers}/${status.maxMembers}명)`)
        return
      }

      // 그룹이 꽉 찼으면 Context에 groupId 설정하고 그룹 페이지로 이동
      setGroupId(displayGroupId)
      // console.log("그룹 시작 - groupId 설정:", displayGroupId)
      
      if (onFinish) {
        onFinish()
      } else {
        router.push("/group")
      }
    } catch (err) {
      // console.error("그룹 상태 확인 실패:", err)
      
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
        <Image 
          src="/images/logo-blue.webp"
          alt="ToGather Logo"
          width={32}
          height={32}
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
              {displayGroupName}
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
              {displayInvitationCode}
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
              disabled={isLoading || !displayGroupId}
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
