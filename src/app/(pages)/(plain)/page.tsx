"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import BackgroundCoins from "@/components/common/BackgroundCoins"
import Logo from "@/components/common/Logo"
import MainButton from "@/components/common/MainButton"
import { login } from "@/utils/api"
import { getDeviceId } from "@/utils/deviceId"
import { saveTokens } from "@/utils/token"
import { checkUserStatus } from "@/utils/userStatus"
import { LoginRequest, ApiErrorWithStatus } from "@/types/api/auth"
import { useGroupId } from "@/contexts/groupIdContext"

// React 19 최적화를 위한 컴포넌트 분리
const SplashScreen = ({ 
    showAnimation, 
    isTransitioning, 
    showLogin, 
    animateLogin,
    formData, 
    setFormData, 
    isLoading, 
    error, 
    handleInputChange, 
    handleLogin, 
    router 
}: { 
    showAnimation: boolean, 
    isTransitioning: boolean, 
    showLogin: boolean,
    animateLogin: boolean,
    formData: any,
    setFormData: any,
    isLoading: boolean,
    error: string | null,
    handleInputChange: any,
    handleLogin: any,
    router: any
}) => (
    <div 
        className={`h-full relative overflow-hidden transition-all duration-500 ${isTransitioning ? "bg-white" : ""}`} 
        style={{ background: isTransitioning ? 'white' : '#6592FD' }}
    >
        {/* Background coins - 로그인 화면에서만 표시 */}
        {isTransitioning && (
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              showLogin ? "opacity-100" : "opacity-0"
            }`}
          >
            <Suspense fallback={<div className="absolute inset-0 bg-gray-100" />}>
              <BackgroundCoins />
            </Suspense>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col items-center justify-center h-full px-8 relative z-10">
            {/* Logo */}
            <div className={`mb-8 ${!showLogin ? "absolute" : ""}`}>
                {!showLogin ? (
                    // 스플래시 화면의 로고 애니메이션 - 중앙에서 시작해서 위로 올라가면서 파란색으로 변경
                    <div
                        className={`relative transition-all duration-800 ${
                            showAnimation ? "transform -translate-y-48.5" : "transform translate-y-0"
                        }`}
                    >
                        {/* White logo */}
                        <Logo
                            variant="white"
                            size="lg"
                            className={`transition-opacity duration-800 ${
                                showAnimation ? "opacity-0" : "opacity-100"
                            }`}
                        />
                        {/* Blue logo */}
                        <Logo
                            variant="blue"
                            size="lg"
                            className={`absolute top-0 left-0 transition-opacity duration-800 ${
                                showAnimation ? "opacity-100" : "opacity-0"
                            }`}
                        />
                    </div>
                ) : (
                    // 로그인 화면의 로고
                    <div>
                      <Logo variant="blue" size="lg" />
                    </div>
                )}
            </div>

            {/* ToGather 텍스트 */}
            {!showLogin ? (
                // 스플래시 화면의 텍스트 애니메이션 - 로고 아래에 위치해서 위로 올라가면서 사라짐
                <div
                    className={`absolute transition-all duration-800 ${
                        showAnimation
                            ? "opacity-0 transform -translate-y-4"
                            : "opacity-100 transform translate-y-0"
                    }`}
                    style={{ top: "calc(50% + 60px)" }}
                >
                    <h1 className="text-3xl font-bold text-white text-center">
                        ToGather
                    </h1>
                </div>
            ) : null}

            {/* 로그인 화면의 ToGather 텍스트 */}
            {showLogin && (
                <h1
                    className={`text-3xl font-bold text-center mb-16 transition-all duration-1000 ${
                        animateLogin
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                    }`}
                    style={{ color: "#6592FD" }}
                >
                    ToGather
                </h1>
            )}

            {/* 로그인 폼 */}
            <div
                className={`w-full max-w-sm space-y-4 transition-all duration-1000 delay-500 ${
                    animateLogin
                        ? "opacity-100 transform translate-y-0"
                        : "opacity-0 transform translate-y-8"
                }`}
            >
                <input
                    placeholder="아이디"
                    value={formData.loginId}
                    onChange={(e) => handleInputChange("loginId", e.target.value)}
                    className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white w-full px-4 py-3 border"
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={formData.loginPassword}
                    onChange={(e) => handleInputChange("loginPassword", e.target.value)}
                    className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white w-full px-4 py-3 border"
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
                    <button
                        onClick={() => router.push("/signup")}
                        className="text-blue-500 font-medium"
                    >
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    </div>
)

export default function ToGatherApp() {
    const [showAnimation, setShowAnimation] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [animateLogin, setAnimateLogin] = useState(false)
    const [formData, setFormData] = useState({
        loginId: "",
        loginPassword: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { setGroupId } = useGroupId()

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

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (error) setError(null)
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
                setGroupId(userGroup.groupId)

                if (userGroup.isFull) {
                    router.push("/group")
                    return
                }

                if (userGroup.isOwner) {
                    sessionStorage.setItem(
                        "loginGroupInfo",
                        JSON.stringify(userGroup)
                    )
                    router.push("/group-create-complete")
                } else {
                    sessionStorage.setItem(
                        "loginGroupInfo",
                        JSON.stringify(userGroup)
                    )
                    router.push(`/group-waiting/${userGroup.groupId}`)
                }
            } else {
                // 그룹이 없는 경우 → 기존 플로우
                try {
                    const userStatus = await checkUserStatus(response.userId)

                    switch (userStatus.nextStep) {
                        case "account-create":
                            router.push("/account-create")
                            break
                        case "account-complete":
                            router.push("/account-create")
                            break
                        case "group-created":
                            router.push("/group-create-complete")
                            break
                        case "group-create":
                        case "group-join":
                            router.push("/group-create")
                            break
                        case "group":
                            router.push("/group")
                            break
                        default:
                            router.push("/account-create")
                    }
                } catch (error) {
                    router.push("/account-create")
                }
            }
        } catch (err) {
            const isApiError = (error: unknown): error is ApiErrorWithStatus => {
                return (
                    typeof error === "object" &&
                    error !== null &&
                    "code" in error &&
                    "message" in error &&
                    "path" in error &&
                    "timestamp" in error &&
                    "status" in error
                )
            }

            if (isApiError(err)) {
                if (err.status === 401) {
                    setError("아이디 또는 비밀번호가 일치하지 않습니다.")
                } else if (err.status === 400) {
                    setError("X-Device-Id 헤더 누락 또는 잘못된 요청입니다.")
                } else if (err.status === 500) {
                    setError("서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
                } else if (err.code === "NETWORK_ERROR") {
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

    useEffect(() => {
        // Auto transition from splash to login after 2 seconds
        const timer = setTimeout(() => {
            setShowAnimation(true)
            setTimeout(() => {
                // 전환 시작
                setIsTransitioning(true)
                setTimeout(() => {
                    // 로그인 요소들 표시
                    setShowLogin(true)
                }, 400) // 배경 전환 지연
            }, 800)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    // 로그인 애니메이션 트리거
    useEffect(() => {
        if (showLogin) {
            const timer = setTimeout(() => setAnimateLogin(true), 50)
            return () => clearTimeout(timer)
        }
    }, [showLogin])

    return (
        <div className="h-full relative overflow-hidden">
            <SplashScreen
                showAnimation={showAnimation}
                isTransitioning={isTransitioning}
                showLogin={showLogin}
                animateLogin={animateLogin}
                formData={formData}
                setFormData={setFormData}
                isLoading={isLoading}
                error={error}
                handleInputChange={handleInputChange}
                handleLogin={handleLogin}
                router={router}
            />
        </div>
    )
}
