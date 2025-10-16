"use client";

import { useState, useEffect, useRef } from "react";
import StockDrawer from "./StockDrawer";
import MenuTab from "@/components/tab/MenuTab";
import { getStockList } from "@/services/chart/stock";
import { Stock } from "@/types/api/stock";
import { Response } from "@/types/api/response";
import { baseUrl } from "@/constants/baseUrl";
import useSWR from "swr";

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

  console.log(data);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load</div>;

  // API 응답이 Response<Stock[]> 형태이므로 data.data를 사용
  const stockList = data?.data || [];

  const uptabs = [
    { id: "MY", label: "보유주식" },
    { id: "DOMESTIC", label: "국내주식" },
    { id: "OVERSEAS", label: "해외주식" },
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
                <img
                  src={stock.stockImage}
                  alt="stock"
                  className="h-[35px] w-[35px] rounded-full object-cover"
                />
                <div className="">
                  <div className="font-bold">{stock.stockName}</div>
                  <div className="flex gap-[7px] text-[#686868] text-[12px]">
                    {stockTab === "MY" ? (
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
                  <div className="text-[12px]">
                    {Math.abs(stock.changeAmount).toLocaleString()}
                  </div>
                  <div className="text-[12px]">({stock.changeRate}%)</div>
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
    </MenuTab>
  );
}
