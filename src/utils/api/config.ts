// API Gateway 설정
// 모든 서비스 요청을 API Gateway로 통일

export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

// 서비스별 엔드포인트 (API Gateway 경로)
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // 트레이딩 관련
  TRADING: {
    CREATE_ACCOUNT: '/trading/account/invest',
    BUY: '/trade/buy',
    SELL: '/trade/sell',
    DEPOSIT: '/trade/deposit',
    PORTFOLIO: '/trading/portfolio/realtime',
    STOCKS: '/trading/stocks',
    ORDERBOOK: '/trading/stocks/{stock_code}/orderbook',
    DETAIL: '/trading/stocks/{stock_code}/detail',
    CHART: '/trading/stocks/{stock_code}/chart',
  },
  
  // 그룹 관련
  GROUP: {
    CREATE: '/groups',
    JOIN: '/groups/invites/{code}/accept',
    INFO: '/groups/{groupId}',
    STATUS: '/groups/{groupId}/status',
    RULES: '/groups/{groupId}/rules',
    MEMBERS: '/groups/{groupId}/members',
    PORTFOLIO: '/groups/{groupId}/potfolio',
    MY_GROUPS: '/groups/mine',
    ADD_MEMBER: '/groups/{groupId}/members',
    INVITE_CODE: '/groups/{groupId}/invites',
  },
  
  // 투표 관련
  VOTE: {
    LIST: '/vote',
    PROPOSE: '/vote',
    VOTE: '/vote/{proposalId}',
  },
  
  // 히스토리 관련
  HISTORY: {
    LIST: '/history',
    CALENDAR: '/history/calendar',
  },
  
  // 유저 관련
  USER: {
    ME: '/users/me',
    NICKNAME: '/users/me/nickname',
    EXISTS: '/users/exists',
    USER_NICKNAME: '/users/{userId}/nickname',
  },
  
  // 계좌 관련
  ACCOUNT: {
    CREATE_GROUP_PAY: '/pay/accounts/group-pay/{groupId}',
  },
  
  // 페이 관련
  PAY: {
    PAYMENT: '/payments',
    HISTORY: '/payments/history',
    QR_RESOLVE: '/qr/resolve',
  },
} as const
