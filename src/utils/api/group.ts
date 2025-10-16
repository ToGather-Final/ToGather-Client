import { getAuthHeaders } from '@/utils/token'
import { API_GATEWAY_URL, API_ENDPOINTS } from './config'
import { CreateGroupRequest, CreateGroupResponse } from '@/types/api/group'
import { ApiErrorWithStatus } from '@/types/api/auth'

const BASE_URL = API_GATEWAY_URL

// 그룹 생성 API 호출
export async function createGroup(data: CreateGroupRequest): Promise<CreateGroupResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.GROUP.CREATE}`
  
  const config: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Authorization 헤더
    },
    body: JSON.stringify(data),
  }

  try {
    console.log('=== Create Group API Debug ===')
    console.log('Request URL:', url)
    console.log('Request data:', data)
    console.log('===============================')
    
    const response = await fetch(url, config)
    
    console.log('Create Group API Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Create Group API Error:', errorText)
      
      let errorData: ApiErrorWithStatus
      try {
        const parsed = JSON.parse(errorText)
        errorData = {
          code: parsed.code || `HTTP_${response.status}`,
          message: parsed.message || '그룹 생성에 실패했습니다.',
          path: parsed.path || '/groups',
          timestamp: parsed.timestamp || new Date().toISOString(),
          status: response.status,
        }
      } catch {
        errorData = {
          code: `HTTP_${response.status}`,
          message: '그룹 생성에 실패했습니다.',
          path: '/groups',
          timestamp: new Date().toISOString(),
          status: response.status,
        }
      }
      
      throw errorData
    }
    
    const result: CreateGroupResponse = await response.json()
    console.log('그룹 생성 성공:', result)
    
    return result
  } catch (error) {
    console.error('Create Group API Error:', error)
    
    // ApiErrorWithStatus인 경우 그대로 throw
    if (error && typeof error === 'object' && 'code' in error) {
      throw error
    }
    
    // 네트워크 에러 등
    throw {
      code: 'NETWORK_ERROR',
      message: '그룹 생성 요청에 실패했습니다. 네트워크 연결을 확인해주세요.',
      path: '/groups',
      timestamp: new Date().toISOString(),
      status: 0,
    } as ApiErrorWithStatus
  }
}

