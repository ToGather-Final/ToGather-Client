// 사용자 상태 확인 및 리다이렉트 로직

export interface UserStatus {
  hasAccount: boolean
  hasGroup: boolean
  nextStep: 'account-create' | 'account-complete' | 'group-create' | 'group-join' | 'group'
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
  
  let nextStep: UserStatus['nextStep']
  
  if (!hasAccount) {
    nextStep = 'account-create'
  } else if (!hasGroup && !hasSeenAccountComplete) {
    // 계좌는 개설했지만 계좌 완료 화면을 안 본 경우
    nextStep = 'account-complete'
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

// 사용자 상태 초기화 (로그아웃 시)
export function resetUserStatus(userId: string): void {
  if (!userId) return
  localStorage.removeItem(getStorageKey('hasInvestmentAccount', userId))
  localStorage.removeItem(getStorageKey('hasGroup', userId))
  localStorage.removeItem(getStorageKey('hasSeenAccountComplete', userId))
}
