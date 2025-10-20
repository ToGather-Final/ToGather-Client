import { API_GATEWAY_URL, API_ENDPOINTS } from './config'
import { apiRequest } from './client'

// 페이머니 충전 요청
// 헤더: X-Group-Id, 바디: { amount, clientRequestId }
export async function rechargePay(groupId: string, amount: number): Promise<void> {
  const clientRequestId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) // very rare fallback

  await apiRequest<void>(`${API_GATEWAY_URL}${API_ENDPOINTS.PAY.TRANSFERS_RECHARGE}`, {
    method: 'POST',
    headers: {
      'X-Group-Id': groupId,
    },
    body: JSON.stringify({ amount, clientRequestId }),
  })
}

export type GroupPayAccountInfo = {
  id: string
  ownerUserId: string
  balance: number
  version: number
  nickname: string
  isActive: boolean
  groupId: string
  accountNumber: string
  createdAt: string
  updatedAt: string
}

export async function getGroupPayInfo(groupId: string): Promise<GroupPayAccountInfo> {
  const url = `${API_GATEWAY_URL}${API_ENDPOINTS.ACCOUNT.GROUP_PAY_INFO.replace('{groupId}', groupId)}`
  return apiRequest<GroupPayAccountInfo>(url, { method: 'GET' })
}


