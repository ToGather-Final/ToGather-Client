"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import BackgroundCoins from "@/components/common/BackgroundCoins"
import MainButton from "@/components/common/MainButton"
import { login } from "@/utils/api"
import { getDeviceId } from "@/utils/deviceId"
import { saveTokens } from "@/utils/token"
import { LoginRequest, ApiErrorWithStatus } from "@/types/api/auth"

export default function LoginFlow() {
  const [formData, setFormData] = useState({
    loginId: "",
    loginPassword: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // 에러 메시지 초기화
    if (error) setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.loginId.trim()) {
      setError("아이디를 입력해주세요.")
      return false
    }
    if (!formData.loginPassword.trim()) {
      setError("비밀번호를 입력해주세요.")
      return false
    }
    return true
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const loginData: LoginRequest = {
        username: formData.loginId,
        password: formData.loginPassword,
      }

      const deviceId = getDeviceId()
      const response = await login(loginData, deviceId)
      
      // 토큰 저장
      saveTokens(response.accessToken, response.refreshToken, response.userId)
      
      // 로그인 성공 후 그룹 페이지로 이동
      router.push("/group")
    } catch (err) {
      console.error("Login error:", err)
      
      // API 에러 타입 체크
      const isApiError = (error: unknown): error is ApiErrorWithStatus => {
        return (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          'message' in error &&
          'path' in error &&
          'timestamp' in error &&
          'status' in error
        )
      }
      
      if (isApiError(err)) {
        console.error("Login error code:", err.code)
        console.error("Login error message:", err.message)
        console.error("Login error path:", err.path)
        console.error("Login error timestamp:", err.timestamp)
        console.error("Login error status:", err.status)
        
        if (err.status === 401) {
          setError("아이디 또는 비밀번호가 일치하지 않습니다.")
        } else if (err.status === 400) {
          setError("X-Device-Id 헤더 누락 또는 잘못된 요청입니다.")
        } else if (err.status === 500) {
          setError("서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
        } else if (err.code === 'NETWORK_ERROR') {
          setError("서버에 연결할 수 없습니다.")
        } else {
          setError(err.message)
        }
      } else {
        setError("로그인에 실패했습니다. 다시 시도해주세요.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full bg-white relative overflow-hidden">
      {/* Background coins */}
      <BackgroundCoins />

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full px-8 relative z-10">
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
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={formData.loginPassword}
            onChange={(e) => handleInputChange("loginPassword", e.target.value)}
            className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
            disabled={isLoading}
          />

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-500 text-sm text-center mt-2">
              {error}
            </div>
          )}

          <MainButton onClick={handleLogin} className="mt-8" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
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
