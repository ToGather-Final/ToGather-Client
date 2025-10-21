import { getAuthHeaders, getRefreshToken, saveTokens, clearTokens } from '@/utils/token';
import { getDeviceId } from '@/utils/deviceId';
import { API_GATEWAY_URL, API_ENDPOINTS } from './config';

// 토큰 자동 갱신 함수
async function refreshTokenIfNeeded(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  const deviceId = getDeviceId();
  
  console.log('🔍 Token refresh attempt:');
  console.log('  - refreshToken:', refreshToken ? 'exists' : 'null');
  console.log('  - deviceId:', deviceId ? 'exists' : 'null');
  console.log('  - localStorage keys:', Object.keys(localStorage).filter(key => key.includes('togather')));
  console.log('  - All localStorage keys:', Object.keys(localStorage));
  console.log('  - refreshToken value:', localStorage.getItem('togather_refresh_token'));
  console.log('  - accessToken value:', localStorage.getItem('togather_access_token'));
  
  if (!refreshToken || !deviceId) {
    console.log('❌ Refresh token or device ID not found');
    return false;
  }
  
  try {
    console.log('Attempting to refresh token...');
    const response = await fetch(`${API_GATEWAY_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshToken,
        'X-Device-Id': deviceId,
      },
    });
    
    if (!response.ok) {
      console.log('Token refresh failed:', response.status);
      return false;
    }
    
    const newTokens = await response.json();
    console.log('Token refreshed successfully');
    
    // 새로운 토큰 저장
    saveTokens(newTokens.accessToken, newTokens.refreshToken, newTokens.userId);
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

// 중앙화된 API 요청 함수
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, requestOptions);
    
    // 401 에러 시 토큰 갱신 시도
    if (response.status === 401) {
      console.log('401 Unauthorized - attempting token refresh...');
      const refreshSuccess = await refreshTokenIfNeeded();
      
      if (refreshSuccess) {
        // 토큰 갱신 성공 시 재시도
        console.log('Retrying request with refreshed token...');
        const retryResponse = await fetch(url, {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            ...getAuthHeaders(), // 새로운 토큰으로 헤더 업데이트
          },
        });
        
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        
        const retryData = await retryResponse.json();
        console.log('Request successful after token refresh');
        return retryData;
      } else {
        // 토큰 갱신 실패 시 로그만 찍기
        console.log('❌ Token refresh failed - but not clearing tokens for debugging');
        console.log('  - This means the original request will fail');
      }
    }
    
    if (!response.ok) {
      console.log(`❌ Original request failed with status: ${response.status}`);
      
      // 402 Payment Required - 잔액 부족
      if (response.status === 402) {
        const insufficientFundsError = new Error("잔액이 부족합니다! 페이 머니 충전 후 다시 이용해주세요.");
        (insufficientFundsError as any).status = 402;
        throw insufficientFundsError;
      }
      
      // 409 Conflict - 이미 투표했을 때
      if (response.status === 409) {
        const errorText = await response.text();
        let errorMessage = "이미 투표하셨습니다.";
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        
        const conflictError = new Error(errorMessage);
        (conflictError as any).status = 409;
        throw conflictError;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 응답 내용 확인
    // const responseText = await response.text();
    // console.log('📄 Response text:', responseText);
    
    // if (!responseText.trim()) {
    //   // console.log('⚠️ Empty response received');
    //   return {} as T;
    // }

    // try {
    //   const data = JSON.parse(responseText);
    //   // console.log('✅ Request successful');
    //   return data;
    // } catch (jsonError) {
    //   console.error('❌ JSON parsing failed:', jsonError);
    //   // console.log('Raw response:', responseText);
    //   throw new Error(`Invalid JSON response: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
    // }
    
    // 응답이 비어있는지 확인
    const responseText = await response.text();
    if (!responseText.trim()) {
      return {} as T;
    }
    
    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (jsonError) {
      console.error('❌ JSON parsing failed:', jsonError);
      console.log('Raw response:', responseText);
      throw new Error(`Invalid JSON response: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// GET 요청 헬퍼
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(`${API_GATEWAY_URL}${endpoint}`, {
    method: 'GET',
  });
}

// POST 요청 헬퍼
export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(`${API_GATEWAY_URL}${endpoint}`, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT 요청 헬퍼
export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(`${API_GATEWAY_URL}${endpoint}`, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE 요청 헬퍼
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(`${API_GATEWAY_URL}${endpoint}`, {
    method: 'DELETE',
  });
}
