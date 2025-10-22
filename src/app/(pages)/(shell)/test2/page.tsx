// app/test-websocket/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Price } from "@/types/api/stock";
import { useStompWebSocket } from "@/hooks/useWebSocket";
import {
  buyStock,
  sellStock,
  getPortfolio,
  placeOrder,
} from "@/utils/api/trading";
import type { OrderRequest } from "@/types/api/stock";

export default function WebSocketTestPage() {
  const [stockCode, setStockCode] = useState("005930");
  const [testStockCode, setTestStockCode] = useState("005930");
  const [quantity, setQuantity] = useState("10");
  const [reason, setReason] = useState("테스트 주문");
  const [dueDate, setDueDate] = useState("");
  const [portfolio, setPortfolio] = useState<any>(null);

  // 새로운 주문 API 테스트용 상태
  const [accountId, setAccountId] = useState("test-account-123");
  const [orderPrice, setOrderPrice] = useState("97500");
  const [priceType, setPriceType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [orderResult, setOrderResult] = useState<any>(null);

  const { isConnected, orderbookData } = useStompWebSocket(testStockCode);

  // 클라이언트에서만 날짜 초기값 설정 (Hydration 에러 방지)
  useEffect(() => {
    if (typeof window !== "undefined" && !dueDate) {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      setDueDate(nextWeek.toISOString().split("T")[0]);
    }
  }, [dueDate]);

  // Hydration 완료 후에만 렌더링하도록 하는 상태
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTest = () => {
    setTestStockCode(stockCode);
  };

  const handleBuyTest = async () => {
    try {
      const result = await buyStock({
        stockCode: testStockCode,
        quantity: parseInt(quantity),
        price: orderbookData?.currentPrice || 82500,
        reason,
        dueDate,
      });
      console.log("매수 성공:", result);
      alert("매수 주문이 성공했습니다!");
    } catch (error) {
      console.error("매수 실패:", error);
      alert("매수 주문에 실패했습니다.");
    }
  };

  const handleSellTest = async () => {
    try {
      const result = await sellStock({
        stockCode: testStockCode,
        quantity: parseInt(quantity),
        price: orderbookData?.currentPrice || 82500,
        reason,
        dueDate,
      });
      console.log("매도 성공:", result);
      alert("매도 주문이 성공했습니다!");
    } catch (error) {
      console.error("매도 실패:", error);
      alert("매도 주문에 실패했습니다.");
    }
  };

  const handlePortfolioTest = async () => {
    try {
      const result = await getPortfolio();
      console.log("포트폴리오:", result);
      setPortfolio(result);
    } catch (error) {
      console.error("포트폴리오 조회 실패:", error);
      alert("포트폴리오 조회에 실패했습니다.");
    }
  };

  const testWebSocketConnection = () => {
    console.log("🔍 WebSocket 연결 테스트 시작...");

    // 직접 WebSocket 연결 테스트
    const testWs = new WebSocket("ws://localhost:8000/ws");

    testWs.onopen = () => {
      console.log("✅ 직접 WebSocket 연결 성공!");
      alert("WebSocket 서버가 정상적으로 실행 중입니다!");
      testWs.close();
    };

    testWs.onerror = (error) => {
      console.error("❌ 직접 WebSocket 연결 실패:", error);
      alert(
        "WebSocket 서버에 연결할 수 없습니다. 백엔드 서버 상태를 확인해주세요."
      );
    };

    testWs.onclose = (event) => {
      console.log("🔌 WebSocket 연결 종료:", event.code, event.reason);
    };
  };

  const handleNewOrderTest = async (orderType: "BUY" | "SELL") => {
    try {
      const orderData: OrderRequest = {
        accountId,
        stockCode: testStockCode,
        orderType,
        priceType,
        price: parseFloat(orderPrice),
        quantity: parseInt(quantity),
      };

      console.log("새로운 주문 API 테스트:", orderData);
      const result = await placeOrder(orderData);
      console.log("주문 결과:", result);
      setOrderResult(result);

      alert(
        `${orderType} 주문이 성공했습니다!\n주문ID: ${result.orderId}\n상태: ${result.status}`
      );
    } catch (error) {
      console.error("새로운 주문 실패:", error);
      alert("주문에 실패했습니다. 백엔드 서버 상태를 확인해주세요.");
    }
  };

  console.log(isConnected);
  console.log(orderbookData);
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🔌 매매 시스템 테스트
          </h1>

          {/* 연결 상태 */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-600">WebSocket 연결:</span>
            {isClient ? (
              <div
                className={`px-4 py-2 rounded-full font-semibold ${
                  isConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isConnected ? "✅ 연결됨" : "❌ 연결 실패"}
              </div>
            ) : (
              <div className="px-4 py-2 rounded-full font-semibold bg-gray-100 text-gray-500">
                로딩 중...
              </div>
            )}
            <div className="text-sm text-gray-500">
              URL: ws://localhost:8000/ws
            </div>
          </div>

          {/* 종목 코드 입력 */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-600">종목 코드:</span>
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="005930"
            />
            <button
              onClick={handleTest}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              연결 테스트
            </button>
          </div>

          {/* 매매 테스트 폼 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이유
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                마감일
              </label>
              {isClient ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                  로딩 중...
                </div>
              )}
            </div>
          </div>

          {/* 새로운 주문 API 테스트 폼 */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              🆕 새로운 주문 API 테스트
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  계좌 ID
                </label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="test-account-123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주문 가격
                </label>
                <input
                  type="number"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="97500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가격 유형
                </label>
                <select
                  value={priceType}
                  onChange={(e) =>
                    setPriceType(e.target.value as "LIMIT" | "MARKET")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="LIMIT">지정가</option>
                  <option value="MARKET">시장가</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNewOrderTest("BUY")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    지정가 매수
                  </button>
                  <button
                    onClick={() => handleNewOrderTest("SELL")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    지정가 매도
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 매매 테스트 버튼들 */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testWebSocketConnection}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              WebSocket 연결 테스트
            </button>
            <button
              onClick={handleBuyTest}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              매수 테스트
            </button>
            <button
              onClick={handleSellTest}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              매도 테스트
            </button>
            <button
              onClick={handlePortfolioTest}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              포트폴리오 조회
            </button>
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
                  <span className="font-mono">{orderbookData.stockCode}</span>
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
                    {Math.abs(orderbookData.changeAmount).toLocaleString()}원 (
                    {orderbookData.changeDirection === "up" ? "+" : ""}
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
                {orderbookData.askPrices.map((ask: Price, index: number) => (
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
                ))}
              </div>
            </div>

            {/* 매수 호가 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-blue-600 mb-4">
                📉 매수 호가
              </h2>
              <div className="space-y-2">
                {orderbookData.bidPrices.map((bid: Price, index: number) => (
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
                ))}
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

        {/* 포트폴리오 데이터 표시 */}
        {portfolio && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              📊 포트폴리오 데이터
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
              <pre className="text-xs text-gray-700">
                {JSON.stringify(portfolio, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* 주문 결과 표시 */}
        {orderResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              📋 주문 결과
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">주문 ID:</span>
                  <span className="ml-2 text-blue-600">
                    {orderResult.orderId}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">상태:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-sm ${
                      orderResult.status === "FILLED"
                        ? "bg-green-100 text-green-800"
                        : orderResult.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : orderResult.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {orderResult.status}
                  </span>
                </div>
                {orderResult.executedPrice && (
                  <div>
                    <span className="font-semibold">체결 가격:</span>
                    <span className="ml-2 text-green-600">
                      {orderResult.executedPrice.toLocaleString()}원
                    </span>
                  </div>
                )}
                {orderResult.executedQuantity && (
                  <div>
                    <span className="font-semibold">체결 수량:</span>
                    <span className="ml-2 text-green-600">
                      {orderResult.executedQuantity}주
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <span className="font-semibold">메시지:</span>
                <p className="mt-1 text-gray-700">{orderResult.message}</p>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  전체 응답 데이터 보기
                </summary>
                <pre className="mt-2 text-xs text-gray-700 bg-white p-2 rounded border overflow-auto max-h-32">
                  {JSON.stringify(orderResult, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
