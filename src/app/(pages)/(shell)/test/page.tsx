// app/test-websocket/page.tsx
"use client";

import { useState } from "react";
import { Price } from "@/types/api/stock";
import { useStompWebSocket } from "@/hooks/useWebSocket";

export default function WebSocketTestPage() {
  const [stockCode, setStockCode] = useState("005930");
  const [testStockCode, setTestStockCode] = useState("005930");

  const { isConnected, orderbookData } = useStompWebSocket(testStockCode);

  const handleTest = () => {
    setTestStockCode(stockCode);
  };
  console.log(isConnected);
  console.log(orderbookData);
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🔌 WebSocket 연결 테스트
          </h1>

          {/* 연결 상태 */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-600">연결 상태:</span>
            <div
              className={`px-4 py-2 rounded-full font-semibold ${
                isConnected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isConnected ? "✅ 연결됨" : "⏳ 연결 중..."}
            </div>
          </div>
        </div>
        {/* 데이터 표시 */}
        {orderbookData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 종목 정보 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                📊 종목 정보
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">종목명:</span>
                  <span className="font-semibold">
                    {orderbookData.stockName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">종목코드:</span>
                  <span className="font-mono">
                    {orderbookData.stockCode}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">현재가:</span>
                  <span
                    className={`font-bold text-lg ${
                      orderbookData.changeDirection === "up"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {orderbookData.currentPrice.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">변동:</span>
                  <div
                    className={`font-semibold ${
                      orderbookData.changeDirection === "up"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {orderbookData.changeDirection === "up" ? "▲" : "▼"}
                    {Math.abs(orderbookData.changeAmount).toLocaleString()}
                    원 ({orderbookData.changeDirection === "up" ? "+" : ""}
                    {orderbookData.changeRate}%)
                  </div>
                </div>
              </div>
            </div>

            {/* 원본 데이터 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                📦 원본 응답
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                <pre className="text-xs text-gray-700">
                  {JSON.stringify(orderbookData, null, 2)}
                </pre>
              </div>
            </div>

            {/* 매도 호가 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-red-600 mb-4">
                📈 매도 호가
              </h2>
              <div className="space-y-2">
                {orderbookData.askPrices.map(
                  (ask: Price, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <span className="font-semibold text-red-600">
                        {ask.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        {ask.quantity.toLocaleString()}주
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 매수 호가 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-blue-600 mb-4">
                📉 매수 호가
              </h2>
              <div className="space-y-2">
                {orderbookData.bidPrices.map(
                  (bid: Price, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="font-semibold text-blue-600">
                        {bid.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        {bid.quantity.toLocaleString()}주
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-600 text-lg">데이터를 기다리는 중...</p>
            <p className="text-gray-400 text-sm mt-2">
              WebSocket이 연결되면 실시간 호가 데이터가 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
