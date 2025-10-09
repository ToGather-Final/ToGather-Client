"use client"

import { useState, useEffect } from "react"
// @ts-ignore
import confetti from "canvas-confetti"
import MainButton from "@/components/common/MainButton"

interface WelcomeContainerProps {
  onComplete: () => void
  nickname: string
}

export default function WelcomeContainer({ onComplete, nickname }: WelcomeContainerProps) {
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateWindowDimensions()
    window.addEventListener('resize', updateWindowDimensions)

    // 직사각형 모양의 컨페티 생성
    const createRectangularConfetti = () => {
      const colors = ['#e53e3e', '#2b6cb0', '#38a169', '#d69e2e']
      
      // 여러 번 발사하여 지속적인 효과
      const interval = setInterval(() => {
        confetti({
          particleCount: 10,
          spread: 70,
          origin: { y: 0 },
          colors: colors,
          shapes: ['square'], // 직사각형 모양
          gravity: 1.5, // 중력 증가로 화면 밑까지 내려오도록
          ticks: 300, // 더 오래 살아있도록
        })
      }, 300)

      return () => clearInterval(interval)
    }

    const cleanup = createRectangularConfetti()

    return () => {
      window.removeEventListener('resize', updateWindowDimensions)
      if (cleanup) cleanup()
    }
  }, [])

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Confetti canvas - 배경 레이어 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <canvas 
          id="confetti-canvas" 
          className="w-full h-full"
          style={{ zIndex: -1 }}
        />
      </div>

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

        {/* Welcome Message */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-extrabold mb-8 leading-tight" style={{ color: '#6592FD' }}>
            {nickname}님
            <br />
            환영합니다
          </h1>

          <p className="text-xl leading-relaxed font-semibold" style={{ color: '#6592FD' }}>
            계좌를 만들고
            <br />
            다함께
            <br />
            그룹 투자를
            <br />
            시작해보세요
          </p>
        </div>

        {/* Account Setup Button */}
        <MainButton onClick={onComplete} className="max-w-sm">
          계좌 개설하러 가기
        </MainButton>
      </div>
    </div>
  )
}
