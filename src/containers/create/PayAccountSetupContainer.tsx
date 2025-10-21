"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/common/MainButton"
import { createPayAccount } from "@/utils/api"
import { ApiErrorWithStatus } from "@/types/api/auth"
import Image from "next/image"
import PayTermsModal from "@/components/common/PayTermsModal"

interface PayAccountSetupContainerProps {
  onComplete: () => void
  groupId: string
}

export default function PayAccountSetupContainer({ onComplete, groupId }: PayAccountSetupContainerProps) {
  const [formData, setFormData] = useState({
    name: "",
    englishLastName: "",
    englishFirstName: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 입력값 검증
      if (!formData.name.trim()) {
        throw new Error("이름을 입력해주세요.")
      }
      if (!formData.englishLastName.trim()) {
        throw new Error("영문 성을 입력해주세요.")
      }
      if (!formData.englishFirstName.trim()) {
        throw new Error("영문 이름을 입력해주세요.")
      }

      // console.log("페이 계좌 개설 시작:", { groupId, formData })
      await createPayAccount(groupId, {
        name: formData.name.trim(),
        englishLastName: formData.englishLastName.trim(),
        englishFirstName: formData.englishFirstName.trim(),
        agreeToTerms: true
      })
      // console.log("페이 계좌 개설 완료")

      // 그룹 생성 완료 화면으로 이동
      onComplete()
    } catch (err) {
      // console.error("페이 계좌 개설 실패:", err)
      
      let errorMessage = "페이 계좌 개설에 실패했습니다. 다시 시도해주세요."
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as ApiErrorWithStatus).message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

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

      {/* Content */}
      <div className="flex-1 px-6 pb-8 relative z-10 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <h1 
            className="text-4xl font-extrabold text-center mb-4"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #4078FF, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 900,
              WebkitTextStroke: '0.4px #4078FF'
            }}
          >
            페이 계좌 개설
          </h1>
          <p 
            className="text-lg font-extrabold text-center mb-8"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #234085, #6989D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            그룹장만 만드는 페이 모임 통장이에요
          </p>

          {/* Info Box */}
          <div className="rounded-3xl p-3 mb-8" style={{ backgroundColor: '#EEF2FF' }}>
            <p className="text-xs text-gray-800 leading-relaxed text-center">
              그룹 전용 페이 계좌입니다.
              <br />
              공동 투자로 형성된 자금을 이 계좌로 이체하여
              <br />
              모임의 각종 지출(여행, 회식 등)에 대한 결제에 사용할 수 있습니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <Input
              placeholder="이름"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
              required
            />

            {/* English Last Name Input */}
            <Input
              placeholder="영문 성"
              value={formData.englishLastName}
              onChange={(e) => handleInputChange("englishLastName", e.target.value)}
              className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
              required
            />

            {/* English First Name Input */}
            <Input
              placeholder="영문 이름"
              value={formData.englishFirstName}
              onChange={(e) => handleInputChange("englishFirstName", e.target.value)}
              className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
              required
            />

            {/* Agreement Checkbox */}
            <div className="flex items-start gap-3 py-4">
              <input
                type="checkbox"
                id="pay-agreement"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked
                required
              />
              <div className="flex-1">
                <label htmlFor="pay-agreement" className="text-sm text-gray-700 leading-relaxed">
                  개인(신용) 정보 처리 동의서 (금융 거래)
                </label>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    페이계좌 이용약관 보기
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mt-4">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <MainButton 
              type="submit" 
              className="mt-8"
              disabled={isLoading}
            >
              {isLoading ? "계좌 개설 중..." : "계좌 개설하기"}
            </MainButton>
          </form>
        </div>
      </div>

      {/* Terms Modal */}
      <PayTermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  )
}
