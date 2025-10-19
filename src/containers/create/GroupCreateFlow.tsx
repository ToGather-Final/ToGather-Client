"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import GroupCreateContainer from "./GroupCreateContainer"
import PayAccountSetupContainer from "./PayAccountSetupContainer"
import GroupCompleteContainer from "./GroupCompleteContainer"
import { markGroupJoined, markGroupCreated } from "@/utils/userStatus"
import { getUserId } from "@/utils/token"

export default function GroupCreateFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"group" | "pay" | "complete">("group")
  const [groupInfo, setGroupInfo] = useState<{
    groupId: string
    groupName: string
    invitationCode: string
  } | null>(null)

  const handleGroupCreateComplete = (groupId: string, groupName: string, invitationCode: string) => {
    setGroupInfo({ groupId, groupName, invitationCode })
    setCurrentStep("pay")
  }

  const handlePaySetupComplete = () => {
    setCurrentStep("complete")
  }

  const handleFinish = () => {
    // 그룹 참여 완료 상태 업데이트
    const userId = getUserId()
    if (userId && groupInfo) {
      markGroupJoined(userId)
      // 그룹 생성 완료 상태 저장
      markGroupCreated(userId, groupInfo.groupId, groupInfo.groupName, groupInfo.invitationCode)
      // console.log("그룹 참여 및 생성 완료 상태 업데이트 완료")
    }
    
    // 그룹 생성 완료 페이지로 이동
    router.push("/group-create-complete")
  }

  if (currentStep === "group") {
    return <GroupCreateContainer onComplete={handleGroupCreateComplete} />
  }

  if (currentStep === "pay" && groupInfo) {
    return <PayAccountSetupContainer onComplete={handlePaySetupComplete} groupId={groupInfo.groupId} />
  }

  if (currentStep === "complete" && groupInfo) {
    return (
      <GroupCompleteContainer 
        onFinish={handleFinish} 
        groupName={groupInfo.groupName}
        invitationCode={groupInfo.invitationCode}
        groupId={groupInfo.groupId}
      />
    )
  }

  return null
}
