"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getGroupStatus } from "@/utils/api"
import { useGroupId } from "@/contexts/groupIdContext"
import { checkGroupCreated, clearGroupCreated } from "@/utils/userStatus"
import { getUserId } from "@/utils/token"
import MainButton from "@/components/common/MainButton"
import type { ApiErrorWithStatus } from "@/types/api/auth"

export default function GroupCreatedContainer() {
  const router = useRouter()
  const { setGroupId } = useGroupId()
  const [groupInfo, setGroupInfo] = useState<{
    groupId: string
    groupName: string
    invitationCode: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("=== GroupCreatedContainer useEffect 시작 ===")
    const userId = getUserId()
    console.log("GroupCreatedContainer - userId:", userId)
    
    if (!userId) {
      console.log("GroupCreatedContainer - userId 없음, 로그인 페이지로 이동")
      router.push("/login")
      return
    }

    // localStorage 직접 확인
    const hasGroup = localStorage.getItem(`hasGroup_${userId}`)
    const groupCreated = localStorage.getItem(`groupCreated_${userId}`)
    const createdGroupId = localStorage.getItem(`createdGroupId_${userId}`)
    const createdGroupName = localStorage.getItem(`createdGroupName_${userId}`)
    const createdInvitationCode = localStorage.getItem(`createdInvitationCode_${userId}`)
    
    console.log("GroupCreatedContainer - localStorage 직접 확인:")
    console.log("  hasGroup:", hasGroup)
    console.log("  groupCreated:", groupCreated)
    console.log("  createdGroupId:", createdGroupId)
    console.log("  createdGroupName:", createdGroupName)
    console.log("  createdInvitationCode:", createdInvitationCode)

    // 그룹 생성 완료 상태 확인
    const groupCreatedInfo = checkGroupCreated(userId)
    console.log("GroupCreatedContainer - checkGroupCreated 결과:", groupCreatedInfo)
    
    if (groupCreatedInfo.isGroupCreated && groupCreatedInfo.groupId && groupCreatedInfo.groupName && groupCreatedInfo.invitationCode) {
      console.log("GroupCreatedContainer - 그룹 정보 설정:", groupCreatedInfo)
      setGroupInfo({
        groupId: groupCreatedInfo.groupId,
        groupName: groupCreatedInfo.groupName,
        invitationCode: groupCreatedInfo.invitationCode
      })
    } else {
      console.log("GroupCreatedContainer - 그룹 생성 완료 상태 없음, 그룹 생성 페이지로 이동")
      console.log("  isGroupCreated:", groupCreatedInfo.isGroupCreated)
      console.log("  groupId:", groupCreatedInfo.groupId)
      console.log("  groupName:", groupCreatedInfo.groupName)
      console.log("  invitationCode:", groupCreatedInfo.invitationCode)
      // 그룹 생성 완료 상태가 없으면 그룹 생성 페이지로 이동
      router.push("/group-create")
    }
    console.log("=== GroupCreatedContainer useEffect 끝 ===")
  }, [router])

  const handleStart = async () => {
    console.log("=== handleStart 시작 ===")
    console.log("handleStart - groupInfo:", groupInfo)
    
    if (!groupInfo) {
      console.log("handleStart - groupInfo 없음")
      setError("그룹 정보를 찾을 수 없습니다.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("그룹 상태 확인 시작:", groupInfo.groupId)
      const status = await getGroupStatus(groupInfo.groupId)
      console.log("그룹 상태:", status)

      if (!status.isFull) {
        console.log("그룹이 아직 꽉 차지 않음")
        setError(`아직 멤버들이 모두 들어오지 않았습니다. (${status.currentMembers}/${status.maxMembers}명)`)
        return
      }

      // 그룹이 꽉 찼으면 Context에 groupId 설정하고 그룹 페이지로 이동
      setGroupId(groupInfo.groupId)
      console.log("그룹 시작 - groupId 설정:", groupInfo.groupId)
      
      // 그룹 페이지로 이동하기 전에 상태 초기화
      const userId = getUserId()
      console.log("handleStart - userId:", userId)
      if (userId) {
        console.log("handleStart - clearGroupCreated 호출 전 localStorage 상태:")
        console.log("  groupCreated:", localStorage.getItem(`groupCreated_${userId}`))
        console.log("  createdGroupId:", localStorage.getItem(`createdGroupId_${userId}`))
        
        clearGroupCreated(userId)
        console.log("그룹 시작 - 그룹 생성 완료 상태 초기화")
        
        console.log("handleStart - clearGroupCreated 호출 후 localStorage 상태:")
        console.log("  groupCreated:", localStorage.getItem(`groupCreated_${userId}`))
        console.log("  createdGroupId:", localStorage.getItem(`createdGroupId_${userId}`))
      }
      
      console.log("handleStart - /group으로 이동")
      router.push("/group")
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
      console.log("=== handleStart 끝 ===")
    }
  }

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
              {groupInfo.groupName}
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
              {groupInfo.invitationCode}
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
              disabled={isLoading}
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
