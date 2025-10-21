"use client";
// hooks/useStompWebSocket.ts - 순수 WebSocket 사용 (SockJS 제거)
import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { OrderBook } from "@/types/api/stock";

// 개발 환경에서만 로그 출력
const isDev = process.env.NODE_ENV === "development";
const logInfo = (...args: any[]) => isDev && console.log(...args);
const logError = (...args: any[]) => console.error(...args);

export const useStompWebSocket = (stockCode: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [orderbookData, setOrderbookData] = useState<OrderBook | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    logInfo("🚀 WebSocket 연결:", stockCode);

    // 순수 WebSocket을 사용한 STOMP 클라이언트 생성 (SockJS 없음)
    const client = new Client({
      brokerURL: "ws://localhost:8000/ws",

      // STOMP 프로토콜 버전 설정
      connectHeaders: {
        "accept-version": "1.2,1.1,1.0",
        "heart-beat": "10000,10000",
      },

      // 연결 성공
      onConnect: () => {
        logInfo("✅ WebSocket 연결 성공!");
        setIsConnected(true);

        // 호가 데이터 수신 구독
        client.subscribe(
          `/topic/orderbook/${stockCode}`,
          (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              // 데이터 수신 로그 제거 (0.1초마다 찍혀서 성능 저하)
              setOrderbookData(data);
            } catch (error) {
              logError("❌ 데이터 파싱 에러:", error);
              logError("원시 메시지:", message.body);
            }
          }
        );

        logInfo(`📡 구독 완료: ${stockCode}`);

        // 구독 요청 메시지 전송
        client.publish({
          destination: "/app/orderbook/subscribe",
          body: JSON.stringify({ stockCode }),
        });
      },

      // 연결 실패
      onStompError: (frame) => {
        logError("❌ STOMP 에러:", frame.headers["message"]);
        setIsConnected(false);
      },

      // WebSocket 에러
      onWebSocketError: (error) => {
        logError("❌ WebSocket 에러:", error);
        setIsConnected(false);
      },

      // 연결 끊김
      onDisconnect: () => {
        logInfo("🔌 WebSocket 연결 끊김");
        setIsConnected(false);
      },

      // 재연결 설정
      reconnectDelay: 3000,

      // 디버그 로그 - 에러만 표시
      debug: (str) => {
        if (isDev && (str.includes("ERROR") || str.includes("RECEIPT"))) {
          logInfo("🔍 STOMP:", str);
        }
      },
    });

    clientRef.current = client;
    client.activate();

    // 클린업
    return () => {
      // 구독 해제 요청 (연결되어 있을 때만)
      if (client.active && client.connected) {
        try {
          client.publish({
            destination: "/app/orderbook/unsubscribe",
            body: JSON.stringify({ stockCode }),
          });
          logInfo(`📤 구독 해제: ${stockCode}`);
        } catch (error) {
          logError("구독 해제 에러:", error);
        }
      }

      // 클라이언트 비활성화
      if (client.active) {
        try {
          client.deactivate();
          logInfo("🔌 연결 해제 완료");
        } catch (error) {
          logError("비활성화 에러:", error);
        }
      }
    };
  }, [stockCode]);

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      try {
        clientRef.current.deactivate();
        logInfo("🔌 수동 연결 해제 완료");
      } catch (error) {
        logError("수동 연결 해제 에러:", error);
      }
    }
  }, []);

  return {
    isConnected,
    orderbookData,
    disconnect,
  };
};
