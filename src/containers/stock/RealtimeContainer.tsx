"use client";

import SimpleTab from "@/components/tab/SimpleTab";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import YesNoModal from "@/components/common/YesNoModal";
import Modal from "@/components/common/Modal";
import { DialogTitle } from "@/components/ui/dialog";
import { useStompWebSocket } from "@/hooks/useWebSocket";
import { createTradeProposal } from "@/services/vote/payDeposit";
import { useGroupId } from "@/contexts/groupIdContext";
import useSWR from "swr";
import { baseUrl } from "@/constants/baseUrl";
import { getGroupInfo, getUserInvestmentAccount } from "@/services/group/group";
import { getPortfolioSummary } from "@/services/group/portfolio";
import { getStockDetail } from "@/services/chart/stock";

interface RealtimeContainerProps {
  stockId: string;
  stockCode: string;
  stockName: string;
}

export default function RealtimeContainer({
  stockId,
  stockCode,
  stockName,
}: RealtimeContainerProps) {
  const searchParams = useSearchParams();
  const { isConnected, orderbookData } = useStompWebSocket(stockCode);
  const { groupId } = useGroupId();
  const downtabs = [
    { id: "매수", label: "매수" },
    { id: "매도", label: "매도" },
  ];

  const [activeTab, setActiveTab] = useState("매수");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [orderAmount, setOrderAmount] = useState(""); // 수량 대신 주문 금액 입력
  const [dueDate, setDueDate] = useState("");
  const [reason, setReason] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isPriceAdjustModalOpen, setIsPriceAdjustModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<"매수" | "매도">("매수");
  const [adjustedPrice, setAdjustedPrice] = useState<number>(0);
  const [adjustedPerPersonPrice, setAdjustedPerPersonPrice] =
    useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAdjustedPrice, setUseAdjustedPrice] = useState(false); // 가격 조정 사용 여부
  const [calculatedQuantity, setCalculatedQuantity] = useState<number>(0); // 자동 계산된 수량
  const [feeExcludedAmount, setFeeExcludedAmount] = useState<number>(0); // 매도 시 수수료 제외 금액
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [groupMemberCount, setGroupMemberCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data: groupData,
    error: groupError,
    isLoading: groupIsLoading,
    mutate: mutateGroupData,
  } = useSWR(groupId ? `${baseUrl}/groups/${groupId}` : null, getGroupInfo);

  const {
    data: groupPortfolioData,
    error: groupProtfolioError,
    isLoading: groupPortfolioIsLoading,
  } = useSWR(
    groupId ? `${baseUrl}/trading/portfolio/summary?groupId=${groupId}` : null,
    getPortfolioSummary
  );

  const {
    data: stockDetailData,
    error: stockDetailError,
    isLoading: stockDetailIsLoading,
  } = useSWR(
    stockCode ? `${baseUrl}/trading/stocks/${stockCode}` : null,
    getStockDetail
  );

  useEffect(() => {
    if (groupData?.maxMembers) {
      setGroupMemberCount(groupData.maxMembers);
    }
  }, [groupData]);

  // WebSocket 데이터에서 현재가 추출 (메모이제이션으로 불필요한 재계산 방지)
  const currentPrice = useMemo(
    () => stockDetailData?.data?.currentPrice || 0,
    [stockDetailData?.data?.currentPrice]
  );

  const asks = useMemo(
    () => (orderbookData?.askPrices || []).slice().reverse(),
    [orderbookData?.askPrices]
  );

  const bids = useMemo(
    () => orderbookData?.bidPrices || [],
    [orderbookData?.bidPrices]
  );

  // 현재 종목의 보유 정보 찾기
  const holdingInfo = useMemo(() => {
    if (!groupPortfolioData?.data?.topHoldings || !stockId) {
      return null;
    }
    return groupPortfolioData.data.topHoldings.find(
      (holding) => holding.stockId === stockId
    );
  }, [groupPortfolioData?.data?.topHoldings, stockId]);

  // 수량 계산 로직
  useEffect(() => {
    if (activeTab === "매수") {
      // 매수: 주문 금액 입력 시 수량 자동 계산 (소수점 첫째자리까지)
      if (orderAmount && !isNaN(parseFloat(orderAmount))) {
        const amount = parseFloat(orderAmount);
        const price = selectedPrice || currentPrice;
        if (price > 0) {
          const quantity = amount / price;
          // 소수점 첫째자리까지 반올림
          setCalculatedQuantity(Math.round(quantity * 10) / 10);
        }
      } else {
        setCalculatedQuantity(0);
      }
    } else {
      // 매도: 입력한 수량 그대로 사용 (정수만)
      if (orderAmount && !isNaN(parseFloat(orderAmount))) {
        const quantity = parseFloat(orderAmount);
        setCalculatedQuantity(quantity);
      } else {
        setCalculatedQuantity(0);
      }
    }
  }, [orderAmount, selectedPrice, currentPrice, activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("togather_user_id");
      setUserId(id);
    }
  }, []);

  const {
    data: accountData,
    error: accountError,
    isLoading: accountIsLoading,
  } = useSWR(
    userId ? `${baseUrl}/trading/internal/accounts/user/${userId}` : null,
    getUserInvestmentAccount
  );

  // Time input을 분으로 계산하는 함수
  const calculateDurationMinutes = (timeString: string): number => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    const now = new Date();
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);

    // 선택한 시간이 현재 시간보다 이전이면 다음날로 설정
    if (selectedTime <= now) {
      selectedTime.setDate(selectedTime.getDate() + 1);
    }

    const diffMs = selectedTime.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60)); // 밀리초를 분으로 변환
  };

  const handleConfirmYes = async () => {
    if (!reason || !dueDate || !orderAmount) {
      setErrorMessage("모든 필드를 입력해주세요.");
      setIsErrorModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const durationMinutes = calculateDurationMinutes(dueDate);
      // 가격 조정 사용 시 조정된 총 금액으로 수량 재계산 (소수점 셋째자리)
      const finalQuantity = useAdjustedPrice
        ? Math.round((adjustedPrice / (selectedPrice || currentPrice)) * 1000) /
          1000
        : calculatedQuantity;

      // 소수점 최대 3자리, 불필요한 0 제거 (10.110 → 10.11)
      const formattedQuantity = parseFloat(finalQuantity.toFixed(3));
      const proposalName = `${stockName} ${formattedQuantity}주 ${orderType} 제안`;

      // 단가는 항상 선택한 가격 (또는 시장가)
      const finalPrice = selectedPrice || currentPrice;

      await createTradeProposal({
        proposalName,
        category: "TRADE",
        action: orderType === "매수" ? "BUY" : "SELL",
        payload: {
          reason: reason,
          stockId: stockId,
          stockName: stockName,
          price: finalPrice,
          quantity: finalQuantity,
        },
        durationMinutes: durationMinutes,
      });

      console.log(`${orderType} 제안 성공:`, {
        proposalName,
        price: finalPrice,
        quantity: finalQuantity,
        totalAmount: useAdjustedPrice ? adjustedPrice : parseFloat(orderAmount),
        dueDate,
        durationMinutes,
        reason,
      });

      setIsConfirmModalOpen(false);
      setIsCompleteModalOpen(true);
    } catch (error: any) {
      console.error("매매 제안 실패:", error);
      setErrorMessage(
        error?.message || "매매 제안에 실패했습니다. 다시 시도해주세요."
      );
      setIsErrorModalOpen(true);
      setIsConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteClose = () => {
    setIsCompleteModalOpen(false);
    // 폼 초기화
    setOrderAmount("");
    setCalculatedQuantity(0);
    setDueDate("");
    setReason("");
    setSelectedPrice(null);
    setUseAdjustedPrice(false);
    setAdjustedPrice(0);
    setAdjustedPerPersonPrice(0);
    setFeeExcludedAmount(0);
  };

  // 호가 항목 클릭 핸들러
  const handlePriceClick = (price: number) => {
    setSelectedPrice(price);
  };

  // 인당 체결금액 계산 및 모달 처리
  const handleOrderSubmit = () => {
    // 입력값 검증
    if (
      !orderAmount ||
      isNaN(parseFloat(orderAmount)) ||
      parseFloat(orderAmount) <= 0
    ) {
      setErrorMessage(
        activeTab === "매수"
          ? "주문 금액을 올바르게 입력해주세요."
          : "매도 수량을 올바르게 입력해주세요."
      );
      setIsErrorModalOpen(true);
      return;
    }

    if (calculatedQuantity <= 0) {
      setErrorMessage("수량이 0보다 커야 합니다.");
      setIsErrorModalOpen(true);
      return;
    }

    if (activeTab === "매수") {
      // === 매수 로직 ===
      const totalPrice = parseFloat(orderAmount);

      // 현금 잔액 확인
      const cashBalance = groupPortfolioData?.data?.totalCashBalance || 0;
      if (totalPrice > cashBalance) {
        setErrorMessage(
          `주문 금액이 현금 잔액을 초과합니다.\n현재 예수금: ${cashBalance.toLocaleString()}원`
        );
        setIsErrorModalOpen(true);
        return;
      }

      const perPersonPrice = totalPrice / groupMemberCount;

      // 정수인지 확인
      if (Number.isInteger(perPersonPrice)) {
        // case1: 정수이면 바로 확인 모달
        setOrderType("매수");
        setUseAdjustedPrice(false);
        setIsConfirmModalOpen(true);
      } else {
        // case2: 실수이면 반올림 후 조정 모달
        const roundedPerPersonPrice = Math.round(perPersonPrice);
        const adjustedTotalPrice = roundedPerPersonPrice * groupMemberCount;

        setAdjustedPrice(adjustedTotalPrice);
        setAdjustedPerPersonPrice(roundedPerPersonPrice);
        setIsPriceAdjustModalOpen(true);
      }
    } else {
      // === 매도 로직 ===
      const quantity = parseFloat(orderAmount);

      // 1. 보유 종목 확인
      if (!holdingInfo) {
        setErrorMessage("보유하지 않은 종목입니다.");
        setIsErrorModalOpen(true);
        return;
      }

      // 2. 수량 검증: 정수이거나 보유수량 전체여야 함
      const isInteger = Number.isInteger(quantity);
      const isFullHolding = quantity === holdingInfo.quantity;

      if (!isInteger && !isFullHolding) {
        setErrorMessage(
          "매도 수량은 정수만 입력 가능합니다.\n소수점 수량을 매도하려면 보유수량 전체를 선택해주세요."
        );
        setIsErrorModalOpen(true);
        return;
      }

      // 3. 보유 수량 확인
      if (quantity > holdingInfo.quantity) {
        setErrorMessage(
          `보유 수량을 초과했습니다.\n보유 수량: ${holdingInfo.quantity}주`
        );
        setIsErrorModalOpen(true);
        return;
      }

      // 4. (수량*단가)/인원 계산
      const price = selectedPrice || currentPrice;
      const totalAmount = quantity * price;
      const perPersonAmount = totalAmount / groupMemberCount;

      if (Number.isInteger(perPersonAmount)) {
        // case1: 정수이면 바로 확인 모달
        setOrderType("매도");
        setUseAdjustedPrice(false);
        setFeeExcludedAmount(0);
        setIsConfirmModalOpen(true);
      } else {
        // case2: 소수점이면 정수 부분과 소수점 부분 분리
        const integerPart = Math.floor(perPersonAmount);
        const decimalPart = perPersonAmount - integerPart;

        // 주문 금액 = 정수값 * 인원수
        const adjustedTotalAmount = integerPart * groupMemberCount;
        // 수수료 제외 금액 = 소수점 아래 값 * 인원수
        const feeExcluded = Math.round(decimalPart * groupMemberCount);

        setAdjustedPrice(adjustedTotalAmount);
        setAdjustedPerPersonPrice(integerPart);
        setFeeExcludedAmount(feeExcluded);
        setIsPriceAdjustModalOpen(true);
      }
    }
  };

  // 가격 조정 모달에서 확인 버튼 클릭
  const handlePriceAdjustConfirm = () => {
    if (activeTab === "매수") {
      // 조정된 금액도 현금 잔액 확인
      const cashBalance = groupPortfolioData?.data?.totalCashBalance || 0;
      if (adjustedPrice > cashBalance) {
        setErrorMessage(
          `조정된 금액이 현금 잔액을 초과합니다.\n현재 잔액: ${cashBalance.toLocaleString()}원\n조정된 금액: ${adjustedPrice.toLocaleString()}원`
        );
        setIsPriceAdjustModalOpen(false);
        setIsErrorModalOpen(true);
        return;
      }
    }

    setIsPriceAdjustModalOpen(false);
    setOrderType(activeTab as "매수" | "매도");
    setUseAdjustedPrice(true); // 조정된 가격 사용
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
    setOrderAmount("");
    setCalculatedQuantity(0);
    setDueDate("");
    setReason("");
    setSelectedPrice(null);
  }, [activeTab]);

  // 시장가를 정중앙에 위치시키는 스크롤
  useEffect(() => {
    if (scrollContainerRef.current && currentPrice && asks.length > 0) {
      const container = scrollContainerRef.current;
      const containerHeight = container.clientHeight;

      // 시장가가 정중앙에 오도록 스크롤 위치 계산
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
  }, [currentPrice, asks]);

  // 로딩 상태 표시
  if (!orderbookData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">
            {isConnected
              ? "호가 데이터를 불러오는 중..."
              : "WebSocket에 연결 중..."}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            종목: {stockCode} ({stockName})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* WebSocket 연결 상태 표시 */}
      {/* <div className="flex items-center justify-between px-5 py-1 bg-gray-50">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-gray-600">
            {isConnected ? "실시간 연결됨" : "연결 끊김"}
          </span>
        </div>
      </div> */}

      <div className="flex gap-[10px] items-center justify-start py-2 px-5">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-800 hover:text-black"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
        </button>
        <span className="text-[14px] font-bold">
          {orderbookData.stockName || stockName}
        </span>
      </div>

      <div className="px-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex justify-start items-center text-[10px] gap-[10px]">
              <div>{orderbookData.stockCode || stockCode}</div>
              <div>KOSPI</div>
              <div>KRX</div>
            </div>
            <div className="flex justify-between items-center">
              <div
                className={`flex items-center font-bold gap-[10px] text-[10px] ${
                  (stockDetailData?.data?.changeAmount || 0) > 0
                    ? "text-red-600"
                    : (stockDetailData?.data?.changeAmount || 0) < 0
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                <div className="text-[20px]">
                  {stockDetailData?.data?.currentPrice.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <div>
                    {(stockDetailData?.data?.changeAmount || 0) > 0
                      ? "▲"
                      : (stockDetailData?.data?.changeAmount || 0) < 0
                      ? "▼"
                      : ""}
                  </div>
                  <div>
                    {Math.abs(
                      stockDetailData?.data?.changeAmount || 0
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  {(stockDetailData?.data?.changeAmount || 0) > 0 ? "+" : ""}
                  {(stockDetailData?.data?.changeRate || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center border border-[#e9e9e9] border-[2px] rounded-[10px] py-[5px] px-[6px]">
            <div className="text-[#686868] text-[12px]">[종합매매 계좌]</div>
            <div className=" text-[12px]">{accountData?.accountNo}</div>
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
                {asks.length > 0 ? (
                  asks.map((ask, index) => (
                    <div
                      key={`ask-${ask.price}-${index}`}
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
                        {ask.quantity.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    매도호가 데이터 없음
                  </div>
                )}
              </div>
              {/* 매수호가 (파란색) */}
              <div className="space-y-1">
                {bids.length > 0 ? (
                  bids.map((bid, index) => (
                    <div
                      key={`bid-${bid.price}-${index}`}
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
                        {bid.quantity.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    매수호가 데이터 없음
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white py-4">
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[14px] font-medium text-gray-700">
                      {activeTab === "매수" ? "주문 금액" : "매도 수량"}
                    </label>
                    {activeTab === "매수" ? (
                      <span className="text-[12px] text-blue-600 font-medium">
                        주문가능:{" "}
                        {(
                          groupPortfolioData?.data?.totalCashBalance || 0
                        ).toLocaleString()}
                        원
                      </span>
                    ) : (
                      <span className="text-[12px] text-green-600 font-medium">
                        보유 수량: {holdingInfo ? holdingInfo.quantity : 0}주
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step={activeTab === "매수" ? "1" : "1"}
                    min="0"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    placeholder={
                      activeTab === "매수" ? "주문 금액" : "매도 수량"
                    }
                    className={`w-full px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${
                      activeTab === "매수"
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    } focus:border-transparent`}
                  />
                  {activeTab === "매도" && !holdingInfo && (
                    <p className="text-[12px] text-red-500 mt-1">
                      보유하지 않은 종목입니다.
                    </p>
                  )}
                </div>
                <div>
                  {/* 단가 표시 */}
                  <label className="block text-[14px] font-medium text-gray-700 mb-1">
                    단가
                  </label>
                  <input
                    type="number"
                    value={selectedPrice || currentPrice}
                    onChange={(e) =>
                      setSelectedPrice(parseInt(e.target.value) || null)
                    }
                    placeholder="단가를 입력하거나 호가창에서 선택하세요"
                    className={`w-full px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${
                      activeTab === "매수"
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    } focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-1">
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
                  <label className="block text-[14px] font-medium text-gray-700 mb-1">
                    제안 이유
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="이유를 입력해주세요."
                    rows={2}
                    className={`w-full px-2 py-1 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 ${
                      activeTab === "매수"
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    } focus:border-transparent resize-none`}
                  />
                </div>

                <div className="bg-gray-50 border border-[#e9e9e9] border-[2px] rounded-[10px] px-2 py-1">
                  <div className="text-[#686868] text-[12px]">
                    {activeTab === "매수" ? (
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <span>주문 금액:</span>
                          <span className="font-semibold text-[14px]">
                            {parseFloat(orderAmount || "0").toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>예상 수량:</span>
                          <span className="font-semibold text-[14px]">
                            {calculatedQuantity > 0
                              ? calculatedQuantity.toFixed(1)
                              : 0}
                            주
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <span>예상 금액:</span>
                          <span className="font-semibold text-[14px]">
                            {(
                              calculatedQuantity *
                              (selectedPrice || currentPrice)
                            ).toLocaleString()}
                            원
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>매도 수량:</span>
                          <span className="font-semibold text-[14px]">
                            {parseFloat(orderAmount || "0")}주
                          </span>
                        </div>
                      </>
                    )}
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
        onClose={() => !isSubmitting && setIsConfirmModalOpen(false)}
        onYes={handleConfirmYes}
        text1="취소"
        text2="확인"
      >
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            {isSubmitting ? "제안 중..." : `${orderType} 제안`}
          </DialogTitle>
          <div className="max-h-[50dvh] overflow-y-auto">
            {isSubmitting ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-lg text-gray-700">
                  제안을 처리하고 있습니다...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-lg text-gray-700">
                  {orderType} 주문을 제안하시겠습니까?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">종목:</span>
                    <span className="font-semibold">{stockName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수량:</span>
                    <span className="font-semibold">
                      {useAdjustedPrice
                        ? parseFloat(
                            (
                              Math.round(
                                (adjustedPrice /
                                  (selectedPrice || currentPrice)) *
                                  1000
                              ) / 1000
                            ).toFixed(3)
                          )
                        : parseFloat(calculatedQuantity.toFixed(3))}
                      주
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">단가:</span>
                    <span className="font-semibold">
                      {(selectedPrice || currentPrice).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">총 금액:</span>
                    <span className="font-semibold">
                      {orderType === "매수"
                        ? useAdjustedPrice
                          ? adjustedPrice.toLocaleString()
                          : parseFloat(orderAmount).toLocaleString()
                        : (
                            calculatedQuantity * (selectedPrice || currentPrice)
                          ).toLocaleString()}
                      원
                      {useAdjustedPrice && (
                        <span className="text-xs text-blue-600 ml-1">
                          (조정됨)
                        </span>
                      )}
                    </span>
                  </div>
                  {orderType === "매도" &&
                    useAdjustedPrice &&
                    feeExcludedAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">수수료 제외:</span>
                        <span className="font-semibold text-blue-600">
                          {feeExcludedAmount.toLocaleString()}원
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">마감 시간:</span>
                    <span className="font-semibold">{dueDate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </YesNoModal>

      {/* 가격 조정 모달 */}
      <YesNoModal
        isOpen={isPriceAdjustModalOpen}
        onClose={() => setIsPriceAdjustModalOpen(false)}
        onYes={handlePriceAdjustConfirm}
        text1="취소"
        text2="확인"
      >
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            가격 조정 안내
          </DialogTitle>
          <div className="mb-6 space-y-4">
            <p className="text-lg text-gray-700">
              인당 체결금액이 정수가 되도록{" "}
              {activeTab === "매수" ? "반올림" : "조정"}했습니다.
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
                {activeTab === "매수" ? "총 체결금액" : "주문 금액"}:{" "}
                {isNaN(adjustedPrice) ? "0" : adjustedPrice.toLocaleString()}원
              </div>
              {activeTab === "매도" && feeExcludedAmount > 0 && (
                <div className="text-lg font-semibold text-blue-600">
                  수수료 제외 금액: {feeExcludedAmount.toLocaleString()}원
                </div>
              )}
              <div className="text-sm text-gray-500 mt-2">
                (그룹원 {groupMemberCount}명 ×{" "}
                {isNaN(adjustedPerPersonPrice)
                  ? "0"
                  : adjustedPerPersonPrice.toLocaleString()}
                원
                {activeTab === "매도" && feeExcludedAmount > 0 && (
                  <span> + 수수료 제외 {feeExcludedAmount}원</span>
                )}
                )
              </div>
            </div>
            <p className="text-sm text-gray-600">
              이 금액으로 {orderType} 제안을 진행하시겠습니까?
            </p>
          </div>
        </div>
      </YesNoModal>

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

      {/* 에러 모달 */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
      >
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            알림
          </DialogTitle>
          <p className="text-gray-700 whitespace-pre-line">{errorMessage}</p>
        </div>
      </Modal>
    </div>
  );
}
