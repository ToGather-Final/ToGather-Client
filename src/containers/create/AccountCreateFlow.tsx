"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AccountSetupContainer from "./AccountSetupContainer"
import AccountCompleteContainer from "./AccountCompleteContainer"
import { checkUserStatus, markAccountCompleteSeen } from "@/utils/userStatus"
import { getUserId } from "@/utils/token"
import { getMyInfo } from "@/utils/api"

export default function AccountCreateFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"setup" | "complete">("setup")
  const [userNickname, setUserNickname] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // 페이지 로드 시 사용자 상태 및 정보 확인
  useEffect(() => {
    const initialize = async () => {
      try {
        const userId = getUserId()
        if (userId) {
          // 사용자 정보 조회 (먼저 수행)
          try {
            const userInfo = await getMyInfo()
            setUserNickname(userInfo.nickname)
          } catch (error) {
            console.error("사용자 정보 조회 실패:", error)
            // 실패 시 기본값 사용
            setUserNickname("")
          }
          
          // 사용자 상태 확인
          const userStatus = await checkUserStatus(userId)
          if (userStatus.nextStep === 'account-complete') {
            setCurrentStep("complete")
          }
        }
      } catch (error) {
        console.error("초기화 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initialize()
  }, [])

  const handleSetupComplete = async () => {
    // 사용자 정보가 아직 없으면 가져오기
    if (!userNickname) {
      try {
        const userInfo = await getMyInfo()
        setUserNickname(userInfo.nickname)
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error)
        setUserNickname("회원")
      }
    }
    setCurrentStep("complete")
  }

  const handleCreateGroup = () => {
    // 계좌 완료 화면을 봤다는 상태 업데이트
    const userId = getUserId()
    if (userId) {
      markAccountCompleteSeen(userId)
    }
    router.push("/group-create")
  }

  const handleJoinGroup = () => {
    // 계좌 완료 화면을 봤다는 상태 업데이트
    const userId = getUserId()
    if (userId) {
      markAccountCompleteSeen(userId)
    }
    router.push("/group-join")
  }

  // 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (currentStep === "setup") {
    return <AccountSetupContainer onComplete={handleSetupComplete} />
  }

  if (currentStep === "complete") {
    return (
      <AccountCompleteContainer 
        onCreateGroup={handleCreateGroup} 
        onJoinGroup={handleJoinGroup}
        userNickname={userNickname || "회원"}
      />
    )
  }

  return null
}