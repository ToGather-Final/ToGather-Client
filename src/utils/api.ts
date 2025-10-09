import { SignupRequest, LoginRequest, LoginResponse, ApiError } from '@/types/api/auth'

const API_BASE_URL = 'http://localhost:8083' // user-service 포트

// API 호출 기본 함수
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  // 요청 정보 로깅
  // console.log('=== API Request ===')
  // console.log('URL:', url)
  // console.log('Method:', config.method || 'GET')
  // console.log('Headers:', config.headers)
  // if (config.body) {
  //   console.log('Body:', config.body)
  // }
  // console.log('==================')

  try {
    const response = await fetch(url, config)
    
    console.log('API Response Status:', response.status)
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      let errorMessage = 'API 호출에 실패했습니다.'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw {
        message: errorMessage,
        status: response.status,
      } as ApiError
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
      // 이는 서버에서 잘못된 JSON을 보내거나 빈 응답을 보낼 때 발생
      console.log('Treating parse error as su 서버가 실행 중인지 확인해주세요.ccess (empty object)')
      return {} as T
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw {
        message: '서버에 연결할 수 없습니다.',
        status: 0,
      } as ApiError
    }
    throw error
  }
}

// 회원가입 API 호출
export async function signup(data: SignupRequest): Promise<void> {
  await apiCall<void>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// 로그인 API 호출
export async function login(data: LoginRequest, deviceId: string): Promise<LoginResponse> {
  return apiCall<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: {
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify(data),
  })
}
