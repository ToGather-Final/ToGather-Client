// API 모듈들의 통합 export
// 서비스별로 분리된 API 함수들을 하나의 진입점으로 제공합니다.

// 인증 관련 API (user-service)
export { signup, login, logout } from './api/auth'

// 트레이딩 관련 API (trading-service)
export { createInvestmentAccount } from './api/trading'
