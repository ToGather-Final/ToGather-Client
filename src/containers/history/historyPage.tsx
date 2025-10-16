"use client";

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  type HistoryDTO,
  HistoryType,
  HistoryCategory,
  type VoteApprovedPayloadDTO,
  type TradeExecutedPayloadDTO,
  type CashDepositCompletedPayloadDTO,
  type VoteCreatedPayloadDTO,
  GoalAchievedPayloadDTO,
} from "@/types/api/history"
import HistoryCard from "@/components/history/HistoryCard"
import HistoryCalendar from "@/components/history/HistoryCalendar"
import { getHistory } from "@/utils/api/history"

// Mock data for demonstration
const mockHistoryData: HistoryDTO[] = [
  {
    id: "1",
    category: HistoryCategory.TRADE,
    type: HistoryType.TRADE_EXECUTED,
    title: "테슬라 1주 58000원 매도 완료",
    date: "2025-09-16",
    payload: {
      side: "SELL",
      stockName: "테슬라",
      shares: 1,
      unitPrice: 5800000,
      accountBalance: 7800000,
    } as TradeExecutedPayloadDTO,
  },
  {
    id: "2",
    category: HistoryCategory.VOTE,
    type: HistoryType.VOTE_APPROVED,
    title: "투표 가결",
    date: "2025-09-14",
    payload: {
      proposalId: "1",
      scheduledAt: "2025년 9월 15일 오전 9시",
      side: "SELL",
      stockName: "테슬라",
      shares: 1,
      unitPrice: 5800000,
    } as VoteApprovedPayloadDTO,
  },
  {
    id: "3",
    category: HistoryCategory.CASH,
    type: HistoryType.CASH_DEPOSIT_COMPLETED,
    title: "예수금 충전 완료",
    date: "2025-09-14",
    payload: {
      depositorName: "박순영",
      amount: 500000,
      accountBalance: 6000000,
    } as CashDepositCompletedPayloadDTO,
  },
  {
    id: "4",
    category: HistoryCategory.VOTE,
    type: HistoryType.VOTE_CREATED,
    title: "테슬라 1주 58000원 매도 제안",
    date: "2025-09-14",
    payload: {
      proposalId: "1",
      proposalName: "테슬라 1주 58000원 매도 제안",
      proposerName: "정다영",
    } as VoteCreatedPayloadDTO,
  },
  {
    id: "5",
    category: HistoryCategory.CASH,
    type: HistoryType.CASH_DEPOSIT_COMPLETED,
    title: "예수금 충전 완료",
    date: "2025-09-14",
    payload: {
      depositorName: "박순영",
      amount: 500000,
      accountBalance: 6000000,
    } as CashDepositCompletedPayloadDTO,
  },
  {
    id: "6",
    category: HistoryCategory.VOTE,
    type: HistoryType.VOTE_REJECTED,
    title: "투표 부결",
    date: "2025-09-13",
    payload: {
      proposalId: "2",
      proposalName: "아마존 2주 매수 제안",
      proposerName: "김지수",
    } as VoteCreatedPayloadDTO,
  },
  {
    id: "7",
    category: HistoryCategory.TRADE,
    type: HistoryType.TRADE_FAILED,
    title: "삼성전자 5주 매도 실패",
    date: "2025-09-12",
    payload: {
      side: "SELL",
      stockName: "삼성전자",
      shares: 5,
      unitPrice: 4500000,
      accountBalance: 7800000,
    } as TradeExecutedPayloadDTO,
  },
  {
    id: "8",
    category: HistoryCategory.PAY,
    type: HistoryType.PAY_CHARGE_COMPLETED,
    title: "페이 충전 완료",
    date: "2025-09-11",
    payload: {
      depositorName: "황인찬",
      amount: 200000,
      accountBalance: 8000000,
    } as CashDepositCompletedPayloadDTO,
  },
  {
    id: "9",
    category: HistoryCategory.GOAL,
    type: HistoryType.GOAL_ACHIEVED,
    title: "목표 달성",
    date: "2025-09-10",
    payload: {
      targetAmount: 1000000,
    } as GoalAchievedPayloadDTO,
  },
  {
    id: "10",
    category: HistoryCategory.TRADE,
    type: HistoryType.TRADE_EXECUTED,
    title: "엔비디아 2주 49200원 매수 완료",
    date: "2025-09-09",
    payload: {
      side: "BUY",
      stockName: "엔비디아",
      shares: 2,
      unitPrice: 98400,
      accountBalance: 7702160,
    } as TradeExecutedPayloadDTO,
  },
];

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [selectedDate, setSelectedDate] = useState(new Date()) // 오늘 날짜
  const [historyData, setHistoryData] = useState<HistoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 터치 이벤트를 위한 ref
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await getHistory()
        setHistoryData(response.items)
      } catch (err) {
        console.error("히스토리 조회 실패:", err)
        setError("히스토리를 불러오는데 실패했습니다.")
        // 에러 발생 시 더미 데이터 사용
        setHistoryData(mockHistoryData)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const filteredHistoryForDate = historyData.filter((item) => {
    const itemDate = new Date(item.date.replace(/\./g, "/"))
    return (
      itemDate.getDate() === selectedDate.getDate() &&
      itemDate.getMonth() === selectedDate.getMonth() &&
      itemDate.getFullYear() === selectedDate.getFullYear()
    );
  });

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
      if (swipeDistance > 0 && viewMode === "calendar") {
        // 오른쪽으로 스와이프 (리스트로 보기)
        setViewMode("list");
      } else if (swipeDistance < 0 && viewMode === "list") {
        // 왼쪽으로 스와이프 (캘린더로 보기)
        setViewMode("calendar");
      }
    }
  };

  return (
    <div className="bg-white p-4">
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="touch-pan-y max-w-md mx-auto"
      >
        {/* Tab buttons */}
        <div className="flex w-full gap-2 justify-center mb-6">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex-1 px-6 py-3 rounded-xl text-sm font-medium text-center transition-colors",
              viewMode === "list"
                ? "bg-[#447AFA] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            리스트로 보기
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex-1 px-6 py-3 rounded-xl text-sm font-medium text-center transition-colors",
              viewMode === "calendar"
                ? "bg-[#447AFA] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            캘린더로 보기
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">히스토리를 불러오는 중...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">{error}</div>
            <div className="text-gray-500">더미 데이터를 표시합니다.</div>
          </div>
        ) : viewMode === "list" ? (
          /* List view */
          <div className="space-y-3">
            {historyData.length > 0 ? (
              historyData.map((item) => (
                <HistoryCard key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">표시할 히스토리가 없습니다.</div>
              </div>
            )}
          </div>
        ) : (
          /* Calendar view */
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 px-4 pt-4 pb-2">
              <HistoryCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} historyData={historyData} />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-3"></div>

            {/* Selected date history */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월{" "}
                {selectedDate.getDate()}일
              </h3>
              <div className="space-y-3">
                {filteredHistoryForDate.length > 0 ? (
                  filteredHistoryForDate.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {historyData.length > 0 ? "해당 날짜에 기록이 없습니다." : "표시할 히스토리가 없습니다."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
