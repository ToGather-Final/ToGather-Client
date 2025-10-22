"use client"

import { useState } from "react"
import Logo from "@/components/common/Logo"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import BackgroundCoins from "@/components/common/BackgroundCoins"
import MainButton from "@/components/common/MainButton"
import { login } from "@/utils/api"
import { getDeviceId } from "@/utils/deviceId"
import { saveTokens } from "@/utils/token"
import { checkUserStatus } from "@/utils/userStatus"
import { LoginRequest, ApiErrorWithStatus, GroupInfo } from "@/types/api/auth"
import { useGroupId } from "@/contexts/groupIdContext"

interface LoginContainerProps {
  showAnimation?: boolean
}

function LoginContainer({ showAnimation = true }: LoginContainerProps) {
  const [formData, setFormData] = useState({
    loginId: "",
    loginPassword: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setGroupId } = useGroupId()

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
      
      // 그룹 정보가 있는 경우 그룹 상태에 따른 분기 처리
      if (response.groups && response.groups.length > 0) {
        const userGroup = response.groups[0]
        // console.log("로그인 후 그룹 정보:", userGroup)
        
        // 그룹 정보가 있으면 항상 setGroupId 호출 (localStorage에 저장)
        // console.log("🔑 LoginContainer - setGroupId 호출:", userGroup.groupId)
        setGroupId(userGroup.groupId)
        // console.log("✅ LoginContainer - setGroupId 완료")
        
        // 그룹이 꽉 찬 경우 (방장/일반 사용자 관계없이)
        if (userGroup.isFull) {
          // console.log("그룹이 꽉 참 - 메인 그룹 페이지로 이동")
          router.push('/group')
          return
        }
        
        // 그룹이 꽉 차지 않은 경우
        if (userGroup.isOwner) {
          // 방장인 경우 → 그룹 완료 페이지로 이동
          // console.log("👑 방장 - 그룹 완료 페이지로 이동")
          // console.log("📝 LoginContainer - sessionStorage에 그룹 정보 저장:", userGroup)
          // 그룹 정보를 sessionStorage에 저장
          sessionStorage.setItem('loginGroupInfo', JSON.stringify(userGroup))
          // console.log("✅ LoginContainer - sessionStorage 저장 완료, /group-create-complete로 이동")
          router.push('/group-create-complete')
        } else {
          // 일반 사용자인 경우 → 그룹 대기 페이지로 이동
          // console.log("일반 사용자 - 그룹 대기 페이지로 이동")
          // 그룹 정보를 sessionStorage에 저장
          sessionStorage.setItem('loginGroupInfo', JSON.stringify(userGroup))
          router.push(`/group-waiting/${userGroup.groupId}`)
        }
      } else {
        // 그룹이 없는 경우 → 기존 플로우 (계좌 개설 등)
        try {
          const userStatus = await checkUserStatus(response.userId)
          // console.log("로그인 후 사용자 상태:", userStatus)
          
          switch (userStatus.nextStep) {
            case 'account-create':
              router.push("/account-create")
              break
            case 'account-complete':
              router.push("/account-create") // AccountCreateFlow에서 complete 상태로 처리
              break
            case 'group-created':
              // 그룹 생성 완료 화면으로 이동
              router.push("/group-create-complete")
              break
            case 'group-create':
            case 'group-join':
              // 그룹 생성/참여 선택 페이지로 이동 (추후 구현)
              router.push("/group-create")
              break
            case 'group':
              router.push("/group")
              break
            default:
              router.push("/account-create")
          }
        } catch (error) {
          // console.error("사용자 상태 확인 실패:", error)
          // 에러 시 기본적으로 계좌 개설 페이지로 이동
          router.push("/account-create")
        }
      }
    } catch (err) {
      // console.error("Login error:", err)
      
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
        // console.error("Login error code:", err.code)
        // console.error("Login error message:", err.message)
        // console.error("Login error path:", err.path)
        // console.error("Login error timestamp:", err.timestamp)
        // console.error("Login error status:", err.status)
        
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
      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full px-8 relative z-10">
        {/* Logo */}
        <div className={`mb-8 transition-all duration-1000 delay-200 ${showAnimation ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"}`}>
          <Logo variant="blue" size="lg" />
        </div>

        <h1 className={`text-3xl font-bold text-center mb-16 transition-all duration-1000 delay-300 ${showAnimation ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"}`} style={{ color: '#6592FD' }}>ToGather</h1>

        {/* Login form */}
        <div className={`w-full max-w-sm space-y-4 transition-all duration-1000 delay-500 ${showAnimation ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"}`}>
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

        </div>
      </div>

    </div>
  )
}

export default LoginContainer
