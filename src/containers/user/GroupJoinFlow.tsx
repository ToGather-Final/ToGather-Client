"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MainButton from "@/components/common/MainButton"

export default function GroupJoinFlow() {
  const router = useRouter()
  const [step, setStep] = useState<"code" | "loading" | "rules">("code")
  const [code, setCode] = useState(["", "", "", ""])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code]
      newCode[index] = value.toUpperCase()
      setCode(newCode)
      
      // Auto focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleCodeSubmit = () => {
    // 코드 입력 완료 후 로딩 화면으로
    setStep("loading")
    
    // 2초 후 규칙 화면으로 전환
    setTimeout(() => {
      setStep("rules")
    }, 2000)
  }

  const handleRulesConfirm = () => {
    // 그룹 메인 페이지로 이동
    router.push("/group")
  }

  // Step 1: 코드 입력 화면
  if (step === "code") {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 relative z-10 flex-shrink-0">
          <img 
            src="/images/logo-blue.png"
            alt="ToGather Logo"
            className="h-8 w-8 object-contain"
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
          {/* Title */}
          <h1 
            className="text-4xl font-extrabold text-center mb-4 leading-tight"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #4078FF, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 900,
              WebkitTextStroke: '0.4px #4078FF'
            }}
          >
            그룹 코드 입력
          </h1>

          <p 
            className="text-lg font-semibold text-center mb-16"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #234085, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            그룹에서 다함께 투자하고 결제해요
          </p>

          {/* Code Input Boxes */}
          <div className="flex gap-3 mb-16">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={code[index]}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                className="w-16 h-20 text-center text-2xl font-bold border-2 border-gray-300 rounded-2xl bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            ))}
          </div>

          {/* Submit Button */}
          <div className="w-full max-w-sm">
            <MainButton 
              onClick={handleCodeSubmit}
              disabled={code.some(c => !c)}
            >
              확인
            </MainButton>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: 로딩 화면
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 relative z-10 flex-shrink-0">
          <img 
            src="/images/logo-blue.png"
            alt="ToGather Logo"
            className="h-8 w-8 object-contain"
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
          {/* Title */}
          <h1 
            className="text-4xl font-extrabold text-center mb-8 leading-tight"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #264989, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 900,
              WebkitTextStroke: '0.4px #264989'
            }}
          >
            그룹 '고잉메리호'에
            <br />
            입장하고 있어요
          </h1>

          {/* Loading Dots */}
          <div className="flex gap-2 mb-12">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          {/* Group Image */}
          <div className="w-full">
            <img 
              src="/images/group-create.png"
              alt="Group"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    )
  }

  // Step 3: 그룹 규칙 화면
  if (step === "rules") {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 relative z-10 flex-shrink-0">
          <img 
            src="/images/logo-blue.png"
            alt="ToGather Logo"
            className="h-8 w-8 object-contain"
          />
        </div>

        {/* Main content */}
        <div className="flex-1 px-8 py-4 relative z-10 overflow-y-auto">
          {/* Title */}
          <h1 
            className="text-3xl font-extrabold text-center mb-2"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #4078FF, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 900,
              WebkitTextStroke: '0.4px #4078FF'
            }}
          >
            그룹 규칙
          </h1>

          <p 
            className="text-base font-semibold text-center mb-6"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #234085, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            우리 그룹의 매매 규칙이에요
          </p>

          {/* Rules Sections */}
          <div className="space-y-4 mb-6">
            {/* 그룹 생성 및 참여 */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">그룹 생성 및 참여</p>
                <ul className="text-xs text-gray-700 space-y-0.5 list-disc pl-4">
                  <li>그룹장은 모임 이름, 인원, 초기 투자금을 설정합니다.</li>
                  <li>참여자는 모임 코드를 통해서만 참여할 수 있습니다.</li>
                </ul>
              </div>
            </div>

            {/* 매매 방식 */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">매매 방식</p>
                <ul className="text-xs text-gray-700 space-y-0.5 list-disc pl-4">
                  <li>매매가 발생하면, 과 그룹원 수 각 그룹원 4) 발급 각각의 즉시 모임 통장에서 그룹장의 개인 통장으로 이동합니다.</li>
                  <li>각 모임 투자 결과 수익금은 통합 관리됩니다.</li>
                </ul>
              </div>
            </div>

            {/* 매미 규칙 */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">!</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">매미 규칙</p>
                <ul className="text-xs text-gray-700 space-y-0.5 list-disc pl-4">
                  <li>매미 완성일 승인은 그룹원의 과반수입니다.</li>
                  <li>승인이 완성되면, 과 그룹원 수 각 매매에 수 각 모임 매매 금액은 즉시 모임 통장에서 그룹장의 개인통장으로 이동합니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 py-4">
            <input
              type="checkbox"
              id="rules-agreement"
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="rules-agreement" className="text-sm text-gray-700 leading-relaxed">
              본 규칙에 동의하신겁니까?
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <MainButton onClick={handleRulesConfirm}>
              확인
            </MainButton>
          </div>
        </div>
      </div>
    )
  }

  return null
}
