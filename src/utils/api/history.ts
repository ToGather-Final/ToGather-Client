import { getAccessToken } from "@/utils/token";
import { HistoryDTO } from "@/types/api/history";
import { apiCallWithTokenRefresh } from "./tokenRefresh";

export interface HistoryResponse {
  items: HistoryDTO[];
  nextCursor: string | null;
}

export const getHistory = async (): Promise<HistoryResponse> => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error("토큰이 없습니다.");
  }

  return apiCallWithTokenRefresh<HistoryResponse>("/history/all", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
};
