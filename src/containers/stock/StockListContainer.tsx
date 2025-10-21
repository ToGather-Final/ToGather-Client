"use client";

import { useState, useEffect, useRef } from "react";
import StockDrawer from "./StockDrawer";
import MenuTab from "@/components/tab/MenuTab";
import { getMyStockList, getStockList } from "@/services/chart/stock";
import { Stock } from "@/types/api/stock";
import { Response } from "@/types/api/response";
import { baseUrl } from "@/constants/baseUrl";
import useSWR from "swr";
import Image from "next/image";

export default function StockListContainer() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<null | Stock>(null);
  const [stockTab, setStockTab] = useState("MY");

  // 터치 이벤트를 위한 ref와 상태
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading } = useSWR(
    `${baseUrl}/trading/stocks`,
    getStockList
  );

  const {
    data: myStockData,
    error: myStockError,
    isLoading: myStockLoading,
  } = useSWR(`${baseUrl}/trading/portfolio/stocks`, getMyStockList);

  console.log(data);

  if (error) return <div>Failed to load</div>;

  // API 응답이 Response<Stock[]> 형태이므로 data.data를 사용
  const allStocks = data?.data || [];

  // 탭에 따라 필터링된 주식 목록
  const getFilteredStocks = () => {
    switch (stockTab) {
      case "STOCK":
        return allStocks.filter((stock: Stock) => stock.prdtTypeCd === "300");
      case "ETF":
        return allStocks.filter((stock: Stock) => stock.prdtTypeCd === "500");
      case "MY":
      default:
        return myStockData?.data || []; // 실제 보유 종목 데이터 사용
    }
  };

  const stockList = getFilteredStocks();

  const uptabs = [
    { id: "MY", label: "보유종목" },
    { id: "STOCK", label: "주식" },
    { id: "ETF", label: "ETF" },
  ];

  // 터치 시작 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  // 터치 종료 이벤트 핸들러
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  // 스와이프 처리 함수
  const handleSwipe = () => {
    const swipeThreshold = 50; // 최소 스와이프 거리
    const swipeDistance = touchEndX.current - touchStartX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      const currentIndex = uptabs.findIndex((tab) => tab.id === stockTab);

      if (swipeDistance > 0 && currentIndex > 0) {
        // 오른쪽으로 스와이프 (이전 탭)
        setStockTab(uptabs[currentIndex - 1].id);
      } else if (swipeDistance < 0 && currentIndex < uptabs.length - 1) {
        // 왼쪽으로 스와이프 (다음 탭)
        setStockTab(uptabs[currentIndex + 1].id);
      }
    }
  };

  //주식 코드만 넘겨주는 것도 생각해보기
  return (
    <MenuTab tabs={uptabs} activeTab={stockTab} onTabChange={setStockTab}>
      {isLoading || (stockTab === "MY" && myStockLoading) ? (
        <div className="flex items-center justify-center h-64 text-center text-gray-500">
          주식 데이터를 불러오는 중...
        </div>
      ) : stockList.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-center">
          <p className="text-gray-500 text-[14px]">
            {stockTab === "MY" ? "보유종목이 없습니다." : "종목이 없습니다."}
          </p>
        </div>
      ) : (
        <div>
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="touch-pan-y"
          >
            <ul>
              {stockList.map((stock: Stock, idx: number) => (
                <li
                  key={`${stock.stockCode}-${idx}`}
                  className="flex justify-between p-5 border-b-[1px]"
                  role="button"
                  onClick={() => {
                    setOpen(true);
                    setSelected(stock);
                  }}
                >
                  <div className="flex items-center gap-[15px]">
                    <Image
                      src={stock.stockImage}
                      alt="stock"
                      width={35}
                      height={35}
                      className="h-[35px] w-[35px] rounded-full object-cover"
                    />
                    <div className="">
                      <div className="font-bold">{stock.stockName}</div>
                      <div className="flex gap-[7px] text-[#686868] text-[12px]">
                        {stockTab === "M" ? (
                          <div>{0}주</div>
                        ) : (
                          <div>{stock.country}</div>
                        )}
                        <div>{stock.stockCode}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-bold">
                      {stock.currentPrice.toLocaleString()}원
                    </div>
                    <div className="flex gap-[5px]">
                      <div
                        className={`text-[12px] font-bold ${
                          stock.changeAmount > 0
                            ? "text-red-500"
                            : stock.changeAmount < 0
                            ? "text-blue-500"
                            : "text-black"
                        }`}
                      >
                        {stock.changeAmount > 0
                          ? "▲"
                          : stock.changeAmount < 0
                          ? "▼"
                          : ""}
                        {Math.abs(stock.changeAmount).toLocaleString()}
                      </div>
                      <div
                        className={`text-[12px] font-bold ${
                          stock.changeAmount > 0
                            ? "text-red-500"
                            : stock.changeAmount < 0
                            ? "text-blue-500"
                            : "text-black"
                        }`}
                      >
                        ({stock.changeAmount > 0 ? "+" : ""}
                        {stock.changeRate}%)
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <StockDrawer
            open={open}
            onOpenChange={setOpen}
            stockCode={selected?.stockCode}
          ></StockDrawer>
        </div>
      )}
    </MenuTab>
  );
}
