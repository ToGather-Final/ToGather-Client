"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/common/MainButton"

export default function InvestmentAccountPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    englishLastName: "",
    englishFirstName: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 계좌 개설 완료 화면으로 이동
    router.push("/account-complete")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-6 relative z-10">
        <button 
          onClick={handleBack} 
          className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-2xl font-bold text-blue-600">T.</div>
        <div className="w-6"></div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 relative z-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-blue-600 text-center mb-2">투자 계좌 개설</h1>
          <p className="text-blue-500 text-center mb-8">매매에 사용되는 개인 통장이에요</p>

          {/* Info Box */}
          <div className="bg-purple-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-800 leading-relaxed">
              주식과 금융상품을 한 계좌에서 거래할 수 있으며, 국내/해외주식, 금융상품(펀드, 채권, 연금) 서비스를 이용할 수 있습니다. 울랄라
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <Input
              placeholder="이름"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-14 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
              required
            />

            {/* English Last Name Input */}
            <Input
              placeholder="영문 성"
              value={formData.englishLastName}
              onChange={(e) => handleInputChange("englishLastName", e.target.value)}
              className="h-14 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
              required
            />

            {/* English First Name Input */}
            <Input
              placeholder="영문 이름"
              value={formData.englishFirstName}
              onChange={(e) => handleInputChange("englishFirstName", e.target.value)}
              className="h-14 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
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
