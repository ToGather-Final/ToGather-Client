import { GroupInfo } from "@/types/api/group";
import {
  getAuthHeaders,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "@/utils/token";
import { getDeviceId } from "@/utils/deviceId";
import type { ApiErrorWithStatus } from "@/types/api/auth";
import { API_GATEWAY_URL, API_ENDPOINTS } from "@/utils/api/config";

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

// 그룹 정보 조회 API 호출
export async function getGroupInfo(url: string): Promise<GroupInfo> {
  const config: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(), // Authorization 헤더
    },
  };

  try {
    console.log("=== Get Group Info API Debug ===");
    console.log("Request URL:", url);
    console.log("Request config:", {
      method: config.method,
      headers: config.headers,
    });
    console.log("=================================");

    const response = await fetch(url, config);

    console.log("Group info response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // 403 에러 - 토큰 갱신 시도
    if (response.status === 403) {
      console.log("403 Forbidden - attempting token refresh...");
      const refreshed = await refreshTokenIfNeeded();

      if (refreshed) {
        console.log("Token refreshed successfully, retrying group info...");
        // 토큰 갱신 성공 시 원래 요청 재시도
        return getGroupInfo(url);
      } else {
        console.log("Token refresh failed - redirecting to login");
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw {
          code: "AUTH_REFRESH_FAILED",
          message: "인증이 만료되었습니다. 다시 로그인해주세요.",
          path: url,
          timestamp: new Date().toISOString(),
          status: 403,
        } as ApiErrorWithStatus;
      }
    }

    if (!response.ok) {
      // 먼저 응답을 텍스트로 읽기
      const errorText = await response.text();
      console.error("API 에러 응답 Status:", response.status);
      console.error("API 에러 응답 Text:", errorText);

      let errorData: ApiErrorWithStatus;
      try {
        // JSON 파싱 시도
        const parsed = JSON.parse(errorText);
        errorData = {
          code: parsed.code || `HTTP_${response.status}`,
          message: parsed.message || "그룹 정보 조회에 실패했습니다.",
          path: parsed.path || url,
          timestamp: parsed.timestamp || new Date().toISOString(),
          status: response.status,
        };
      } catch {
        // JSON 파싱 실패 시 기본 에러 메시지
        errorData = {
          code: `HTTP_${response.status}`,
          message: "그룹 정보 조회에 실패했습니다.",
          path: url,
          timestamp: new Date().toISOString(),
          status: response.status,
        };
      }

      throw errorData;
    }

    const text = await response.text();
    console.log("Group info response text:", text.substring(0, 200));
    console.log("Response text length:", text.length);

    if (!text.trim()) {
      console.log("Empty response detected");
      throw {
        code: "EMPTY_RESPONSE",
        message: "그룹 정보 조회 응답이 비어있습니다.",
        path: url,
        timestamp: new Date().toISOString(),
        status: 200,
      } as ApiErrorWithStatus;
    }

    // 응답 파싱
    let parsedData: GroupInfo;
    try {
      parsedData = JSON.parse(text);
      console.log("Parsed response:", parsedData);
    } catch (parseError) {
      console.error("JSON 파싱 실패:", parseError);
      console.error("원본 응답:", text);
      throw {
        code: "JSON_PARSE_ERROR",
        message: "응답 데이터 파싱에 실패했습니다.",
        path: url,
        timestamp: new Date().toISOString(),
        status: response.status,
      } as ApiErrorWithStatus;
    }

    console.log("그룹 정보 조회 성공:", parsedData);
    return parsedData;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw {
        code: "NETWORK_ERROR",
        message: "서버에 연결할 수 없습니다.",
        path: url,
        timestamp: new Date().toISOString(),
        status: 0,
      } as ApiErrorWithStatus;
    }

    // 이미 구조화된 에러인 경우 그대로 throw
    if ((error as any).code && (error as any).message) {
      throw error;
    }

    // 예상치 못한 에러인 경우
    console.error("Get Group Info API Error:", error);
    throw {
      code: "UNKNOWN_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      path: url,
      timestamp: new Date().toISOString(),
      status: 0,
    } as ApiErrorWithStatus;
  }
}

// 그룹 목표 금액 설정 API 호출
export async function updateGoalAmount(
  groupId: string,
  goalAmount: number
): Promise<void> {
  const url = `${BASE_URL}${API_ENDPOINTS.GROUP.GOAL_AMOUNT.replace(
    "{groupId}",
    groupId
  )}`;

  const config: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(), // Authorization 헤더
    },
    body: JSON.stringify({ goalAmount: goalAmount }),
  };

  try {
    console.log("=== Update Goal Amount API Debug ===");
    console.log("Request URL:", url);
    console.log("Group ID:", groupId);
    console.log("Goal Amount:", goalAmount);
    console.log("Request config:", {
      method: config.method,
      headers: config.headers,
      body: config.body,
    });
    console.log("=====================================");

    const response = await fetch(url, config);

    console.log("Update goal amount response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // 403 에러 - 토큰 갱신 시도
    if (response.status === 403) {
      console.log("403 Forbidden - attempting token refresh...");
      const refreshed = await refreshTokenIfNeeded();

      if (refreshed) {
        console.log(
          "Token refreshed successfully, retrying update goal amount..."
        );
        // 토큰 갱신 성공 시 원래 요청 재시도
        return updateGoalAmount(groupId, goalAmount);
      } else {
        console.log("Token refresh failed - redirecting to login");
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw {
          code: "AUTH_REFRESH_FAILED",
          message: "인증이 만료되었습니다. 다시 로그인해주세요.",
          path: `/groups/${groupId}/goal-amount`,
          timestamp: new Date().toISOString(),
          status: 403,
        } as ApiErrorWithStatus;
      }
    }

    if (!response.ok) {
      // 먼저 응답을 텍스트로 읽기
      const errorText = await response.text();
      console.error("API 에러 응답 Status:", response.status);
      console.error("API 에러 응답 Text:", errorText);

      let errorData: ApiErrorWithStatus;
      try {
        // JSON 파싱 시도
        const parsed = JSON.parse(errorText);
        errorData = {
          code: parsed.code || `HTTP_${response.status}`,
          message: parsed.message || "목표 금액 설정에 실패했습니다.",
          path: parsed.path || `/groups/${groupId}/goal-amount`,
          timestamp: parsed.timestamp || new Date().toISOString(),
          status: response.status,
        };
      } catch {
        // JSON 파싱 실패 시 기본 에러 메시지
        errorData = {
          code: `HTTP_${response.status}`,
          message: "목표 금액 설정에 실패했습니다.",
          path: `/groups/${groupId}/goal-amount`,
          timestamp: new Date().toISOString(),
          status: response.status,
        };
      }

      throw errorData;
    }

    console.log("목표 금액 설정 성공");
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw {
        code: "NETWORK_ERROR",
        message: "서버에 연결할 수 없습니다.",
        path: `/groups/${groupId}/goal-amount`,
        timestamp: new Date().toISOString(),
        status: 0,
      } as ApiErrorWithStatus;
    }

    // 이미 구조화된 에러인 경우 그대로 throw
    if ((error as any).code && (error as any).message) {
      throw error;
    }

    // 예상치 못한 에러인 경우
    console.error("Update Goal Amount API Error:", error);
    throw {
      code: "UNKNOWN_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      path: `/groups/${groupId}/goal-amount`,
      timestamp: new Date().toISOString(),
      status: 0,
    } as ApiErrorWithStatus;
  }
}
