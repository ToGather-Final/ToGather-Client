"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
        {/* Animated slide up overlay */}
        <div
          className={`absolute inset-0 bg-white transition-transform duration-800 ease-out ${
            showAnimation ? "translate-y-0" : "translate-y-full"
          }`}
        />

        {/* Star coin top right */}
        <div className="absolute top-8 right-8 w-20 h-20 transform rotate-12">
          <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-lg">
            <div className="text-white text-2xl">⭐</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center min-h-screen px-8">
          {/* Logo */}
          <div className="mb-8">
            <div
              className={`text-6xl font-bold mb-2 transition-all duration-800 ${
                showAnimation ? "text-blue-500 transform -translate-y-24" : "text-white transform translate-y-4"
              }`}
            >
              T.
            </div>
          </div>

          <h1
            className={`text-5xl font-bold text-center mb-16 transition-all duration-800 ${
              showAnimation ? "text-blue-500 transform -translate-y-24" : "text-white transform translate-y-4"
            }`}
          >
            ToGather
          </h1>
        </div>

        {/* Happy emoji bottom left */}
        <div className="absolute bottom-20 left-8 w-24 h-24">
          <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-lg transform -rotate-12">
            <div className="text-2xl">😊</div>
          </div>
        </div>

        {/* Crying emoji bottom right */}
        <div className="absolute bottom-32 right-8 w-28 h-28">
          <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-lg transform rotate-12">
            <div className="text-3xl">😭</div>
          </div>
        </div>
      </div>
    )
  }

  // Auth Selection Screen
  if (currentScreen === "auth-selection") {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Star coin top right */}
        <div className="absolute top-8 right-8 w-20 h-20 transform rotate-12">
          <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-lg">
            <div className="text-white text-2xl">⭐</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center min-h-screen px-8">
          {/* Logo */}
          <div className="mb-8">
            <div className="text-blue-500 text-6xl font-bold mb-2">
              T.
            </div>
          </div>

          <h1 className="text-blue-500 text-5xl font-bold text-center mb-32">
            ToGather
          </h1>

          {/* Auth buttons */}
          <div
            className={`w-full max-w-sm space-y-4 transition-all duration-800 ease-out ${
              showButtons ? "transform translate-y-0 opacity-100" : "transform translate-y-12 opacity-0"
            }`}
          >
            <Button
              onClick={handleLogin}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-2xl"
            >
              로그인
            </Button>
            <Button
              onClick={handleSignup}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-2xl"
            >
              회원가입
            </Button>
          </div>
        </div>

        {/* Happy emoji bottom left */}
        <div className="absolute bottom-20 left-8 w-24 h-24">
          <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-lg transform -rotate-12">
            <div className="text-2xl">😊</div>
          </div>
        </div>

        {/* Crying emoji bottom right */}
        <div className="absolute bottom-32 right-8 w-28 h-28">
          <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-lg transform rotate-12">
            <div className="text-3xl">😭</div>
          </div>
        </div>
      </div>
    )
  }


  return null
}
