"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/common/MainButton"

export default function GroupCreatePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    groupName: "",
    groupMemberId: "",
    initialInvestment: "",
    targetInvestment: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 페이 계좌 개설 화면으로 이동
    router.push("/pay-account-setup")
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
            그룹 생성
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
            그룹에서 다함께 투자하고 결제해요
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Group Name Input */}
            <Input
              placeholder="그룹명"
              value={formData.groupName}
              onChange={(e) => handleInputChange("groupName", e.target.value)}
              className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
              required
            />

            {/* Group Member ID Input */}
            <Input
              placeholder="그룹인원"
              value={formData.groupMemberId}
              onChange={(e) => handleInputChange("groupMemberId", e.target.value)}
              className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
              required
            />

            {/* Initial Investment Input */}
            <Input
              placeholder="초기 투자금(원당)"
              value={formData.initialInvestment}
              onChange={(e) => handleInputChange("initialInvestment", e.target.value)}
              className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
              required
            />

            {/* Target Investment Input */}
            <Input
              placeholder="목표 투자금(원상)"
              value={formData.targetInvestment}
              onChange={(e) => handleInputChange("targetInvestment", e.target.value)}
              className="h-13 rounded-2xl border-gray-200 text-lg placeholder:text-gray-400 bg-white"
              required
            />

            {/* Info Section */}
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">매매 규칙</span>
                <button type="button" className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                  <span className="text-xs text-gray-400">?</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">그룹 해체 규칙</span>
                <button type="button" className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                  <span className="text-xs text-gray-400">?</span>
                </button>
              </div>

              {/* Payment Info Box */}
              <div className="rounded-3xl p-3 mt-4" style={{ backgroundColor: '#F5F5F5' }}>
                <p className="text-xs text-gray-800 text-center leading-relaxed">
                  페이 계좌 연결 완료
                  <br />
                  김지수 352-0880-1877-000
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <MainButton type="submit" className="mt-8">
              그룹 만들기
            </MainButton>
          </form>
        </div>
      </div>
    </div>
  )
}
