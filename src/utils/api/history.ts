import { HistoryDTO } from "@/types/api/history";
import { apiGet } from "./client";

export interface HistoryResponse {
  items: HistoryDTO[];
  nextCursor: string | null;
}

export const getHistory = async (): Promise<HistoryResponse> => {
  return apiGet<HistoryResponse>("/history/all");
};
