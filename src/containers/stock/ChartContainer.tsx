"use client";
import { ChartComponent } from "@/components/chart/Chart";
import { baseUrl } from "@/constants/baseUrl";
import { getStockChart } from "@/services/chart/stock";
import { StockDetail, StockChartData } from "@/types/api/stock";
import { ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";

//   {
//     time: "2023",
//     open: 65.0,
//     high: 80.0,
//     low: 60.0,
//     close: 75.0,
//     ma_5: 55,
//     ma_20: 36,
//     ma_60: 39,
//     ma_120: 45,
//     trading_volume: 3000000,
//   },

// const stockInfo = {
//   name: "NAVER",
//   code: "035420",
//   trading_volume: 2629345,
//   area: "KOSPI",
//   exchange: "KRX",
//   currentPrice: 829000,
//   increase: 3200,
//   percent: 3.72,
// };

export default function ChartContainer() {
  const params = useParams();
  const stockId = params.stockId as string;

  // stockId가 없으면 로딩 표시
  if (!stockId) {
    return (
      <div className="flex items-center justify-center h-64 text-center text-gray-500">
        Loading stockId...
      </div>
    );
  }
  const {
    data: dayData,
    error: dayError,
    isLoading: dayLoading,
  } = useSWR(
    `${baseUrl}/trading/stocks/${stockId}/chart?periodDiv=D`,
    getStockChart
  );

  const {
    data: weekData,
    error: weekError,
    isLoading: weekLoading,
  } = useSWR(
    `${baseUrl}/trading/stocks/${stockId}/chart?periodDiv=W`,
    getStockChart
  );
  const {
    data: monthData,
    error: monthError,
    isLoading: monthLoading,
  } = useSWR(
    `${baseUrl}/trading/stocks/${stockId}/chart?periodDiv=M`,
    getStockChart
  );
  const {
    data: yearData,
    error: yearError,
    isLoading: yearLoading,
  } = useSWR(
    `${baseUrl}/trading/stocks/${stockId}/chart?periodDiv=Y`,
    getStockChart
  );

  const router = useRouter();

  const stockInfo: StockDetail = dayData?.data || {
    stockId: "",
    stockCode: "",
    stockName: "",
    market: "",
    currentPrice: 0,
    changeAmount: 0,
    changeRate: 0,
    changeDirection: "up" as const,
    volume: 0,
    highPrice: 0,
    lowPrice: 0,
    openPrice: 0,
    prevClosePrice: 0,
    marketCap: null,
    chartData: [],
    resistanceLine: 0,
    supportLine: 0,
  };

  const handleOrderClick = () => {
    router.push(`/stock/${stockId}/realtime`);
  };

  if (dayLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (dayError || !dayData?.data) {
    return (
      <div className="flex items-center justify-center h-64 text-center text-red-500">
        Failed to load chart data
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between py-2  px-4">
        <div className="flex gap-[10px] items-center justify-start">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-800 hover:text-black"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
          </button>
          <span className="text-[14px] font-bold">{stockInfo.stockName}</span>
        </div>
        <button
          onClick={handleOrderClick}
          className="text-[12px] text-white bg-primary rounded-[8px] px-[10px] py-[4px]"
        >
          주문
        </button>
      </div>

      <div className="px-6 ">
        <div className="flex justify-start items-center text-[10px] gap-[10px] my-2">
          <div>{stockInfo.stockCode}</div>
          <div>{stockInfo.market}</div>
          <div>KRX</div>
        </div>
        <div className="flex justify-between items-center mt-2 mb-4">
          <div
            className={`flex items-center font-bold gap-[10px] text-[10px] ${
              stockInfo.changeAmount > 0
                ? "text-red-600"
                : stockInfo.changeAmount < 0
                ? "text-blue-600"
                : "text-black"
            }`}
          >
            <div className="text-[20px]">
              {stockInfo.currentPrice.toLocaleString()}
            </div>
            <div className="flex items-center">
              <div>
                {stockInfo.changeAmount > 0
                  ? "▲"
                  : stockInfo.changeAmount < 0
                  ? "▼"
                  : ""}
              </div>
              <div>{Math.abs(stockInfo.changeAmount).toLocaleString()}</div>
            </div>
            <div>
              {stockInfo.changeAmount > 0 ? "+" : ""}
              {stockInfo.changeRate}%
            </div>
          </div>
          <div className="flex gap-[10px] text-[10px]">
            <div>거래량</div>
            <div>{stockInfo.volume.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <ChartComponent
        dayData={(dayData?.data?.chartData as StockChartData[]) || []}
        weekData={(weekData?.data?.chartData as StockChartData[]) || []}
        monthData={(monthData?.data?.chartData as StockChartData[]) || []}
        yearData={(yearData?.data?.chartData as StockChartData[]) || []}
      />
    </div>
  );
}
