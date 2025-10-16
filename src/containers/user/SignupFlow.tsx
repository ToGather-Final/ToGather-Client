"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SignupContainer from "./SignupContainer"
import WelcomeContainer from "./WelcomeContainer"
import { checkUserStatus } from "@/utils/userStatus"

export default function SignupFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"signup" | "welcome">("signup")
  const [userNickname, setUserNickname] = useState<string>("")
  const [userId, setUserId] = useState<string>("")

  const handleSignupComplete = async (nickname: string, userId?: string) => {
    setUserNickname(nickname)
    if (userId) {
      setUserId(userId)
    }
    setCurrentStep("welcome")
  }

  const handleWelcomeComplete = async () => {
    if (!userId) {
      console.error("사용자 ID가 없습니다.")
      return
    }

    try {
      // 사용자 상태 확인 후 적절한 페이지로 리다이렉트
      const userStatus = await checkUserStatus(userId)
      console.log("사용자 상태:", userStatus)
      
      switch (userStatus.nextStep) {
        case 'account-create':
          router.push("/account-create")
          break
        case 'account-complete':
          router.push("/account-create") // AccountCreateFlow에서 complete 상태로 처리
          break
        case 'group-create':
        case 'group-join':
          // 그룹 생성/참여 선택 페이지로 이동 (추후 구현)
          router.push("/group-create")
          break
        case 'group':
          router.push("/group")
          break
        default:
          router.push("/account-create")
      }
    } catch (error) {
      console.error("사용자 상태 확인 실패:", error)
      // 에러 시 기본적으로 계좌 개설 페이지로 이동
      router.push("/account-create")
    }
  }

  if (currentStep === "signup") {
    return <SignupContainer onSignupComplete={handleSignupComplete} />
  }

  if (currentStep === "welcome") {
    return <WelcomeContainer onComplete={handleWelcomeComplete} nickname={userNickname} />
  }

  return null
}
