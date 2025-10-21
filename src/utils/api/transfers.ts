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

// 거래 내역 조회
export interface TransactionHistoryItem {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface TransactionHistoryResponse {
  items: TransactionHistoryItem[];
  nextCursorCreatedAt?: string;
  nextCursorId?: string;
  hasMore: boolean;
}

export async function getTransactionHistory(
  accountId: string,
  size: number = 20,
  type?: string,
  cursorCreatedAt?: string,
  cursorId?: string
): Promise<TransactionHistoryResponse> {
  const params = new URLSearchParams({
    accountId,
    size: size.toString(),
  });
  
  if (type) params.append('type', type);
  if (cursorCreatedAt) params.append('cursorCreatedAt', cursorCreatedAt);
  if (cursorId) params.append('cursorId', cursorId);

  const url = `${API_GATEWAY_URL}${API_ENDPOINTS.PAY.HISTORY}?${params.toString()}`;
  console.log('🌐 거래 내역 API 요청 URL:', url);
  console.log('🌐 요청 파라미터:', { accountId, size, type, cursorCreatedAt, cursorId });

  const response = await apiRequest<TransactionHistoryResponse>(url, { method: 'GET' });
  console.log('🌐 거래 내역 API 응답:', response);
  
  return response;
}

// 결제 요청 인터페이스
export interface PaymentRequest {
  payerAccountId: string;
  amount: number;
  recipientName: string;
  recipientBankName: string;
  recipientAccountNumber: string;
  clientRequestId: string;
}

// QR 해석 결과 인터페이스
export interface QRResolveResponse {
  paymentSessionId: string;
  recipient: {
    recipientName: string;
    bankName: string;
    maskedAccountNo: string;
    logoUrl: string;
  };
  suggestedAmount: number;
  payerAccounts: Array<{
    accountId: string;
    accountType: string;
    displayName: string;
    balance: number;
  }>;
  expiresAt: string;
}

// QR 코드 해석
export async function resolveQR(qrData: string, amount?: number): Promise<QRResolveResponse> {
  const params = new URLSearchParams({
    m: qrData,
  });
  
  if (amount !== undefined) {
    params.append('a', amount.toString());
  }

  const url = `${API_GATEWAY_URL}${API_ENDPOINTS.PAY.QR_RESOLVE}?${params.toString()}`;
  console.log('🔍 QR 해석 API 요청 URL:', url);
  console.log('🔍 QR 해석 요청 파라미터:', { qrData, amount });

  const response = await apiRequest<QRResolveResponse>(url, { method: 'GET' });
  console.log('🔍 QR 해석 API 응답:', response);
  
  return response;
}

// 결제 처리
export async function processPayment(paymentData: PaymentRequest): Promise<void> {
  const url = `${API_GATEWAY_URL}${API_ENDPOINTS.PAY.PAYMENT}`;
  console.log('💳 결제 API 요청 URL:', url);
  console.log('💳 결제 요청 데이터:', paymentData);

  await apiRequest<void>(url, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
}


