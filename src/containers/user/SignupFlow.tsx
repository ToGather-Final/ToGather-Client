"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SignupContainer from "./SignupContainer"
import WelcomeContainer from "./WelcomeContainer"

export default function SignupFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"signup" | "welcome">("signup")
  const [userNickname, setUserNickname] = useState<string>("")

  const handleSignupComplete = (nickname: string) => {
    setUserNickname(nickname)
    setCurrentStep("welcome")
  }

  const handleWelcomeComplete = () => {
    router.push("/account-create")
  }

  if (currentStep === "signup") {
    return <SignupContainer onSignupComplete={handleSignupComplete} />
  }

  if (currentStep === "welcome") {
    return <WelcomeContainer onComplete={handleWelcomeComplete} nickname={userNickname} />
  }

  return null
}
