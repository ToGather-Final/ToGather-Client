"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import ChargeModal from "@/components/pay/ChargeModal";
import { usePayTab } from "@/contexts/payTabContext";
import QRScannerContainer from "./QRScannerContainer";

const currency = new Intl.NumberFormat("ko-KR");

type Transaction = {
  id: string;
  title: string;
  date: string; // YYYY.MM.DD HH:mm
  amount: number; // + 충전, - 결제
};

const mockTransactions: Transaction[] = [
  {
    id: "t1",
    title: "춘천 닭갈비",
    date: "2025.09.23 14:50",
    amount: -30000,
  },
  {
    id: "t2",
    title: "천안 휴게소",
    date: "2025.09.23 14:50",
    amount: -13000,
  },
  {
    id: "t3",
    title: "페이머니 충전",
    date: "2025.09.23 14:50",
    amount: 50000,
  },
];

export default function PayContainer() {
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const { payTab, setPayTab } = usePayTab();
  const accountNo = "937702-00-058937";
  const payMoney = 210000;

  // 터치 이벤트를 위한 ref와 상태
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChargeConfirm = (data: {
    amount: string;
    dueDate: string;
    reason: string;
  }) => {
    console.log("charge proposal", data); // TODO: API 연동
    setIsChargeModalOpen(false);
  };

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
      if (swipeDistance > 0 && payTab === "QR") {
        // 오른쪽으로 스와이프 (바코드로 보기)
        setPayTab("BARCODE");
      } else if (swipeDistance < 0 && payTab === "BARCODE") {
        // 왼쪽으로 스와이프 (QR로 보기)
        setPayTab("QR");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-full touch-pan-y"
    >
      {/* 바코드 탭 화면 */}
      {payTab === "BARCODE" && (
        <div className="h-full ">
          <div className="px-6 py-6 ">
            {/* 바코드 + QR 영역 */}
            <div className="flex gap-6 items-center justify-center">
              {/* 바코드 더미 */}
              <div className="w-8/12 h-20 bg-[repeating-linear-gradient(90deg,black_0_2px,transparent_2px_6px)] rounded-sm" />
              {/* QR 더미 */}
              <div className="size-20 grid grid-cols-4 grid-rows-4 gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={i % 3 === 0 ? "bg-black" : "bg-stone-200"}
                  />
                ))}
              </div>
            </div>

            {/* 계좌/잔액 정보 */}
            <div>
              <div className="flex items-center justify-between text-sm mt-8">
                <span className="text-stone-700 font-medium text-lg">계좌</span>
                <span className=" tracking-wide text-stone-900 text-h2">
                  {accountNo}
                </span>
              </div>
              <div className="border-t border-[#e9e9e9] my-6"></div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-700 font-medium text-lg">
                  페이 머니
                </span>
                <span className=" text-stone-900 text-h2">
                  {currency.format(payMoney)}원
                </span>
              </div>
            </div>
          </div>

          {/* 최근 거래 내역 */}
          <section className="bg-[#E5F0FE] px-4 py-4 h-full">
            <h2 className="text-sm font-semibold text-stone-800 my-2">
              최근 거래 내역
            </h2>

            <div className="space-y-2">
              {mockTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="rounded-xl border border-stone-200 px-4 py-3 shadow-xs bg-white flex items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="text-sm text-stone-800">{tx.title}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {tx.date}
                    </div>
                  </div>
                  <div
                    className={
                      "text-sm font-semibold ml-2 " +
                      (tx.amount >= 0 ? "text-sky-600" : "text-stone-500")
                    }
                  >
                    {tx.amount >= 0 ? "+" : "-"}
                    {currency.format(Math.abs(tx.amount))}원
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 고정 떠있는 충전 버튼 - 바코드 탭에서만 표시 */}
      {payTab === "BARCODE" && (
        <Button
          onClick={() => setIsChargeModalOpen(true)}
          className="fixed left-1/2 -translate-x-1/2 bottom-[80px] h-12 rounded-xl bg-sky-500 hover:bg-sky-500/90 w-[calc(100vw-32px)] max-w-[calc(var(--app-max-w)-32px)]"
        >
          페이 머니 충전
        </Button>
      )}

      {/* 충전 모달 */}
      <ChargeModal
        isOpen={isChargeModalOpen}
        onClose={() => setIsChargeModalOpen(false)}
        onConfirm={handleChargeConfirm}
      />

      {/* QR 탭 화면 */}
      {payTab === "QR" && (
        <div className="bg-[#E5F0FE] h-full">
          <QRScannerContainer once />
        </div>
      )}
    </div>
  );
}
