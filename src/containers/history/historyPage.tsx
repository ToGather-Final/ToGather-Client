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

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [selectedDate, setSelectedDate] = useState(new Date()) // 오늘 날짜
  const [historyData, setHistoryData] = useState<HistoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 터치 이벤트를 위한 ref와 상태
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
    if (e.touches && e.touches.length > 0) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  // 터치 종료 이벤트 핸들러
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      touchEndX.current = e.changedTouches[0].clientX;
      handleSwipe();
    }
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
