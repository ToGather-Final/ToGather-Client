// 사용자 상태 확인 및 리다이렉트 로직

export interface UserStatus {
  hasAccount: boolean
  hasGroup: boolean
  nextStep: 'account-create' | 'account-complete' | 'group-create' | 'group-join' | 'group' | 'group-created'
}

// localStorage 키 생성 헬퍼 함수
function getStorageKey(key: string, userId: string): string {
  return `${key}_${userId}`
}

// 사용자 상태 확인 함수
export async function checkUserStatus(userId: string): Promise<UserStatus> {
  // TODO: 실제 API 호출로 사용자 상태 확인
  // 현재는 localStorage 기반으로 임시 구현
  
  if (!userId) {
    return {
      hasAccount: false,
      hasGroup: false,
      nextStep: 'account-create'
    }
  }
  
  const hasAccount = localStorage.getItem(getStorageKey('hasInvestmentAccount', userId)) === 'true'
  const hasGroup = localStorage.getItem(getStorageKey('hasGroup', userId)) === 'true'
  const hasSeenAccountComplete = localStorage.getItem(getStorageKey('hasSeenAccountComplete', userId)) === 'true'
  const isGroupCreated = localStorage.getItem(getStorageKey('groupCreated', userId)) === 'true'
  
  let nextStep: UserStatus['nextStep']
  
  if (!hasAccount) {
    nextStep = 'account-create'
  } else if (!hasGroup && !hasSeenAccountComplete) {
    // 계좌는 개설했지만 계좌 완료 화면을 안 본 경우
    nextStep = 'account-complete'
  } else if (isGroupCreated) {
    // 그룹 생성이 완료된 경우
    nextStep = 'group-created'
  } else if (!hasGroup) {
    // 계좌 완료 화면을 봤지만 그룹에 참여하지 않은 경우
    nextStep = 'group-create'
  } else {
    nextStep = 'group'
  }
  
  return {
    hasAccount,
    hasGroup,
    nextStep
  }
}

// 계좌 개설 완료 상태 업데이트
export function markAccountCreated(userId: string): void {
  if (!userId) return
  localStorage.setItem(getStorageKey('hasInvestmentAccount', userId), 'true')
}

// 계좌 완료 화면 본 상태 업데이트
export function markAccountCompleteSeen(userId: string): void {
  if (!userId) return
  localStorage.setItem(getStorageKey('hasSeenAccountComplete', userId), 'true')
}

// 그룹 생성/참여 완료 상태 업데이트
export function markGroupJoined(userId: string): void {
  if (!userId) return
  localStorage.setItem(getStorageKey('hasGroup', userId), 'true')
}

// 그룹 생성 완료 상태 저장 (그룹 정보 포함)
export function markGroupCreated(userId: string, groupId: string, groupName: string, invitationCode: string): void {
  if (!userId) return
  localStorage.setItem(getStorageKey('hasGroup', userId), 'true')
  localStorage.setItem(getStorageKey('groupCreated', userId), 'true')
  localStorage.setItem(getStorageKey('createdGroupId', userId), groupId)
  localStorage.setItem(getStorageKey('createdGroupName', userId), groupName)
  localStorage.setItem(getStorageKey('createdInvitationCode', userId), invitationCode)
}

// 그룹 생성 완료 상태 확인
export function checkGroupCreated(userId: string): {
  isGroupCreated: boolean
  groupId?: string
  groupName?: string
  invitationCode?: string
} {
  console.log("=== checkGroupCreated 시작 ===")
  console.log("checkGroupCreated - userId:", userId)
  
  if (!userId) {
    console.log("checkGroupCreated - userId 없음")
    return { isGroupCreated: false }
  }
  
  const groupCreatedKey = getStorageKey('groupCreated', userId)
  const groupIdKey = getStorageKey('createdGroupId', userId)
  const groupNameKey = getStorageKey('createdGroupName', userId)
  const invitationCodeKey = getStorageKey('createdInvitationCode', userId)
  
  console.log("checkGroupCreated - localStorage 키들:")
  console.log("  groupCreatedKey:", groupCreatedKey)
  console.log("  groupIdKey:", groupIdKey)
  console.log("  groupNameKey:", groupNameKey)
  console.log("  invitationCodeKey:", invitationCodeKey)
  
  const isGroupCreated = localStorage.getItem(groupCreatedKey) === 'true'
  const groupId = localStorage.getItem(groupIdKey) || undefined
  const groupName = localStorage.getItem(groupNameKey) || undefined
  const invitationCode = localStorage.getItem(invitationCodeKey) || undefined
  
  console.log("checkGroupCreated - localStorage 값들:")
  console.log("  isGroupCreated:", isGroupCreated)
  console.log("  groupId:", groupId)
  console.log("  groupName:", groupName)
  console.log("  invitationCode:", invitationCode)
  
  const result = {
    isGroupCreated,
    groupId,
    groupName,
    invitationCode
  }
  
  console.log("checkGroupCreated - 최종 결과:", result)
  console.log("=== checkGroupCreated 끝 ===")
  
  return result
}

// 그룹 생성 완료 상태 초기화
export function clearGroupCreated(userId: string): void {
  console.log("=== clearGroupCreated 시작 ===")
  console.log("clearGroupCreated - userId:", userId)
  
  if (!userId) {
    console.log("clearGroupCreated - userId 없음")
    return
  }
  
  const groupCreatedKey = getStorageKey('groupCreated', userId)
  const groupIdKey = getStorageKey('createdGroupId', userId)
  const groupNameKey = getStorageKey('createdGroupName', userId)
  const invitationCodeKey = getStorageKey('createdInvitationCode', userId)
  
  console.log("clearGroupCreated - 삭제 전 localStorage 상태:")
  console.log("  groupCreated:", localStorage.getItem(groupCreatedKey))
  console.log("  createdGroupId:", localStorage.getItem(groupIdKey))
  console.log("  createdGroupName:", localStorage.getItem(groupNameKey))
  console.log("  createdInvitationCode:", localStorage.getItem(invitationCodeKey))
  
  localStorage.removeItem(groupCreatedKey)
  localStorage.removeItem(groupIdKey)
  localStorage.removeItem(groupNameKey)
  localStorage.removeItem(invitationCodeKey)
  
  console.log("clearGroupCreated - 삭제 후 localStorage 상태:")
  console.log("  groupCreated:", localStorage.getItem(groupCreatedKey))
  console.log("  createdGroupId:", localStorage.getItem(groupIdKey))
  console.log("  createdGroupName:", localStorage.getItem(groupNameKey))
  console.log("  createdInvitationCode:", localStorage.getItem(invitationCodeKey))
  
  console.log("=== clearGroupCreated 끝 ===")
}

// 사용자 상태 초기화 (로그아웃 시)
export function resetUserStatus(userId: string): void {
  if (!userId) return
  localStorage.removeItem(getStorageKey('hasInvestmentAccount', userId))
  localStorage.removeItem(getStorageKey('hasGroup', userId))
  localStorage.removeItem(getStorageKey('hasSeenAccountComplete', userId))
  localStorage.removeItem(getStorageKey('groupCreated', userId))
  localStorage.removeItem(getStorageKey('createdGroupId', userId))
  localStorage.removeItem(getStorageKey('createdGroupName', userId))
  localStorage.removeItem(getStorageKey('createdInvitationCode', userId))
}
