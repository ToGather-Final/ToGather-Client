import { SignupRequest, LoginRequest, LoginResponse } from '@/types/api/auth'
import { ApiErrorWithStatus } from '@/types/api/auth'
import { getAuthHeaders, clearTokens } from '@/utils/token'
import { resetUserStatus } from '@/utils/userStatus'
import { API_GATEWAY_URL, API_ENDPOINTS } from './config'
import { apiCallWithTokenRefresh } from './tokenRefresh'

const BASE_URL = API_GATEWAY_URL

// API 호출 기본 함수 (토큰 갱신 포함)
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // 자동으로 Authorization 헤더 추가
      ...options.headers,
    },
  }

  return apiCallWithTokenRefresh<T>(endpoint, config)
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
      // 현재 그룹 ID도 제거
      localStorage.removeItem(`currentGroupId_${userId}`)
    }
  } catch (error) {
    // 에러가 발생해도 로컬 상태는 초기화
    const { getUserId } = require('@/utils/token')
    const userId = getUserId()
    clearTokens()
    if (userId) {
      resetUserStatus(userId)
      // 현재 그룹 ID도 제거
      localStorage.removeItem(`currentGroupId_${userId}`)
    }
    throw error
  }
}
