"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import BackgroundCoins from "@/components/common/BackgroundCoins"
import MainButton from "@/components/common/MainButton"

interface SignupContainerProps {
  onSignupComplete: () => void
}

export default function SignupContainer({ onSignupComplete }: SignupContainerProps) {
  const [formData, setFormData] = useState({
    nickname: "",
    id: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignup = () => {
    // Mock signup logic
    console.log("Signup attempt:", formData)
    // After successful signup, move to welcome
    onSignupComplete()
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background coins */}
      <BackgroundCoins />

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8 py-12 relative z-10">
        {/* Logo */}
        <div className="mb-6">
          <img 
            src="/images/logo-blue.png"
            alt="ToGather Logo"
            className="h-16 w-16 object-contain"
          />
        </div>

        <h1 className="text-4xl font-bold text-center mb-12" style={{ color: '#6592FD' }}>ToGather</h1>

        {/* Signup form */}
        <div className="w-full max-w-sm space-y-4">
          <Input
            placeholder="닉네임"
            value={formData.nickname}
            onChange={(e) => handleInputChange("nickname", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />
          <Input
            placeholder="아이디"
            value={formData.id}
            onChange={(e) => handleInputChange("id", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />
          <Input
            type="password"
            placeholder="비밀번호 확인"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />

          <MainButton onClick={handleSignup} className="mt-8">
            회원가입
          </MainButton>
        </div>
      </div>
    </div>
  )
}
