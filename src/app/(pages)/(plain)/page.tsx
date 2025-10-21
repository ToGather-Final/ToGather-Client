"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import BackgroundCoins from "@/components/common/BackgroundCoins"
import Logo from "@/components/common/Logo"

// React 19 최적화를 위한 컴포넌트 분리
const SplashScreen = ({ showAnimation }: { showAnimation: boolean }) => (
    <div className="h-full relative overflow-hidden" style={{ background: '#6592FD' }}>
        {/* Animated slide up overlay */}
        <div
          className={`relative transition-all duration-800 ${showAnimation ? "transform -translate-y-27" : "transform translate-y-4"
            }`}
        />

        {/* Background coins */}
        <Suspense fallback={<div className="absolute inset-0 bg-blue-500" />}>
            <BackgroundCoins />
        </Suspense>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center h-full px-8">
            {/* Logo */}
            <div className="mb-8">
                <div
                    className={`relative transition-all duration-800 ${showAnimation ? "transform -translate-y-24" : "transform translate-y-4"
                    }`}
                >
                    {/* White logo */}
                    <Logo
                        variant="white"
                        size="lg"
                        className={`transition-opacity duration-800 ${showAnimation ? "opacity-0" : "opacity-100"
                        }`}
                    />
                    {/* Blue logo */}
                    <Logo
                        variant="blue"
                        size="lg"
                        className={`absolute top-0 left-0 transition-opacity duration-800 ${showAnimation ? "opacity-100" : "opacity-0"
                        }`}
                    />
                </div>
            </div>

            <h1
                className={`text-3xl font-bold text-white text-center transition-all duration-800 ${showAnimation ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
                }`}
            >
                ToGather
            </h1>
        </div>
    </div>
)

const AuthSelectionScreen = ({ showButtons }: { showButtons: boolean }) => (
    <div className="h-full relative overflow-hidden bg-white">
        {/* Background coins */}
        <Suspense fallback={<div className="absolute inset-0 bg-gray-100" />}>
            <BackgroundCoins />
        </Suspense>

    {/* Main content */}
    <div className="flex flex-col items-center justify-center h-full px-8">
      {/* Logo */}
      <div className="mb-8">
        <Logo
          variant="blue"
          size="lg"
        />
      </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                ToGather
            </h1>
            <p className="text-gray-600 text-center mb-12">
                모임 투자 플랫폼
            </p>

            {/* Auth buttons */}
            <div className={`w-full max-w-xs space-y-4 transition-all duration-500 ${showButtons ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"
            }`}>
                <button
                    onClick={() => window.location.href = "/login"}
                    className="w-full bg-blue-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors duration-200"
                >
                    로그인
                </button>
                <button
                    onClick={() => window.location.href = "/signup"}
                    className="w-full bg-gray-100 text-gray-900 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors duration-200"
                >
                    회원가입
                </button>
            </div>
        </div>
    </div>
)

export default function ToGatherApp() {
    const [currentScreen, setCurrentScreen] = useState<"splash" | "auth-selection">("splash")
    const [showAnimation, setShowAnimation] = useState(false)
    const [showButtons, setShowButtons] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Auto transition from splash to auth selection after 2 seconds
        if (currentScreen === "splash") {
            const timer = setTimeout(() => {
                setShowAnimation(true)
                setTimeout(() => {
                    setCurrentScreen("auth-selection")
                    // 버튼들이 나타나는 애니메이션을 위한 지연
                    setTimeout(() => {
                        setShowButtons(true)
                    }, 300)
                }, 800) // Animation duration
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [currentScreen])

    // Splash Screen
    if (currentScreen === "splash") {
        return <SplashScreen showAnimation={showAnimation} />
    }

    // Auth Selection Screen
    return <AuthSelectionScreen showButtons={showButtons} />
}