"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import BackgroundCoins from "@/components/common/BackgroundCoins"
import MainButton from "@/components/common/MainButton"
import { signup, login } from "@/utils/api"
import { getDeviceId } from "@/utils/deviceId"
import { saveTokens } from "@/utils/token"
import { SignupRequest, LoginRequest } from "@/types/api/auth"

interface SignupContainerProps {
  onSignupComplete: (nickname: string, userId?: string) => void
}

export default function SignupContainer({ onSignupComplete }: SignupContainerProps) {
  const [formData, setFormData] = useState({
    nickname: "",
    id: "",
    password: "",
    confirmPassword: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // 에러 메시지 초기화
    if (error) setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.nickname.trim()) {
      setError("닉네임을 입력해주세요.")
      return false
    }
    if (!formData.id.trim()) {
      setError("아이디를 입력해주세요.")
      return false
    }
    if (!formData.password.trim()) {
      setError("비밀번호를 입력해주세요.")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return false
    }
    if (formData.password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.")
      return false
    }
    return true
  }

  const handleSignup = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const signupData: SignupRequest = {
        username: formData.id,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        nickname: formData.nickname,
      }

      // Device ID 가져오기
      const deviceId = getDeviceId()
      
      // 회원가입 시 X-Device-Id 헤더 포함
      await signup(signupData, deviceId)
      
      // 회원가입 성공 후 자동 로그인
      // console.log("회원가입 완료, 자동 로그인 시작...")
      
      const loginData: LoginRequest = {
        username: formData.id,
        password: formData.password,
      }
      
      const loginResponse = await login(loginData, deviceId)
      
      // 토큰 저장
      saveTokens(loginResponse.accessToken, loginResponse.refreshToken, loginResponse.userId)
      
      // console.log("자동 로그인 완료:", loginResponse.userId)
      
      // 회원가입 완료 - 닉네임과 userId 전달
      onSignupComplete(formData.nickname, loginResponse.userId)
    } catch (err: any) {
      // console.error("Signup error:", err)
      // console.error("Signup error type:", typeof err)
      // console.error("Signup error keys:", err ? Object.keys(err) : 'null/undefined')
      
      // 빈 객체인 경우 (성공 응답이지만 본문이 없는 경우)
      if (err && typeof err === 'object' && Object.keys(err).length === 0) {
        // console.log("Empty response detected - treating as success")
        onSignupComplete(formData.nickname)
        return
      }
      
      setError(err.message || "회원가입에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full bg-white relative overflow-hidden">
      {/* Background coins */}
      <BackgroundCoins />

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full px-8 py-12 relative z-10">
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
            disabled={isLoading}
          />
          <Input
            placeholder="아이디"
            value={formData.id}
            onChange={(e) => handleInputChange("id", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="비밀번호 확인"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
            disabled={isLoading}
          />

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-500 text-sm text-center mt-2">
              {error}
            </div>
          )}

          <MainButton onClick={handleSignup} className="mt-8" disabled={isLoading}>
            {isLoading ? "회원가입 중..." : "회원가입"}
          </MainButton>
        </div>
      </div>
    </div>
  )
}
