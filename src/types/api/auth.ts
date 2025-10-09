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

// API 에러 응답 타입
export interface ApiError {
  message: string
  status: number
}
