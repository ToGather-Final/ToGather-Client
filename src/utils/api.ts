// API 모듈들의 통합 export
// 서비스별로 분리된 API 함수들을 하나의 진입점으로 제공합니다.

// 인증 관련 API (user-service)
export { signup, login, logout } from './api/auth'

// 트레이딩 관련 API (trading-service)
export { createInvestmentAccount } from './api/trading'

// 유저 관련 API (user-service)
export { getMyInfo } from './api/user'
export type { UserInfo } from './api/user'

// 그룹 관련 API (group-service)
export { createGroup, createPayAccount, getGroupStatus, joinGroup } from './api/group'
export type { CreateGroupRequest, CreateGroupResponse, CreatePayAccountRequest, GroupStatusResponse, GroupInfo, JoinGroupResponse } from '@/types/api/group'
