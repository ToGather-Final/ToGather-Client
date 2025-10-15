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

