"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/common/MainButton"

interface AccountSetupContainerProps {
  onComplete: () => void
}

export default function AccountSetupContainer({ onComplete }: AccountSetupContainerProps) {
  const [formData, setFormData] = useState({
    name: "",
    englishLastName: "",
    englishFirstName: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 계좌 개설 완료 화면으로 이동
    onComplete()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 relative z-10 flex-shrink-0">
        <img 
          src="/images/logo-blue.png"
          alt="ToGather Logo"
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
            투자 계좌 개설
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
            매매에 사용되는 개인 통장이에요
          </p>

          {/* Info Box */}
          <div className="rounded-3xl p-3 mb-8" style={{ backgroundColor: '#EEF2FF' }}>
            <p className="text-xs text-gray-800 leading-relaxed text-center">
              주식과 금융상품을 한 계좌에서 거래할 수 있으며,
              <br />
              국내/해외주식, 금융상품(펀드, 채권, 연금) 서비스를
              <br />
              이용할 수 있습니다. 울랄라
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
                id="agreement"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked
                required
              />
              <label htmlFor="agreement" className="text-sm text-gray-700 leading-relaxed">
                개인(신용) 정보 처리 동의서 (금융 거래)
              </label>
            </div>

            {/* Submit Button */}
            <MainButton type="submit" className="mt-8">
              계좌 만들기
            </MainButton>
          </form>
        </div>
      </div>
    </div>
  )
}
