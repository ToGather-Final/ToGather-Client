"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function LoginPage() {
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
    // After successful login, redirect to main app
    // router.push("/group") // or wherever you want to redirect after login
  }

  const handleBack = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Star coin top right */}
      <div className="absolute top-8 right-8 w-20 h-20 transform rotate-12">
        <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-lg">
          <div className="text-white text-2xl">⭐</div>
        </div>
      </div>

      {/* Back button */}
      <div className="absolute top-8 left-8">
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
      <div className="flex flex-col items-center justify-center min-h-screen px-8">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-blue-500 text-6xl font-bold mb-2">T.</div>
        </div>

        <h1 className="text-blue-500 text-5xl font-bold text-center mb-16">ToGather</h1>

        {/* Login form */}
        <div className="w-full max-w-sm space-y-4">
          <Input
            placeholder="아이디"
            value={formData.loginId}
            onChange={(e) => handleInputChange("loginId", e.target.value)}
            className="h-14 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400"
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={formData.loginPassword}
            onChange={(e) => handleInputChange("loginPassword", e.target.value)}
            className="h-14 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400"
          />

          <Button
            onClick={handleLogin}
            className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-2xl mt-8"
          >
            로그인
          </Button>

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

      {/* Happy emoji bottom left */}
      <div className="absolute bottom-20 left-8 w-24 h-24">
        <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-lg transform -rotate-12">
          <div className="text-2xl">😊</div>
        </div>
      </div>
    </div>
  )
}