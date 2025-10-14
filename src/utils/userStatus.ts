// 사용자 상태 확인 및 리다이렉트 로직

export interface UserStatus {
  hasAccount: boolean
  hasGroup: boolean
  nextStep: 'account-create' | 'group-create' | 'group-join' | 'group'
}

// 사용자 상태 확인 함수
export async function checkUserStatus(userId: string): Promise<UserStatus> {
  // TODO: 실제 API 호출로 사용자 상태 확인
  // 현재는 localStorage 기반으로 임시 구현
  
  const hasAccount = localStorage.getItem('hasInvestmentAccount') === 'true'
  const hasGroup = localStorage.getItem('hasGroup') === 'true'
  
  let nextStep: UserStatus['nextStep']
  
  if (!hasAccount) {
    nextStep = 'account-create'
  } else if (!hasGroup) {
    nextStep = 'group-create' // 또는 group-join 선택 페이지
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
export function markAccountCreated(): void {
  localStorage.setItem('hasInvestmentAccount', 'true')
}

// 그룹 생성/참여 완료 상태 업데이트
export function markGroupJoined(): void {
  localStorage.setItem('hasGroup', 'true')
}

// 사용자 상태 초기화 (로그아웃 시)
export function resetUserStatus(): void {
  localStorage.removeItem('hasInvestmentAccount')
  localStorage.removeItem('hasGroup')
}
