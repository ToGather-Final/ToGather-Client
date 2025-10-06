"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import GroupCreateContainer from "./GroupCreateContainer"
import PayAccountSetupContainer from "./PayAccountSetupContainer"
import GroupCompleteContainer from "./GroupCompleteContainer"

export default function GroupCreateFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"group" | "pay" | "complete">("group")

  const handleGroupCreateComplete = () => {
    setCurrentStep("pay")
  }

  const handlePaySetupComplete = () => {
    setCurrentStep("complete")
  }

  const handleFinish = () => {
    // 그룹 메인 페이지로 이동
    router.push("/group")
  }

  if (currentStep === "group") {
    return <GroupCreateContainer onComplete={handleGroupCreateComplete} />
  }

  if (currentStep === "pay") {
    return <PayAccountSetupContainer onComplete={handlePaySetupComplete} />
  }

  if (currentStep === "complete") {
    return <GroupCompleteContainer onFinish={handleFinish} />
  }

  return null
}
