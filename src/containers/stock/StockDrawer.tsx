"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { SimpleChart } from "@/components/chart/SimpleChart";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/constants/baseUrl";
import useSWR from "swr";
import { getStockDetail } from "@/services/chart/stock";
import { Stock, SimpleChartData, StockDetail } from "@/types/api/stock";
import { Response } from "@/types/api/response";

interface props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockCode?: string;
}

export default function StockDrawer({ open, onOpenChange, stockCode }: props) {
  const router = useRouter();

  const goRealtime = (tab?: string) => {
    const url = tab
      ? `/stock/${stockCode}/realtime?tab=${tab}`
      : `/stock/${stockCode}/realtime`;
    router.push(url);
  };

  const { data, error, isLoading } = useSWR(
    stockCode ? `${baseUrl}/trading/stocks/${stockCode}` : null,
    getStockDetail
  );

  console.log(data);

  if (isLoading) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-w-[var(--app-max-w)]">
          <DrawerHeader>
            <DrawerTitle>로딩 중</DrawerTitle>
            <DrawerDescription>종목 정보를 불러오는 중입니다</DrawerDescription>
          </DrawerHeader>
          <div className="p-8 text-center">로딩 중...</div>
        </DrawerContent>
      </Drawer>
    );
  }

  if (error || !data || !data.data) {
    return (
      <div>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-w-[var(--app-max-w)]">
            <DrawerHeader>
              <DrawerTitle>종목 정보</DrawerTitle>
              <DrawerDescription>
                데이터를 불러올 수 없습니다.
              </DrawerDescription>
            </DrawerHeader>
            {/* <div className="p-8 text-center text-red-500">
              데이터를 불러올 수 없습니다.
            </div> */}
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  const stockInfo: StockDetail = data.data;

  // chartData는 이미 API에서 SimpleChartData 형식으로 옴
  const chartData: SimpleChartData[] = stockInfo.chartData as SimpleChartData[];

  return (
    <div>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-w-[var(--app-max-w)]">
          <DrawerHeader>
            <DrawerTitle className="text-[14px] font-bold px-4">
              {stockInfo?.stockName || "종목 정보"}
            </DrawerTitle>
            <DrawerDescription asChild></DrawerDescription>
          </DrawerHeader>
          <div className="px-8">
            <div className="flex justify-start items-center text-[10px] gap-[10px]">
              <div>{stockInfo.stockCode}</div>
              <div>{stockInfo.market}</div>
              <div>KRX</div>
            </div>
            <div className="flex justify-between items-center">
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
            <SimpleChart dayData={chartData} stockCode={stockCode} />
          </div>

          <div className="grid grid-cols-2 gap-[10px] px-[10px] mt-[10px]">
            <DrawerClose asChild>
              <button
                className="text-[12px] h-[50px] text-white bg-red-600 rounded-[8px] px-[8px] py-[4px]"
                onClick={() => goRealtime("buy")}
              >
                매수제안
              </button>
            </DrawerClose>

            <DrawerClose asChild>
              <button
                className="text-[12px] h-[50px] text-white bg-blue-600 rounded-[8px] px-[8px] py-[4px]"
                onClick={() => goRealtime("sell")}
              >
                매도제안
              </button>
            </DrawerClose>
          </div>
          <div className="p-2"></div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
