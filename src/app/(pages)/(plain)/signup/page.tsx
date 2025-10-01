"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import BackgroundCoins from "@/components/common/BackgroundCoins"
import MainButton from "@/components/common/MainButton"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    nickname: "",
    id: "",
    password: "",
    confirmPassword: "",
  })
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignup = () => {
    // Mock signup logic
    console.log("Signup attempt:", formData)
    // After successful signup, redirect to welcome page
    router.push("/welcome")
  }

  const handleBack = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background coins */}
      <BackgroundCoins />

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={handleBack}
          className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8 py-12 relative z-10">
        {/* Logo */}
        <div className="mb-6">
          <div className="text-blue-500 text-5xl font-bold mb-2">T.</div>
        </div>

        <h1 className="text-blue-500 text-4xl font-bold text-center mb-12">ToGather</h1>

        {/* Signup form */}
        <div className="w-full max-w-sm space-y-4">
          <Input
            placeholder="닉네임"
            value={formData.nickname}
            onChange={(e) => handleInputChange("nickname", e.target.value)}
            className="h-14 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />
          <Input
            placeholder="아이디"
            value={formData.id}
            onChange={(e) => handleInputChange("id", e.target.value)}
            className="h-14 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="h-14 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />
          <Input
            type="password"
            placeholder="비밀번호 확인"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className="h-14 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />

          <MainButton onClick={handleSignup} className="mt-8">
            회원가입
          </MainButton>

          <div className="text-center mt-6">
            <span className="text-gray-600">이미 계정이 있다면? </span>
            <button onClick={() => router.push("/login")} className="text-blue-500 font-medium">
              로그인
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}