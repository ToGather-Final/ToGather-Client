"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AccountSetupContainer from "./AccountSetupContainer"
import AccountCompleteContainer from "./AccountCompleteContainer"

export default function AccountCreateFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"setup" | "complete">("setup")

  const handleSetupComplete = () => {
    setCurrentStep("complete")
  }

  const handleCreateGroup = () => {
    router.push("/group-create")
  }

  const handleJoinGroup = () => {
    router.push("/group-join")
  }

  if (currentStep === "setup") {
    return <AccountSetupContainer onComplete={handleSetupComplete} />
  }

  if (currentStep === "complete") {
    return <AccountCompleteContainer onCreateGroup={handleCreateGroup} onJoinGroup={handleJoinGroup} />
  }

  return null
}