"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import MainButton from "@/components/common/MainButton"
import GroupJoinConsentModal from "@/components/common/GroupJoinConsentModal"
import GroupWaitingContainer from "./GroupWaitingContainer"
import { joinGroup } from "@/utils/api"
import { markGroupJoined } from "@/utils/userStatus"
import { getUserId } from "@/utils/token"
import { ApiErrorWithStatus } from "@/types/api/auth"

export default function GroupJoinFlow() {
  const router = useRouter()
  const [step, setStep] = useState<"code" | "loading" | "waiting">("code")
  const [code, setCode] = useState(["", "", "", ""])
  const [groupInfo, setGroupInfo] = useState<{
    groupId: string
    groupName: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showConsentModal, setShowConsentModal] = useState(false)

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
    const codeString = code.join("")
    if (codeString.length !== 4) {
      setError("4자리 코드를 모두 입력해주세요.")
      return
    }

    setError(null)
    setShowConsentModal(true)
  }

  const handleConsentConfirm = async () => {
    setShowConsentModal(false)
    const codeString = code.join("")

    try {
      console.log("그룹 참여 API 호출:", codeString)
      const result = await joinGroup(codeString)
      console.log("그룹 참여 성공:", result)
      
      // 그룹 참여 완료 상태 업데이트
      const userId = getUserId()
      if (userId) {
        markGroupJoined(userId)
        console.log("그룹 참여 상태 업데이트 완료")
      }
      
      // 그룹 정보 저장하고 바로 대기 화면으로 이동 (로딩 단계 건너뛰기)
      setGroupInfo({
        groupId: result.groupId,
        groupName: result.groupName
      })
      setStep("waiting")
      
    } catch (err) {
      console.error("그룹 참여 실패:", err)
      
      let errorMessage = "그룹 참여에 실패했습니다. 다시 시도해주세요."
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as ApiErrorWithStatus).message
      }
      
      setError(errorMessage)
      setStep("code")
    }
  }

  const handleConsentCancel = () => {
    setShowConsentModal(false)
  }


  // Step 1: 코드 입력 화면
  if (step === "code") {
    return (
      <div className="h-full bg-white relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 relative z-10 flex-shrink-0">
          <Image 
            src="/images/logo-blue.png"
            alt="ToGather Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-start px-8 pt-48 relative z-10">
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
            className="text-lg font-semibold text-center mb-8"
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
          <div className="flex gap-4 mb-16 justify-center">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={code[index]}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                 className="w-14 h-24 text-center text-4xl border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 shadow-sm hover:border-gray-300 text-blue-900"
                style={{ 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.1em',
                  fontWeight: 500
                }}
              />
            ))}
          </div>

        </div>

        {/* Error Message - Fixed above button */}
        {error && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-8 z-50">
            <p className="text-sm text-red-500 text-center">{error}</p>
          </div>
        )}

        {/* Fixed Submit Button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-8 z-50">
          <MainButton 
            onClick={handleCodeSubmit}
            disabled={code.some(c => !c)}
          >
            확인
          </MainButton>
        </div>

        {/* 동의 확인 팝업 */}
        <GroupJoinConsentModal
          isOpen={showConsentModal}
          onClose={handleConsentCancel}
          onConfirm={handleConsentConfirm}
        />
      </div>
    )
  }

  // Step 2: 로딩 화면
  if (step === "loading") {
    return (
      <div className="h-full bg-white relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 relative z-10 flex-shrink-0">
          <Image 
            src="/images/logo-blue.webp"
            alt="ToGather Logo"
            width={32}
            height={32}
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
            그룹에
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
          <div className="w-full relative h-[400px]">
            <Image 
              src="/images/group-create.webp"
              alt="Group"
              fill
              priority
              fetchPriority="high"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    )
  }

  // Step 3: 대기 화면
  if (step === "waiting" && groupInfo) {
    return (
      <GroupWaitingContainer 
        groupId={groupInfo.groupId}
        groupName={groupInfo.groupName}
      />
    )
  }

  return null
}
