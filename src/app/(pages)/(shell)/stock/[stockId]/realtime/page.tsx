"use client";

import RealtimeContainer from "@/containers/stock/RealtimeContainer";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { baseUrl } from "@/constants/baseUrl";
import { getStockDetail } from "@/services/chart/stock";

export default function RealtimePage() {
  const params = useParams();
  const stockId = params.stockId as string;

  // 종목 상세 정보를 가져와서 stockCode 추출
  const { data, error, isLoading } = useSWR(
    stockId ? `${baseUrl}/trading/stocks/${stockId}` : null,
    getStockDetail
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">종목 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600 text-lg">
            종목 정보를 불러올 수 없습니다.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <RealtimeContainer
      stockId={data.data.stockId}
      stockCode={data.data.stockCode}
      stockName={data.data.stockName}
    />
  );
}
