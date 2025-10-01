"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SignupContainer from "./SignupContainer"
import WelcomeContainer from "./WelcomeContainer"

export default function SignupFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"signup" | "welcome">("signup")

  const handleSignupComplete = () => {
    setCurrentStep("welcome")
  }

  const handleWelcomeComplete = () => {
    router.push("/account-setup")
  }

  if (currentStep === "signup") {
    return <SignupContainer onSignupComplete={handleSignupComplete} />
  }

  if (currentStep === "welcome") {
    return <WelcomeContainer onComplete={handleWelcomeComplete} />
  }

  return null
}
