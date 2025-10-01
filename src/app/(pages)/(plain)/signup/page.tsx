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