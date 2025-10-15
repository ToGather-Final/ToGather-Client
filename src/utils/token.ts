// 토큰 관리 유틸리티

const ACCESS_TOKEN_KEY = 'togather_access_token'
const REFRESH_TOKEN_KEY = 'togather_refresh_token'
const USER_ID_KEY = 'togather_user_id'

// 토큰 저장
export function saveTokens(accessToken: string, refreshToken: string, userId: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(USER_ID_KEY, userId)
}

// 액세스 토큰 가져오기
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

// 리프레시 토큰 가져오기
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

// 사용자 ID 가져오기
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_ID_KEY)
}

// 로그인 상태 확인
export function isLoggedIn(): boolean {
  return getAccessToken() !== null
}

// 토큰 삭제 (로그아웃)
export function clearTokens(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_ID_KEY)
}

// API 요청을 위한 Authorization 헤더 생성
export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
