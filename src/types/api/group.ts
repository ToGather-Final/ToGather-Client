// 그룹 관련 API 타입 정의

// 그룹 생성 요청
export interface CreateGroupRequest {
  groupName: string
  goalAmount: number
  initialAmount: number
  maxMembers: number
  voteQuorum: number
  dissolutionQuorum: number
}

// 그룹 생성 응답
export interface CreateGroupResponse {
  groupId: string
  invitationCode: string
}

// 페이 계좌 개설 요청
export interface CreatePayAccountRequest {
  name: string
  englishLastName: string
  englishFirstName: string
  agreeToTerms: boolean
}

// 그룹 상태 확인 응답
export interface GroupStatusResponse {
  status: string
  currentMembers: number
  maxMembers: number
  isFull: boolean
}

// 그룹 참여 응답
export interface JoinGroupResponse {
  groupId: string
  groupName: string
}

// 그룹 정보
export interface GroupInfo {
  groupId: string
  groupName: string
  goalAmount: number
  initialAmount: number
  maxMembers: number
  currentMembers: number
  voteQuorum: number
  dissolutionQuorum: number
  createdAt: string
}

// 그룹 멤버 응답 (배열로 직접 반환)
export type GroupMemberResponse = GroupMember[]

// 그룹 멤버 정보
export interface GroupMember {
  userId: string
  nickname: string
  role: string
}

