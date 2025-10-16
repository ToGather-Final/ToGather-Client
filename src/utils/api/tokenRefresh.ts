import { getRefreshToken, saveTokens, clearTokens } from '@/utils/token'
import { getDeviceId } from '@/utils/deviceId'
import { API_GATEWAY_URL, API_ENDPOINTS } from './config'
import { LoginResponse } from '@/types/api/auth'

const BASE_URL = API_GATEWAY_URL

// 토큰 자동 갱신 함수
export async function refreshTokenIfNeeded(): Promise<boolean> {
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

// API 호출 기본 함수 (토큰 갱신 포함)
export async function apiCallWithTokenRefresh<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    console.log('API Response Status:', response.status)
    
    if (!response.ok) {
      // 401 에러이고 재시도 횟수가 0일 때 토큰 갱신 시도
      if (response.status === 401 && retryCount === 0) {
        console.log('401 Unauthorized - attempting token refresh...')
        const refreshed = await refreshTokenIfNeeded()
        
        if (refreshed) {
          console.log('Token refreshed successfully, retrying original request...')
          // 토큰 갱신 성공 시 원래 요청 재시도 (재시도 횟수 증가)
          return apiCallWithTokenRefresh<T>(endpoint, options, retryCount + 1)
        } else {
          console.log('Token refresh failed - clearing tokens and redirecting to login')
          // 토큰 갱신 실패 시 토큰 삭제 및 로그인 페이지로 리다이렉트
          clearTokens()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
        }
      }
      
      throw new Error(`API 호출 실패: ${response.status}`)
    }

    // 응답이 있는지 확인 후 JSON 파싱
    const text = await response.text()
    
    if (!text.trim()) {
      console.log('Empty response, returning empty object')
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
      throw new Error('서버에 연결할 수 없습니다.')
    }
    throw error
  }
}
