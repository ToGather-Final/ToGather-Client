"use client";

import SimpleTab from "@/components/tab/SimpleTab";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import YesNoModal from "@/components/common/YesNoModal";
import Modal from "@/components/common/Modal";
import { DialogTitle } from "@/components/ui/dialog";

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
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reason, setReason] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isPriceAdjustModalOpen, setIsPriceAdjustModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<"매수" | "매도">("매수");
  const [adjustedPrice, setAdjustedPrice] = useState<number>(0);
  const [adjustedPerPersonPrice, setAdjustedPerPersonPrice] =
    useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const GROUP_MEMBER_COUNT = 3; // 그룹원 수 하드코딩

  const handleConfirmYes = () => {
    console.log(`${orderType} 주문:`, {
      price: selectedPrice || currentPrice,
      quantity: parseInt(quantity),
      dueDate,
      reason,
    });
    setIsConfirmModalOpen(false);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteClose = () => {
    setIsCompleteModalOpen(false);
    // 폼 초기화
    setQuantity("");
    setDueDate("");
    setReason("");
    setSelectedPrice(null);
  };

  // 호가 항목 클릭 핸들러
  const handlePriceClick = (price: number) => {
    setSelectedPrice(price);
  };

  // 인당 체결금액 계산 및 모달 처리
  const handleOrderSubmit = () => {
    // 입력값 검증
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      alert("수량을 올바르게 입력해주세요.");
      return;
    }

    const quantityNum = parseInt(quantity);
    const totalPrice = (selectedPrice || currentPrice) * quantityNum;
    const perPersonPrice = totalPrice / GROUP_MEMBER_COUNT;

    // 정수인지 확인
    if (Number.isInteger(perPersonPrice)) {
      // case1: 정수이면 바로 확인 모달
      setOrderType(activeTab as "매수" | "매도");
      setIsConfirmModalOpen(true);
    } else {
      // case2: 실수이면 반올림 후 조정 모달
      const roundedPerPersonPrice = Math.round(perPersonPrice);
      const adjustedTotalPrice = roundedPerPersonPrice * GROUP_MEMBER_COUNT;

      setAdjustedPrice(adjustedTotalPrice);
      setAdjustedPerPersonPrice(roundedPerPersonPrice);
      setIsPriceAdjustModalOpen(true);
    }
  };

  // 가격 조정 모달에서 확인 버튼 클릭
  const handlePriceAdjustConfirm = () => {
    setIsPriceAdjustModalOpen(false);
    setOrderType(activeTab as "매수" | "매도");
    setIsConfirmModalOpen(true);
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

  // 탭 변경 시 폼 데이터 초기화
  useEffect(() => {
    setQuantity("");
    setDueDate("");
    setReason("");
    setSelectedPrice(null);
  }, [activeTab]);

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
                    onClick={() => handlePriceClick(ask.price)}
                    className={`w-full px-4 py-2 text-sm flex items-center justify-between cursor-pointer ${
                      ask.price === currentPrice
                        ? "border-2 border-[#686868] font-bold"
                        : "hover:bg-[#e9e9e9]"
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
                    onClick={() => handlePriceClick(bid.price)}
                    className={`w-full px-4 py-2 text-sm flex items-center justify-between cursor-pointer ${
                      bid.price === currentPrice
                        ? "border-2 border-[#686868] font-bold"
                        : "hover:bg-[#e9e9e9]"
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
              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    수량 ({activeTab === "매수" ? "최대 100주" : "최대 50주"})
                    {/* 보유 금액/수량을 토대로 최대 개수 계산해서 표시 */}
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="수량"
                    className={`w-full px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${
                      activeTab === "매수"
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    } focus:border-transparent`}
                  />
                </div>
                <div>
                  {/* 단가 표시 */}
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    단가
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={selectedPrice || currentPrice}
                      onChange={(e) =>
                        setSelectedPrice(parseInt(e.target.value) || null)
                      }
                      placeholder="단가를 입력하거나 호가창에서 선택하세요"
                      className={`flex-1 px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${
                        activeTab === "매수"
                          ? "focus:ring-red-500"
                          : "focus:ring-blue-500"
                      } focus:border-transparent`}
                    />
                    <div className="text-[12px] text-gray-500 whitespace-nowrap">
                      {selectedPrice ? "지정가" : "시장가"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    마감 시간
                  </label>
                  <input
                    type="time"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${
                      activeTab === "매수"
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    } focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {activeTab} 제안 이유
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="이유를 입력해주세요."
                    rows={3}
                    className={`w-full px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${
                      activeTab === "매수"
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    } focus:border-transparent resize-none`}
                  />
                </div>

                <div className="flex justify-start bg-gray-50 items-center border border-[#e9e9e9] border-[2px] rounded-[10px] px-2 py-1">
                  <div className="text-[#686868] text-[12px]">
                    예상 주문 금액 ({selectedPrice ? "지정가" : "시장가"}){" "}
                    <br />
                    <span className="font-semibold text-[14px]">
                      {quantity
                        ? (
                            (selectedPrice || currentPrice) * parseInt(quantity)
                          ).toLocaleString()
                        : 0}
                      원
                    </span>
                  </div>
                </div>

                <button
                  className={`px-6 py-3 text-[14px] font-medium rounded-[10px] ease-in-out ${
                    activeTab === "매수"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white shadow-md w-full transition-colors`}
                  onClick={handleOrderSubmit}
                >
                  {activeTab} 제안
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      <YesNoModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onYes={handleConfirmYes}
      >
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            {orderType} 제안
          </DialogTitle>
          <div className="max-h-[50dvh] overflow-y-auto">
            <p className="text-lg text-gray-700">
              {orderType} 주문을 제안하시겠습니까?
            </p>
          </div>
        </div>
      </YesNoModal>

      {/* 가격 조정 모달 */}
      <Modal
        isOpen={isPriceAdjustModalOpen}
        onClose={() => setIsPriceAdjustModalOpen(false)}
      >
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            가격 조정 안내
          </DialogTitle>
          <div className="mb-6 space-y-4">
            <p className="text-lg text-gray-700">
              인당 체결금액이 정수가 되도록 반올림했습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">조정된 정보</div>
              <div className="text-lg font-semibold">
                인당 체결금액:{" "}
                {isNaN(adjustedPerPersonPrice)
                  ? "0"
                  : adjustedPerPersonPrice.toLocaleString()}
                원
              </div>
              <div className="text-lg font-semibold">
                총 체결금액:{" "}
                {isNaN(adjustedPrice) ? "0" : adjustedPrice.toLocaleString()}원
              </div>
              <div className="text-sm text-gray-500 mt-2">
                (그룹원 {GROUP_MEMBER_COUNT}명 ×{" "}
                {isNaN(adjustedPerPersonPrice)
                  ? "0"
                  : adjustedPerPersonPrice.toLocaleString()}
                원)
              </div>
            </div>
            <p className="text-sm text-gray-600">
              이 금액으로 {orderType} 제안을 진행하시겠습니까?
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsPriceAdjustModalOpen(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handlePriceAdjustConfirm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </Modal>

      {/* 완료 모달 */}
      <Modal isOpen={isCompleteModalOpen} onClose={handleCompleteClose}>
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            {orderType} 제안 완료
          </DialogTitle>
          <div className="mb-6">
            <p className="text-lg text-gray-700">
              {orderType} 주문이 제안되었습니다!
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
