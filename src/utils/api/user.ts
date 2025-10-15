import { getAuthHeaders } from '@/utils/token'
import { API_GATEWAY_URL, API_ENDPOINTS } from './config'

const BASE_URL = API_GATEWAY_URL

export interface UserInfo {
  userId: string
  username: string
  nickname: string
}

// 내 정보 조회 API 호출
export async function getMyInfo(): Promise<UserInfo> {
  const url = `${BASE_URL}${API_ENDPOINTS.USER.ME}`
  
  const config: RequestInit = {
    method: 'GET',
    headers: {
      ...getAuthHeaders(), // Authorization 헤더
    },
  }

  try {
    console.log('=== Get My Info API Debug ===')
    console.log('Request URL:', url)
    console.log('=============================')
    
    const response = await fetch(url, config)
    
    console.log('Get My Info API Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Get My Info API Error:', errorText)
      throw new Error(`사용자 정보 조회 실패: ${response.status}`)
    }
    
    const data: UserInfo = await response.json()
    console.log('사용자 정보 조회 성공:', data)
    
    return data
  } catch (error) {
    console.error('Get My Info API Error:', error)
    throw error
  }
}

