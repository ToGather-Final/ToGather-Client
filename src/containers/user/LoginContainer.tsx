"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import BackgroundCoins from "@/components/common/BackgroundCoins"
import MainButton from "@/components/common/MainButton"

export default function LoginFlow() {
  const [formData, setFormData] = useState({
    loginId: "",
    loginPassword: "",
  })
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogin = () => {
    // Mock login logic
    console.log("Login attempt:", formData)
    // 로그임 성공하면 여기서 로직 추가가
    // 예를 들면 router.push("/group")
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background coins */}
      <BackgroundCoins />

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8 relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/images/logo-blue.png"
            alt="ToGather Logo"
            className="h-16 w-16 object-contain"
          />
        </div>

        <h1 className="text-5xl font-bold text-center mb-16" style={{ color: '#6592FD' }}>ToGather</h1>

        {/* Login form */}
        <div className="w-full max-w-sm space-y-4">
          <Input
            placeholder="아이디"
            value={formData.loginId}
            onChange={(e) => handleInputChange("loginId", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={formData.loginPassword}
            onChange={(e) => handleInputChange("loginPassword", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
          />

          <MainButton onClick={handleLogin} className="mt-8">
            로그인
          </MainButton>

          <div className="text-center mt-6">
            <span className="text-gray-600">아직 계정이 없다면? </span>
            <button onClick={() => router.push("/signup")} className="text-blue-500 font-medium">
              회원가입
            </button>
          </div>

          <div className="text-center">
            <button className="text-blue-500 font-medium">비밀번호 찾기</button>
          </div>
        </div>
      </div>

    </div>
  )
}
