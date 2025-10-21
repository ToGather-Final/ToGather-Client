import {
  getAuthHeaders,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "@/utils/token";
import { getDeviceId } from "@/utils/deviceId";
import type { ApiErrorWithStatus } from "@/types/api/auth";
import { API_GATEWAY_URL, API_ENDPOINTS } from "./config";
import type { OrderRequest, OrderResponse } from "@/types/api/stock";

const BASE_URL = API_GATEWAY_URL;

// 토큰 갱신 함수
async function refreshTokenIfNeeded(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  const deviceId = getDeviceId();

  if (!refreshToken || !deviceId) {
    console.log("Refresh token or device ID not found");
    return false;
  }

  try {
    console.log("Attempting to refresh token...");
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Refresh-Token": refreshToken,
        "X-Device-Id": deviceId,
      },
    });

    if (!response.ok) {
      console.log("Token refresh failed:", response.status);
      return false;
    }

    const newTokens = await response.json();
    console.log("Token refreshed successfully");

    // 새로운 토큰 저장
    saveTokens(newTokens.accessToken, newTokens.refreshToken, newTokens.userId);
    return true;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
}

// 투자 계좌 개설 API 호출
export async function createInvestmentAccount(userId: string): Promise<string> {
  const url = `${BASE_URL}${API_ENDPOINTS.TRADING.CREATE_ACCOUNT}`;

  const config: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(), // Authorization 헤더만 추가 (API Gateway가 X-User-Id 자동 추가)
    },
  };

  try {
    console.log("Creating investment account for user:", userId);
    console.log("Request URL:", url);
    console.log("Request config:", {
      method: config.method,
      headers: config.headers,
      body: config.body,
    });

    const response = await fetch(url, config);

    console.log(
      "Investment account creation response status:",
      response.status
    );
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      // 403 에러이고 토큰 갱신이 가능한 경우 토큰 갱신 시도
      if (response.status === 403) {
        console.log("403 Forbidden - attempting token refresh...");
        const refreshed = await refreshTokenIfNeeded();

        if (refreshed) {
          console.log(
            "Token refreshed successfully, retrying investment account creation..."
          );
          // 토큰 갱신 성공 시 원래 요청 재시도
          return createInvestmentAccount(userId);
        } else {
          console.log("Token refresh failed - redirecting to login");
          clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw {
            code: "AUTH_REFRESH_FAILED",
            message: "인증이 만료되었습니다. 다시 로그인해주세요.",
            path: "/trading/account/invest",
            timestamp: new Date().toISOString(),
            status: 403,
          } as ApiErrorWithStatus;
        }
      }

      try {
        const errorData = await response.json();
        if (errorData.code && errorData.message) {
          throw {
            code: errorData.code,
            message: errorData.message,
            path: errorData.path || "/trading/account/invest",
            timestamp: errorData.timestamp || new Date().toISOString(),
            status: response.status,
          } as ApiErrorWithStatus;
        }
        throw {
          code: `HTTP_${response.status}`,
          message: errorData.message || "투자 계좌 개설에 실패했습니다.",
          path: "/trading/account/invest",
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus;
      } catch (parseError) {
        if ((parseError as any).code) {
          throw parseError;
        }
        throw {
          code: `HTTP_${response.status}`,
          message: "투자 계좌 개설에 실패했습니다.",
          path: "/trading/account/invest",
          timestamp: new Date().toISOString(),
          status: response.status,
        } as ApiErrorWithStatus;
      }
    }

    const text = await response.text();
    console.log("Investment account creation response text:", text);
    console.log("Response text length:", text.length);
    console.log("Response text trimmed:", text.trim());

    if (!text.trim()) {
      console.log("Empty response detected");
      throw {
        code: "EMPTY_RESPONSE",
        message: "투자 계좌 개설 응답이 비어있습니다.",
        path: "/trading/account/invest",
        timestamp: new Date().toISOString(),
        status: 200,
      } as ApiErrorWithStatus;
    }

    // 응답 파싱 시도
    let accountId: string;
    try {
      // JSON으로 파싱 시도
      const parsed = JSON.parse(text);
      console.log("Parsed response:", parsed);

      if (typeof parsed === "string") {
        accountId = parsed;
      } else if (
        parsed &&
        typeof parsed === "object" &&
        "accountId" in parsed
      ) {
        accountId = parsed.accountId;
      } else {
        // JSON이지만 예상과 다른 형태인 경우
        accountId = text.replace(/"/g, "");
      }
    } catch (parseError) {
      console.log("JSON parse failed, treating as plain string");
      // JSON 파싱 실패 시 그냥 문자열로 처리
      accountId = text.replace(/"/g, "");
    }

    console.log("Final account ID:", accountId);
    return accountId;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw {
        code: "NETWORK_ERROR",
        message: "서버에 연결할 수 없습니다.",
        path: "/trading/account/invest",
        timestamp: new Date().toISOString(),
        status: 0,
      } as ApiErrorWithStatus;
    }
    throw error;
  }
}

// 매수 API 호출
export async function buyStock(data: {
  stockCode: string;
  quantity: number;
  price: number;
  reason: string;
  dueDate: string;
}): Promise<any> {
  const url = `${BASE_URL}${API_ENDPOINTS.TRADING.BUY}`;

  const config: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  };

  try {
    console.log("매수 주문 요청:", data);
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          return buyStock(data); // 재시도
        }
      }
      throw new Error(`매수 주문 실패: ${response.status}`);
    }

    const result = await response.json();
    console.log("매수 주문 성공:", result);
    return result;
  } catch (error) {
    console.error("매수 주문 에러:", error);
    throw error;
  }
}

// 매도 API 호출
export async function sellStock(data: {
  stockCode: string;
  quantity: number;
  price: number;
  reason: string;
  dueDate: string;
}): Promise<any> {
  const url = `${BASE_URL}${API_ENDPOINTS.TRADING.SELL}`;

  const config: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  };

  try {
    console.log("매도 주문 요청:", data);
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          return sellStock(data); // 재시도
        }
      }
      throw new Error(`매도 주문 실패: ${response.status}`);
    }

    const result = await response.json();
    console.log("매도 주문 성공:", result);
    return result;
  } catch (error) {
    console.error("매도 주문 에러:", error);
    throw error;
  }
}

// 포트폴리오 조회 API
export async function getPortfolio(): Promise<any> {
  const url = `${BASE_URL}${API_ENDPOINTS.TRADING.PORTFOLIO}`;

  const config: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  };

  try {
    console.log("포트폴리오 조회 요청");
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          return getPortfolio(); // 재시도
        }
      }
      throw new Error(`포트폴리오 조회 실패: ${response.status}`);
    }

    const result = await response.json();
    console.log("포트폴리오 조회 성공:", result);
    return result;
  } catch (error) {
    console.error("포트폴리오 조회 에러:", error);
    throw error;
  }
}

// 예수금 충전 API
export async function depositMoney(amount: number): Promise<any> {
  const url = `${BASE_URL}${API_ENDPOINTS.TRADING.DEPOSIT}`;

  const config: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ amount }),
  };

  try {
    console.log("예수금 충전 요청:", amount);
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          return depositMoney(amount); // 재시도
        }
      }
      throw new Error(`예수금 충전 실패: ${response.status}`);
    }

    const result = await response.json();
    console.log("예수금 충전 성공:", result);
    return result;
  } catch (error) {
    console.error("예수금 충전 에러:", error);
    throw error;
  }
}

// 새로운 주문 API (지정가/시장가 주문)
export async function placeOrder(
  orderData: OrderRequest
): Promise<OrderResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.TRADING.ORDERS}`;

  const config: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(orderData),
  };

  try {
    console.log("주문 요청:", orderData);
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          return placeOrder(orderData); // 재시도
        }
      }
      throw new Error(`주문 실패: ${response.status}`);
    }

    const result: OrderResponse = await response.json();
    console.log("주문 성공:", result);
    return result;
  } catch (error) {
    console.error("주문 에러:", error);
    throw error;
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
