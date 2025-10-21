import { getAuthHeaders } from '@/utils/token'
import { API_GATEWAY_URL, API_ENDPOINTS } from './config'
import { CreateGroupRequest, CreateGroupResponse, CreatePayAccountRequest, GroupStatusResponse, JoinGroupResponse, GroupMemberResponse } from '@/types/api/group'
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
    console.log('Request headers:', config.headers)
    console.log('Request body:', config.body)
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

// 페이 계좌 개설 API 호출
export async function createPayAccount(groupId: string, data: CreatePayAccountRequest): Promise<void> {
  const url = `${BASE_URL}${API_ENDPOINTS.ACCOUNT.CREATE_GROUP_PAY.replace('{groupId}', groupId)}`
  
  const config: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Authorization 헤더
    },
    body: JSON.stringify(data),
  }

  try {
    console.log('=== Create Pay Account API Debug ===')
    console.log('Request URL:', url)
    console.log('Request data:', data)
    console.log('====================================')
    
    const response = await fetch(url, config)
    
    console.log('Create Pay Account API Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Create Pay Account API Error:', errorText)
      
      let errorData: ApiErrorWithStatus
      try {
        const parsed = JSON.parse(errorText)
        errorData = {
          code: parsed.code || `HTTP_${response.status}`,
          message: parsed.message || '페이 계좌 개설에 실패했습니다.',
          path: parsed.path || `/accounts/group-pay/${groupId}`,
          timestamp: parsed.timestamp || new Date().toISOString(),
          status: response.status,
        }
      } catch {
        errorData = {
          code: `HTTP_${response.status}`,
          message: '페이 계좌 개설에 실패했습니다.',
          path: `/accounts/group-pay/${groupId}`,
          timestamp: new Date().toISOString(),
          status: response.status,
        }
      }
      
      throw errorData
    }
    
    console.log('페이 계좌 개설 성공')
  } catch (error) {
    console.error('Create Pay Account API Error:', error)
    
    // ApiErrorWithStatus인 경우 그대로 throw
    if (error && typeof error === 'object' && 'code' in error) {
      throw error
    }
    
    // 네트워크 에러 등
    throw {
      code: 'NETWORK_ERROR',
      message: '페이 계좌 개설 요청에 실패했습니다. 네트워크 연결을 확인해주세요.',
      path: `/accounts/group-pay/${groupId}`,
      timestamp: new Date().toISOString(),
      status: 0,
    } as ApiErrorWithStatus
  }
}

// 그룹 상태 확인 API 호출
export async function getGroupStatus(groupId: string): Promise<GroupStatusResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.GROUP.STATUS.replace('{groupId}', groupId)}`
  
  const config: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Authorization 헤더
    },
  }

  try {
    console.log('=== Get Group Status API Debug ===')
    console.log('Request URL:', url)
    console.log('==================================')
    
    const response = await fetch(url, config)
    
    console.log('Get Group Status API Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Get Group Status API Error:', errorText)
      
      let errorData: ApiErrorWithStatus
      try {
        const parsed = JSON.parse(errorText)
        errorData = {
          code: parsed.code || `HTTP_${response.status}`,
          message: parsed.message || '그룹 상태 확인에 실패했습니다.',
          path: parsed.path || `/groups/${groupId}/status`,
          timestamp: parsed.timestamp || new Date().toISOString(),
          status: response.status,
        }
      } catch {
        errorData = {
          code: `HTTP_${response.status}`,
          message: '그룹 상태 확인에 실패했습니다.',
          path: `/groups/${groupId}/status`,
          timestamp: new Date().toISOString(),
          status: response.status,
        }
      }
      
      throw errorData
    }
    
    const result: GroupStatusResponse = await response.json()
    console.log('그룹 상태 확인 성공:', result)
    
    return result
  } catch (error) {
    console.error('Get Group Status API Error:', error)
    
    // ApiErrorWithStatus인 경우 그대로 throw
    if (error && typeof error === 'object' && 'code' in error) {
      throw error
    }
    
    // 네트워크 에러 등
    throw {
      code: 'NETWORK_ERROR',
      message: '그룹 상태 확인 요청에 실패했습니다. 네트워크 연결을 확인해주세요.',
      path: `/groups/${groupId}/status`,
      timestamp: new Date().toISOString(),
      status: 0,
    } as ApiErrorWithStatus
  }
}

// 그룹 참여 API 호출
export async function joinGroup(code: string): Promise<JoinGroupResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.GROUP.JOIN.replace('{code}', code)}`
  
  const config: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Authorization 헤더
    },
  }

  try {
    console.log('=== Join Group API Debug ===')
    console.log('Request URL:', url)
    console.log('Request code:', code)
    console.log('============================')
    
    const response = await fetch(url, config)
    
    console.log('Join Group API Response Status:', response.status)
    
    if (response.status === 204) {
      // 204 No Content 응답인 경우, 응답 본문이 없을 수 있음
      console.log('Join Group API: 204 No Content - 그룹 참여 성공')
      
      // 204 응답이지만 실제로는 JSON 데이터가 올 수 있음
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        console.log('Join Group API Response Data:', data)
        return data
      } else {
        // 204 응답이지만 데이터가 없는 경우, 에러 처리
        throw {
          code: 'NO_CONTENT_ERROR',
          message: '그룹 참여에 실패했습니다.',
          path: `/groups/invites/${code}/accept`,
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Join Group API Error Response:', errorData)
      throw {
        code: `HTTP_${response.status}`,
        message: errorData.message || `그룹 참여에 실패했습니다. (${response.status})`,
        path: `/groups/invites/${code}/accept`,
        timestamp: new Date().toISOString(),
        status: response.status,
      } as ApiErrorWithStatus
    }
    
    const data = await response.json()
    console.log('Join Group API Response Data:', data)
    return data
    
  } catch (error) {
    console.error('Join Group API Error:', error)
    throw error
  }
}

// 그룹 멤버 조회 API 호출
export async function getGroupMembers(groupId: string): Promise<GroupMemberResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.GROUP.MEMBERS.replace('{groupId}', groupId)}`
  
  const config: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Authorization 헤더
    },
  }

  try {
    console.log('=== Get Group Members API Debug ===')
    console.log('Request URL:', url)
    console.log('===================================')
    
    const response = await fetch(url, config)
    
    console.log('Get Group Members API Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Get Group Members API Error:', errorText)
      
      let errorData: ApiErrorWithStatus
      try {
        const parsed = JSON.parse(errorText)
        errorData = {
          code: parsed.code || `HTTP_${response.status}`,
          message: parsed.message || '그룹 멤버 조회에 실패했습니다.',
          path: parsed.path || `/groups/${groupId}/members`,
          timestamp: parsed.timestamp || new Date().toISOString(),
          status: response.status,
        }
      } catch {
        errorData = {
          code: `HTTP_${response.status}`,
          message: '그룹 멤버 조회에 실패했습니다.',
          path: `/groups/${groupId}/members`,
          timestamp: new Date().toISOString(),
          status: response.status,
        }
      }
      
      throw errorData
    }
    
    const result: GroupMemberResponse = await response.json()
    console.log('그룹 멤버 조회 성공:', result)
    
    return result
  } catch (error) {
    console.error('Get Group Members API Error:', error)
    
    // ApiErrorWithStatus인 경우 그대로 throw
    if (error && typeof error === 'object' && 'code' in error) {
      throw error
    }
    
    // 네트워크 에러 등
    throw {
      code: 'NETWORK_ERROR',
      message: '그룹 멤버 조회 요청에 실패했습니다. 네트워크 연결을 확인해주세요.',
      path: `/groups/${groupId}/members`,
      timestamp: new Date().toISOString(),
      status: 0,
    } as ApiErrorWithStatus
  }
}

