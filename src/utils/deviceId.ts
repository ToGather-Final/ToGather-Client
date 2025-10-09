// 기기 고유 ID 생성 및 관리 유틸리티

const DEVICE_ID_KEY = 'togather_device_id'

// 기기 고유 ID 생성
function generateDeviceId(): string {
  return 'device-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)
}

// 기기 고유 ID 가져오기 (없으면 생성해서 저장)
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    // SSR 환경에서는 임시 ID 반환
    return 'ssr-device-id'
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  
  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  
  return deviceId
}

// 기기 고유 ID 초기화 (테스트용)
export function resetDeviceId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEVICE_ID_KEY)
  }
}
