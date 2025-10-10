"use client";

import SimpleTab from "@/components/tab/SimpleTab";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function RealtimeContainer() {
  const searchParams = useSearchParams();

  const downtabs = [
    { id: "매수", label: "매수" },
    { id: "매도", label: "매도" },
  ];

  // 호가 데이터 (매도호가 - 높은 가격부터)
  const asks = [
    { price: 82950, size: 150 },
    { price: 82900, size: 200 },
    { price: 82850, size: 300 },
    { price: 82800, size: 180 },
    { price: 82750, size: 250 },
    { price: 82700, size: 120 },
    { price: 82650, size: 400 },
    { price: 82600, size: 350 },
    { price: 82550, size: 280 },
    { price: 82500, size: 500 },
  ];

  // 매수호가 데이터 (낮은 가격부터)
  const bids = [
    { price: 82450, size: 200 },
    { price: 82400, size: 150 },
    { price: 82350, size: 300 },
    { price: 82300, size: 180 },
    { price: 82250, size: 250 },
    { price: 82200, size: 120 },
    { price: 82150, size: 400 },
    { price: 82100, size: 350 },
    { price: 82050, size: 280 },
    { price: 82000, size: 500 },
  ];

  const [activeTab, setActiveTab] = useState("매수");
  const [currentPrice, setCurrentPrice] = useState(82500);
  const [quantity, setQuantity] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reason, setReason] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 주문 폼 공통 컴포넌트
  const OrderForm = ({ type }: { type: "매수" | "매도" }) => {
    const isBuy = type === "매수";
    const buttonColor = isBuy
      ? "bg-red-500 hover:bg-red-600"
      : "bg-blue-500 hover:bg-blue-600";
    const ringColor = isBuy ? "focus:ring-red-500" : "focus:ring-blue-500";
    const maxQuantity = isBuy ? "최대 100주" : "최대 50주";

    const handleSubmit = () => {
      console.log(`${type} 주문:`, {
        price: currentPrice,
        quantity: parseInt(quantity),
        dueDate,
        reason,
      });
      alert(`${type} 주문이 제안되었습니다!`);
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[14px] font-medium text-gray-700 mb-2">
            {type} 수량 ({maxQuantity})
            {/* 보유 금액/수량을 토대로 최대 개수 계산해서 표시 */}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="수량"
            className={`w-full px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            마감 일자
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`w-full px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {type} 제안 이유
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="이유를 입력해주세요."
            rows={3}
            className={`w-full px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent resize-none`}
          />
        </div>

        <div className="flex justify-start bg-gray-50 items-center border border-[#e9e9e9] border-[2px] rounded-[10px] px-2 py-1">
          <div className="text-[#686868] text-[12px]">
            예상 주문 금액 (시장가) <br />
            <span className="font-semibold text-[14px]">
              {quantity
                ? (currentPrice * parseInt(quantity)).toLocaleString()
                : 0}
              원
            </span>
          </div>
        </div>

        <button
          className={`px-6 py-3 text-[14px] font-medium rounded-[10px] ease-in-out ${buttonColor} text-white shadow-md w-full transition-colors`}
          onClick={handleSubmit}
        >
          {type} 제안
        </button>
      </div>
    );
  };

  // URL 쿼리 파라미터에서 탭 정보 읽기
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "buy") {
      setActiveTab("매수");
    } else if (tab === "sell") {
      setActiveTab("매도");
    }
  }, [searchParams]);

  // 시장가를 정중앙에 위치시키는 스크롤
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;

      // 시장가(82500)가 정중앙에 오도록 스크롤 위치 계산
      // asks 배열에서 82500의 인덱스를 찾기
      const currentPriceIndex = asks.findIndex(
        (ask) => ask.price === currentPrice
      );
      if (currentPriceIndex !== -1) {
        const itemHeight = 40; // 각 호가 항목의 대략적인 높이
        const targetScrollTop =
          currentPriceIndex * itemHeight - containerHeight / 2 + itemHeight / 2;
        container.scrollTop = Math.max(0, targetScrollTop);
      }
    }
  }, [currentPrice]);
  return (
    <div>
      <div className="flex gap-[10px] items-center justify-start py-2 px-5">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-800 hover:text-black"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
        </button>
        <span className="text-[14px] font-bold">NAVER</span>
      </div>

      <div className="px-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex justify-start items-center text-[10px] gap-[10px]">
              <div>035420</div>
              <div>KOSPI</div>
              <div>KRX</div>
            </div>
            <div className="flex justify-between items-center">
              <div
                className={`flex items-center font-bold gap-[10px] text-[10px] ${
                  currentPrice >= 82500 ? "text-red-600" : "text-blue-600"
                }`}
              >
                <div className="text-[20px]">
                  {currentPrice.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <div>▲</div>
                  <div>3,200</div>
                </div>
                <div>+3.72%</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center border border-[#e9e9e9] border-[2px] rounded-[10px] py-[5px] px-[10px]">
            <div className="text-[#686868] text-[12px]">[종합매매]가나다</div>
            <div className=" text-[12px]">001-12-566789</div>
          </div>
        </div>
        <SimpleTab
          tabs={downtabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        ></SimpleTab>
        <div className="grid grid-cols-2 gap-4">
          {/* 호가창 */}
          <div className="">
            <div className="grid grid-cols-2 text-center py-1">
              <div className="text-[#686868] text-[12px]">호가</div>
              <div className="text-[#686868] text-[12px]">잔량</div>
            </div>
            <div
              ref={scrollContainerRef}
              className="flex flex-col max-h-[59vh] overflow-y-auto"
            >
              {/* 매도호가 (빨간색) */}
              <div className="space-y-1">
                {asks.map((ask) => (
                  <div
                    key={`ask-${ask.price}`}
                    className={`w-full px-4 py-2 text-sm flex items-center justify-between ${
                      ask.price === currentPrice
                        ? "border-2 border-[#686868] font-bold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-red-600 font-medium">
                      {ask.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      {ask.size.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              {/* 매수호가 (파란색) */}
              <div className="space-y-1">
                {bids.map((bid) => (
                  <div
                    key={`bid-${bid.price}`}
                    className={`w-full px-4 py-2 text-sm flex items-center justify-between ${
                      bid.price === currentPrice
                        ? "bg-yellow-100 border-2 border-yellow-400 font-bold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-blue-600 font-medium">
                      {bid.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      {bid.size.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white py-4">
              <OrderForm type={activeTab as "매수" | "매도"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
