import { SignupRequest, LoginRequest, LoginResponse, ApiErrorWithStatus } from '@/types/api/auth'
import { getAuthHeaders, getRefreshToken, saveTokens, clearTokens } from '@/utils/token'
import { resetUserStatus } from '@/utils/userStatus'
import { getDeviceId } from '@/utils/deviceId'
import { API_GATEWAY_URL, API_ENDPOINTS } from './config'

const BASE_URL = API_GATEWAY_URL

// 토큰 자동 갱신 함수
async function refreshTokenIfNeeded(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  const deviceId = getDeviceId()
  
  if (!refreshToken || !deviceId) {
    console.log('Refresh token or device ID not found')
    return false
  }
  
  try {
    console.log('Attempting to refresh token...')
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshToken,
        'X-Device-Id': deviceId,
      },
    })
    
    if (!response.ok) {
      console.log('Token refresh failed:', response.status)
      return false
    }
    
    const newTokens: LoginResponse = await response.json()
    console.log('Token refreshed successfully')
    
    // 새로운 토큰 저장
    saveTokens(newTokens.accessToken, newTokens.refreshToken, newTokens.userId)
    return true
  } catch (error) {
    console.error('Token refresh error:', error)
    return false
  }
}

// API 호출 기본 함수
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // 자동으로 Authorization 헤더 추가
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    console.log('API Response Status:', response.status)
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      // 401 에러이고 재시도 횟수가 0일 때 토큰 갱신 시도
      if (response.status === 401 && retryCount === 0) {
        console.log('401 Unauthorized - attempting token refresh...')
        const refreshed = await refreshTokenIfNeeded()
        
        if (refreshed) {
          console.log('Token refreshed successfully, retrying original request...')
          // 토큰 갱신 성공 시 원래 요청 재시도 (재시도 횟수 증가)
          return apiCall<T>(endpoint, options, retryCount + 1)
        } else {
          console.log('Token refresh failed - clearing tokens and redirecting to login')
          // 토큰 갱신 실패 시 토큰 삭제 및 로그인 페이지로 리다이렉트
          clearTokens()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          throw {
            code: 'AUTH_REFRESH_FAILED',
            message: '인증이 만료되었습니다. 다시 로그인해주세요.',
            path: endpoint,
            timestamp: new Date().toISOString(),
            status: 401,
          } as ApiErrorWithStatus
        }
      }
      
      try {
        const errorData = await response.json()
        // 백엔드에서 ApiError 형식으로 응답하는 경우
        if (errorData.code && errorData.message) {
          throw {
            code: errorData.code,
            message: errorData.message,
            path: errorData.path || endpoint,
            timestamp: errorData.timestamp || new Date().toISOString(),
            status: response.status, // HTTP status는 별도로 추가
          } as ApiErrorWithStatus
        }
        // 다른 형식의 에러 응답인 경우
        throw {
          code: `HTTP_${response.status}`,
          message: errorData.message || 'API 호출에 실패했습니다.',
          path: endpoint,
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus
      } catch (parseError) {
        // JSON 파싱 실패 시 기본 에러
        if ((parseError as any).code) {
          throw parseError // 이미 만들어진 에러 객체
        }
        throw {
          code: `HTTP_${response.status}`,
          message: 'API 호출에 실패했습니다.',
          path: endpoint,
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus
      }
    }

    // 204 No Content이거나 빈 응답인 경우 빈 객체 반환
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      console.log('Empty response detected, returning empty object')
      return {} as T
    }

    // 응답이 있는지 확인 후 JSON 파싱
    const text = await response.text()
    console.log('Response text:', text)
    
    if (!text.trim()) {
      console.log('Empty text response, returning empty object')
      return {} as T
    }
    
    try {
      const parsed = JSON.parse(text)
      console.log('Parsed response:', parsed)
      return parsed
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.log('Raw response text:', text)
      
      // JSON 파싱 실패 시에도 빈 객체 반환 (성공 응답으로 처리)
      console.log('Treating parse error as success (empty object)')
      return {} as T
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw {
        code: 'NETWORK_ERROR',
        message: '서버에 연결할 수 없습니다.',
        path: endpoint,
        timestamp: new Date().toISOString(),
        status: 0,
      } as ApiErrorWithStatus
    }
    throw error
  }
}

// 회원가입 API 호출 (Authorization 헤더 제외, X-Device-Id 헤더 포함)
export async function signup(data: SignupRequest, deviceId?: string): Promise<void> {
  const url = `${BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // X-Device-Id 헤더 추가 (제공된 경우)
  if (deviceId) {
    headers['X-Device-Id'] = deviceId
  }
  
  const config: RequestInit = {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  }

  try {
    console.log('=== Signup API Debug ===')
    console.log('Request URL:', url)
    console.log('Request data:', data)
    console.log('Device ID:', deviceId)
    console.log('Headers:', headers)
    console.log('========================')
    
    const response = await fetch(url, config)
    
    console.log('Signup API Response Status:', response.status)
    
    if (!response.ok) {
      try {
        const errorData = await response.json()
        // 백엔드에서 ApiError 형식으로 응답하는 경우
        if (errorData.code && errorData.message) {
          throw {
            code: errorData.code,
            message: errorData.message,
            path: errorData.path || '/auth/signup',
            timestamp: errorData.timestamp || new Date().toISOString(),
            status: response.status,
          } as ApiErrorWithStatus
        }
        // 다른 형식의 에러 응답인 경우
        throw {
          code: `HTTP_${response.status}`,
          message: errorData.message || '회원가입에 실패했습니다.',
          path: '/auth/signup',
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus
      } catch (parseError) {
        if ((parseError as any).code) {
          throw parseError
        }
        throw {
          code: `HTTP_${response.status}`,
          message: '회원가입에 실패했습니다.',
          path: '/auth/signup',
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus
      }
    }

    // 204 No Content이거나 빈 응답인 경우 정상 처리
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      console.log('Signup completed successfully')
      return
    }

    // 응답이 있는지 확인
    const text = await response.text()
    if (!text.trim()) {
      console.log('Empty signup response')
      return
    }
    
    // JSON 응답이 있는 경우 파싱
    try {
      JSON.parse(text)
    } catch (parseError) {
      console.error('Signup JSON parse error:', parseError)
      // 파싱 실패해도 200 응답이면 성공으로 처리
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw {
        code: 'NETWORK_ERROR',
        message: '서버에 연결할 수 없습니다.',
        path: '/auth/signup',
        timestamp: new Date().toISOString(),
        status: 0,
      } as ApiErrorWithStatus
    }
    throw error
  }
}

// 로그인 API 호출 (Authorization 헤더 제외)
export async function login(data: LoginRequest, deviceId: string): Promise<LoginResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`
  
  console.log('=== Login API Debug ===')
  console.log('Request URL:', url)
  console.log('Request data:', data)
  console.log('Device ID:', deviceId)
  console.log('========================')
  
  const config: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify(data),
  }

  try {
    console.log('Sending login request to:', url)
    const response = await fetch(url, config)
    
    console.log('Login API Response Status:', response.status)
    
    if (!response.ok) {
      try {
        const errorData = await response.json()
        // 백엔드에서 ApiError 형식으로 응답하는 경우
        if (errorData.code && errorData.message) {
          throw {
            code: errorData.code,
            message: errorData.message,
            path: errorData.path || '/auth/login',
            timestamp: errorData.timestamp || new Date().toISOString(),
            status: response.status,
          } as ApiErrorWithStatus
        }
        // 다른 형식의 에러 응답인 경우
        throw {
          code: `HTTP_${response.status}`,
          message: errorData.message || '로그인에 실패했습니다.',
          path: '/auth/login',
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus
      } catch (parseError) {
        if ((parseError as any).code) {
          throw parseError
        }
        throw {
          code: `HTTP_${response.status}`,
          message: '로그인에 실패했습니다.',
          path: '/auth/login',
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus
      }
    }

    const text = await response.text()
    console.log('Login response text:', text)
    
    if (!text.trim()) {
      console.log('Empty login response')
      throw {
        code: 'EMPTY_RESPONSE',
        message: '로그인 응답이 비어있습니다.',
        path: '/auth/login',
        timestamp: new Date().toISOString(),
        status: 200,
      } as ApiErrorWithStatus
    }
    
    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error('Login JSON parse error:', parseError)
      throw {
        code: 'PARSE_ERROR',
        message: '로그인 응답을 파싱할 수 없습니다.',
        path: '/auth/login',
        timestamp: new Date().toISOString(),
        status: 200,
      } as ApiErrorWithStatus
    }
  } catch (error) {
    console.log('=== Login API Error Debug ===')
    console.log('Error type:', typeof error)
    console.log('Error instance:', error instanceof TypeError)
    console.log('Error message:', error instanceof TypeError ? error.message : 'Unknown error')
    console.log('Full error:', error)
    console.log('==============================')
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.log('Network error detected - server not reachable')
      throw {
        code: 'NETWORK_ERROR',
        message: '서버에 연결할 수 없습니다.',
        path: '/auth/login',
        timestamp: new Date().toISOString(),
        status: 0,
      } as ApiErrorWithStatus
    }
    throw error
  }
}

// 로그아웃 API 호출
export async function logout(): Promise<void> {
  try {
    // 로그아웃 전에 userId 가져오기
    const { getUserId } = require('@/utils/token')
    const userId = getUserId()
    
    await apiCall<void>(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    })
    
    // API 호출 성공/실패와 관계없이 로컬 상태 초기화
    clearTokens()
    if (userId) {
      resetUserStatus(userId)
    }
  } catch (error) {
    // 에러가 발생해도 로컬 상태는 초기화
    const { getUserId } = require('@/utils/token')
    const userId = getUserId()
    clearTokens()
    if (userId) {
      resetUserStatus(userId)
    }
    throw error
  }
}
