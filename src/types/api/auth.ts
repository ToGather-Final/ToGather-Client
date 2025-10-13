// 회원가입 요청 타입
export interface SignupRequest {
  username: string
  password: string
  passwordConfirm: string
  nickname: string
}

// 로그인 요청 타입
export interface LoginRequest {
  username: string
  password: string
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userId: string
}

// API 에러 응답 타입 (백엔드 응답)
export interface ApiError {
  code: string
  message: string
  path: string
  timestamp: string
}

// API 에러 타입 (프론트엔드에서 사용 - HTTP status 포함)
export interface ApiErrorWithStatus extends ApiError {
  status: number
}
