"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BackgroundCoins from "@/components/common/BackgroundCoins"
import MainButton from "@/components/common/MainButton"

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

  const handleLogin = () => {
    router.push("/login")
  }

  const handleSignup = () => {
    router.push("/signup")
  }

  // Splash Screen
  if (currentScreen === "splash") {
    return (
      <div className="h-full relative overflow-hidden" style={{ background: '#6592FD' }}>
        {/* Animated slide up overlay */}
        <div
          className={`absolute inset-0 bg-white transition-transform duration-800 ease-out ${
            showAnimation ? "translate-y-0" : "translate-y-full"
          }`}
        />

        {/* Background coins */}
        <BackgroundCoins />

        {/* Main content */}
        <div className="flex flex-col items-center justify-center h-full px-8">
          {/* Logo */}
          <div className="mb-8">
            <div
              className={`relative transition-all duration-800 ${
                showAnimation ? "transform -translate-y-24" : "transform translate-y-4"
              }`}
            >
              {/* White logo */}
              <img 
                src="/images/logo-white.png"
                alt="ToGather Logo"
                className={`h-16 w-16 object-contain transition-opacity duration-800 ${
                  showAnimation ? "opacity-0" : "opacity-100"
                }`}
              />
              {/* Blue logo */}
              <img 
                src="/images/logo-blue.png"
                alt="ToGather Logo"
                className={`h-16 w-16 object-contain absolute top-0 left-0 transition-opacity duration-800 ${
                  showAnimation ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>

          <h1
            className={`text-5xl font-bold text-center mb-16 transition-all duration-800 ${
              showAnimation ? "transform -translate-y-24" : "text-white transform translate-y-4"
            }`}
            style={showAnimation ? { color: '#6592FD' } : {}}
          >
            ToGather
          </h1>
        </div>
      </div>
    )
  }

  // Auth Selection Screen
  if (currentScreen === "auth-selection") {
    return (
      <div className="h-full bg-white relative overflow-hidden">
        {/* Background coins */}
        <BackgroundCoins />

        {/* Main content */}
        <div className="flex flex-col items-center justify-center h-full px-8">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/images/logo-blue.png"
              alt="ToGather Logo"
              className="h-16 w-16 object-contain"
            />
          </div>

          <h1 className="text-5xl font-bold text-center mb-32" style={{ color: '#6592FD' }}>
            ToGather
          </h1>

          {/* Auth buttons */}
          <div
            className={`w-full max-w-sm space-y-4 transition-all duration-800 ease-out ${
              showButtons ? "transform translate-y-0 opacity-100" : "transform translate-y-12 opacity-0"
            }`}
          >
            <MainButton onClick={handleLogin}>
              로그인
            </MainButton>
            <MainButton onClick={handleSignup}>
              회원가입
            </MainButton>
          </div>
        </div>

      </div>
    )
  }


  return null
}
