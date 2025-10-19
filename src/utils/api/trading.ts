import { getAuthHeaders, getRefreshToken, saveTokens, clearTokens } from '@/utils/token'
import { getDeviceId } from '@/utils/deviceId'
import type { ApiErrorWithStatus } from '@/types/api/auth'
import { API_GATEWAY_URL, API_ENDPOINTS } from './config'

const BASE_URL = API_GATEWAY_URL

// 토큰 갱신 함수
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
    
    const newTokens = await response.json()
    console.log('Token refreshed successfully')
    
    // 새로운 토큰 저장
    saveTokens(newTokens.accessToken, newTokens.refreshToken, newTokens.userId)
    return true
  } catch (error) {
    console.error('Token refresh error:', error)
    return false
  }
}

// 투자 계좌 개설 API 호출
export async function createInvestmentAccount(userId: string): Promise<string> {
  const url = `${BASE_URL}${API_ENDPOINTS.TRADING.CREATE_ACCOUNT}`
  
  const config: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Authorization 헤더만 추가 (API Gateway가 X-User-Id 자동 추가)
    },
  }

  try {
    console.log('Creating investment account for user:', userId)
    console.log('Request URL:', url)
    console.log('Request config:', {
      method: config.method,
      headers: config.headers,
      body: config.body
    })
    
    const response = await fetch(url, config)
    
    console.log('Investment account creation response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      // 403 에러이고 토큰 갱신이 가능한 경우 토큰 갱신 시도
      if (response.status === 403) {
        console.log('403 Forbidden - attempting token refresh...')
        const refreshed = await refreshTokenIfNeeded()
        
        if (refreshed) {
          console.log('Token refreshed successfully, retrying investment account creation...')
          // 토큰 갱신 성공 시 원래 요청 재시도
          return createInvestmentAccount(userId)
        } else {
          console.log('Token refresh failed - redirecting to login')
          clearTokens()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          throw {
            code: 'AUTH_REFRESH_FAILED',
            message: '인증이 만료되었습니다. 다시 로그인해주세요.',
            path: '/trading/account/invest',
            timestamp: new Date().toISOString(),
            status: 403,
          } as ApiErrorWithStatus
        }
      }
      
      try {
        const errorData = await response.json()
        if (errorData.code && errorData.message) {
          throw {
            code: errorData.code,
            message: errorData.message,
            path: errorData.path || '/trading/account/invest',
            timestamp: errorData.timestamp || new Date().toISOString(),
            status: response.status,
          } as ApiErrorWithStatus
        }
        throw {
          code: `HTTP_${response.status}`,
          message: errorData.message || '투자 계좌 개설에 실패했습니다.',
          path: '/trading/account/invest',
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus
      } catch (parseError) {
        if ((parseError as any).code) {
          throw parseError
        }
        throw {
          code: `HTTP_${response.status}`,
          message: '투자 계좌 개설에 실패했습니다.',
          path: '/trading/account/invest',
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus
      }
    }

    const text = await response.text()
    console.log('Investment account creation response text:', text)
    console.log('Response text length:', text.length)
    console.log('Response text trimmed:', text.trim())
    
    if (!text.trim()) {
      console.log('Empty response detected')
      throw {
        code: 'EMPTY_RESPONSE',
        message: '투자 계좌 개설 응답이 비어있습니다.',
        path: '/trading/account/invest',
        timestamp: new Date().toISOString(),
        status: 200,
      } as ApiErrorWithStatus
    }
    
    // 응답 파싱 시도
    let accountId: string
    try {
      // JSON으로 파싱 시도
      const parsed = JSON.parse(text)
      console.log('Parsed response:', parsed)
      
      if (typeof parsed === 'string') {
        accountId = parsed
      } else if (parsed && typeof parsed === 'object' && 'accountId' in parsed) {
        accountId = parsed.accountId
      } else {
        // JSON이지만 예상과 다른 형태인 경우
        accountId = text.replace(/"/g, '')
      }
    } catch (parseError) {
      console.log('JSON parse failed, treating as plain string')
      // JSON 파싱 실패 시 그냥 문자열로 처리
      accountId = text.replace(/"/g, '')
    }
    
    console.log('Final account ID:', accountId)
    return accountId
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw {
        code: 'NETWORK_ERROR',
        message: '서버에 연결할 수 없습니다.',
        path: '/trading/account/invest',
        timestamp: new Date().toISOString(),
        status: 0,
      } as ApiErrorWithStatus
    }
    throw error
  }
}

// TODO: 추가할 trading API들
// - 매수: POST /trade/buy
// - 매도: POST /trade/sell
// - 예수금 충전: POST /trade/deposit
// - 포트폴리오: POST /trading/portfolio/realtime
// - 주식 리스트: GET /trading/stocks
// - 주식 호가창: GET /trading/stocks/{stock_code}/orderbook
// - 간단차트: GET /trading/stocks/{stock_code}/detail
// - 캔들차트: GET /trading/stocks/{stock_code}/chart
