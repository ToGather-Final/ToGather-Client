"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import Select from "@/components/ui/select"
import MainButton from "@/components/common/MainButton"
import { createGroup, CreateGroupRequest } from "@/utils/api"
import { ApiErrorWithStatus } from "@/types/api/auth"
import Image from "next/image"

interface GroupCreateContainerProps {
  onComplete: (groupId: string, groupName: string, invitationCode: string) => void
}

export default function GroupCreateContainer({ onComplete }: GroupCreateContainerProps) {
  const [formData, setFormData] = useState({
    groupName: "",
    groupMemberId: "",
    initialInvestment: "",
    targetInvestment: "",
    voteQuorum: "1", // 기본값: 1명
    dissolutionQuorum: "1", // 기본값: 1명
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  // 드롭다운 옵션 생성 함수
  const generateQuorumOptions = (maxMembers: number) => {
    const options = []
    for (let i = 1; i <= maxMembers; i++) {
      options.push({ value: i.toString(), label: `${i}명` })
    }
    return options
  }

  // 그룹 인원수에 따른 옵션 생성
  const maxMembers = parseInt(formData.groupMemberId) || 1
  const voteQuorumOptions = generateQuorumOptions(maxMembers)
  const dissolutionQuorumOptions = generateQuorumOptions(maxMembers)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 입력값 검증
      if (!formData.groupName.trim()) {
        throw new Error("그룹명을 입력해주세요.")
      }
      if (!formData.groupMemberId.trim()) {
        throw new Error("그룹 인원수를 입력해주세요.")
      }
      if (!formData.initialInvestment.trim()) {
        throw new Error("초기 투자금을 입력해주세요.")
      }
      if (!formData.targetInvestment.trim()) {
        throw new Error("목표 투자금을 입력해주세요.")
      }

      // 숫자 변환 및 검증
      const maxMembers = parseInt(formData.groupMemberId)
      const initialAmount = parseInt(formData.initialInvestment)
      const goalAmount = parseInt(formData.targetInvestment)

      if (isNaN(maxMembers) || maxMembers <= 0) {
        throw new Error("그룹 인원수는 1명 이상이어야 합니다.")
      }
      if (isNaN(initialAmount) || initialAmount < 0) {
        throw new Error("초기 투자금은 0원 이상이어야 합니다.")
      }
      if (isNaN(goalAmount) || goalAmount <= 0) {
        throw new Error("목표 투자금은 0원보다 커야 합니다.")
      }
      if (initialAmount > goalAmount) {
        throw new Error("초기 투자금은 목표 투자금보다 작거나 같아야 합니다.")
      }

      // 정족수 검증
      const voteQuorum = parseInt(formData.voteQuorum)
      const dissolutionQuorum = parseInt(formData.dissolutionQuorum)

      if (voteQuorum > maxMembers) {
        throw new Error("매매 정족수는 그룹 인원수를 초과할 수 없습니다.")
      }
      if (dissolutionQuorum > maxMembers) {
        throw new Error("해체 정족수는 그룹 인원수를 초과할 수 없습니다.")
      }

      // API 요청 데이터 생성
      const requestData: CreateGroupRequest = {
        groupName: formData.groupName.trim(),
        goalAmount,
        initialAmount,
        maxMembers,
        voteQuorum,
        dissolutionQuorum,
      }

      // console.log("=== 그룹 생성 데이터 디버깅 ===")
      // console.log("formData:", formData)
      //console.log("파싱된 값들:")
      //console.log("  maxMembers:", maxMembers, "(원본:", formData.groupMemberId, ")")
      //console.log("  initialAmount:", initialAmount, "(원본:", formData.initialInvestment, ")")
      //console.log("  goalAmount:", goalAmount, "(원본:", formData.targetInvestment, ")")
      //console.log("  voteQuorum:", voteQuorum, "(원본:", formData.voteQuorum, ")")
      //console.log("  dissolutionQuorum:", dissolutionQuorum, "(원본:", formData.dissolutionQuorum, ")")
      //console.log("최종 requestData:", requestData)
      //console.log("===============================")
      const result = await createGroup(requestData)
      //console.log("그룹 생성 완료:", result)

      // 페이 계좌 개설 화면으로 이동 (그룹 정보 전달)
      onComplete(result.groupId, formData.groupName.trim(), result.invitationCode)
    } catch (err) {
      //console.error("그룹 생성 실패:", err)
      
      let errorMessage = "그룹 생성에 실패했습니다. 다시 시도해주세요."
      
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

  // 입력값 유효성 검사 함수
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case "groupMemberId":
        if (!value.trim()) return "그룹 인원수를 입력해주세요."
        const memberCount = parseInt(value)
        if (isNaN(memberCount) || memberCount <= 0) {
          return "그룹 인원수는 1명 이상의 숫자여야 합니다."
        }
        if (memberCount > 100) {
          return "그룹 인원수는 100명 이하여야 합니다."
        }
        return null
      
      case "initialInvestment":
        if (!value.trim()) return "초기 투자금을 입력해주세요."
        const initialAmount = parseInt(value)
        if (isNaN(initialAmount) || initialAmount < 0) {
          return "초기 투자금은 0원 이상의 숫자여야 합니다."
        }
        return null
      
      case "targetInvestment":
        if (!value.trim()) return "목표 투자금을 입력해주세요."
        const goalAmount = parseInt(value)
        if (isNaN(goalAmount) || goalAmount <= 0) {
          return "목표 투자금은 0원보다 큰 숫자여야 합니다."
        }
        return null
      
      default:
        return null
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // 유효성 검사
    const fieldError = validateField(field, value)
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: fieldError || ""
    }))

    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      }

      // 그룹 인원수가 변경되면 정족수도 조정
      if (field === "groupMemberId") {
        const newMaxMembers = parseInt(value) || 1
        const currentVoteQuorum = parseInt(prev.voteQuorum) || 1
        const currentDissolutionQuorum = parseInt(prev.dissolutionQuorum) || 1

        // 현재 정족수가 새로운 최대 인원수를 초과하면 조정
        if (currentVoteQuorum > newMaxMembers) {
          newData.voteQuorum = newMaxMembers.toString()
        }
        if (currentDissolutionQuorum > newMaxMembers) {
          newData.dissolutionQuorum = newMaxMembers.toString()
        }
      }

      return newData
    })
  }

  // 폼 유효성 검사
  const isFormValid = () => {
    const requiredFields = ["groupName", "groupMemberId", "initialInvestment", "targetInvestment"]
    
    // 필수 필드가 모두 채워져 있는지 확인
    const allFieldsFilled = requiredFields.every(field => {
      const value = formData[field as keyof typeof formData]
      return value && value.trim() !== ""
    })
    
    // 필드별 오류가 없는지 확인
    const noFieldErrors = Object.values(fieldErrors).every(error => !error)
    
    // 숫자 필드 유효성 검사
    const memberCount = parseInt(formData.groupMemberId)
    const initialAmount = parseInt(formData.initialInvestment)
    const goalAmount = parseInt(formData.targetInvestment)
    
    const numericValidation = 
      !isNaN(memberCount) && memberCount > 0 && memberCount <= 100 &&
      !isNaN(initialAmount) && initialAmount >= 0 &&
      !isNaN(goalAmount) && goalAmount > 0 &&
      initialAmount <= goalAmount
    
    return allFieldsFilled && noFieldErrors && numericValidation
  }

  return (
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
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
            <div>
              <Input
                placeholder="그룹인원"
                value={formData.groupMemberId}
                onChange={(e) => handleInputChange("groupMemberId", e.target.value)}
                className={`h-13 rounded-2xl text-lg placeholder:text-gray-400 bg-white ${
                  fieldErrors.groupMemberId 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-200"
                }`}
                required
                type="number"
                min="1"
                max="100"
              />
              {fieldErrors.groupMemberId && (
                <p className="text-sm text-red-500 mt-1 ml-2">{fieldErrors.groupMemberId}</p>
              )}
            </div>

            {/* Initial Investment Input */}
            <div>
              <Input
                placeholder="초기 투자금(원당)"
                value={formData.initialInvestment}
                onChange={(e) => handleInputChange("initialInvestment", e.target.value)}
                className={`h-13 rounded-2xl text-lg placeholder:text-gray-400 bg-white ${
                  fieldErrors.initialInvestment 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-200"
                }`}
                required
                type="number"
                min="0"
              />
              {fieldErrors.initialInvestment && (
                <p className="text-sm text-red-500 mt-1 ml-2">{fieldErrors.initialInvestment}</p>
              )}
            </div>

            {/* Target Investment Input */}
            <div>
              <Input
                placeholder="목표 투자금(원상)"
                value={formData.targetInvestment}
                onChange={(e) => handleInputChange("targetInvestment", e.target.value)}
                className={`h-13 rounded-2xl text-lg placeholder:text-gray-400 bg-white ${
                  fieldErrors.targetInvestment 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-200"
                }`}
                required
                type="number"
                min="1"
              />
              {fieldErrors.targetInvestment && (
                <p className="text-sm text-red-500 mt-1 ml-2">{fieldErrors.targetInvestment}</p>
              )}
            </div>

            {/* Rules Section */}
            <div className="space-y-4 py-4">
              {/* 매매 규칙 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">매매 규칙</span>
                  <button type="button" className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                    <span className="text-xs text-gray-400">?</span>
                  </button>
                </div>
                <div className="w-20">
                  <Select
                    options={voteQuorumOptions}
                    value={formData.voteQuorum}
                    onChange={(value) => handleInputChange("voteQuorum", value)}
                    placeholder="선택"
                    className="text-sm"
                  />
                </div>
              </div>
              
              {/* 그룹 해체 규칙 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">그룹 해체 규칙</span>
                  <button type="button" className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                    <span className="text-xs text-gray-400">?</span>
                  </button>
                </div>
                <div className="w-20">
                  <Select
                    options={dissolutionQuorumOptions}
                    value={formData.dissolutionQuorum}
                    onChange={(value) => handleInputChange("dissolutionQuorum", value)}
                    placeholder="선택"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Payment Info Box */}
              {/* <div className="rounded-3xl p-3 mt-4" style={{ backgroundColor: '#F5F5F5' }}>
                <p className="text-xs text-gray-800 text-center leading-relaxed">
                  페이 계좌 연결 완료
                  <br />
                  김지수 352-0880-1877-000
                </p>
              </div> */}
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
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? "그룹 생성 중..." : "그룹 만들기"}
            </MainButton>
          </form>
        </div>
      </div>
    </div>
  )
}
