"use client";
// hooks/useStompWebSocket.ts - 순수 WebSocket 사용 (SockJS 제거)
import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { OrderBook } from "@/types/api/stock";

export const useStompWebSocket = (stockCode: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [orderbookData, setOrderbookData] = useState<OrderBook | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    console.log("🚀 순수 WebSocket 연결 시도 시작...");
    console.log("📡 연결 URL: ws://localhost:8000/ws");
    console.log("📊 종목 코드:", stockCode);
    
    // 순수 WebSocket을 사용한 STOMP 클라이언트 생성 (SockJS 없음)
    const client = new Client({
      brokerURL: "ws://localhost:8000/ws",
      
      // STOMP 프로토콜 버전 설정
      connectHeaders: {
        "accept-version": "1.2,1.1,1.0",
        "heart-beat": "10000,10000"
      },
      
      // 연결 성공
      onConnect: () => {
        console.log("✅ WebSocket 연결 성공!");
        setIsConnected(true);

        // 호가 데이터 수신 구독
        client.subscribe(
          `/topic/orderbook/${stockCode}`,
          (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              console.log("📩 호가 데이터 수신:", data);
              setOrderbookData(data);
            } catch (error) {
              console.error("❌ 데이터 파싱 에러:", error);
              console.log("원시 메시지:", message.body);
            }
          }
        );

        console.log(`📡 종목 ${stockCode} 호가 구독 완료`);

        // 구독 요청 메시지 전송
        client.publish({
          destination: "/app/orderbook/subscribe",
          body: JSON.stringify({ stockCode }),
        });

        console.log(`📤 구독 요청 전송: ${stockCode}`);
      },

      // 연결 실패
      onStompError: (frame) => {
        console.error("❌ STOMP 에러:", frame.headers["message"]);
        console.error("상세:", frame.body);
        console.error("전체 프레임:", frame);
        setIsConnected(false);
      },

      // WebSocket 에러
      onWebSocketError: (error) => {
        console.error("❌ WebSocket 에러:", error);
        console.error("에러 타입:", typeof error);
        console.error("에러 상세:", error);
        setIsConnected(false);
      },

      // 연결 끊김
      onDisconnect: () => {
        console.log("🔌 WebSocket 연결 끊김");
        setIsConnected(false);
      },

      // 재연결 설정
      reconnectDelay: 3000,

      // 디버그 로그 활성화
      debug: (str) => {
        console.log('🔍 STOMP:', str);
      },
    });

    clientRef.current = client;
    console.log("🔄 STOMP 클라이언트 활성화 중...");
    client.activate();
    console.log("✅ STOMP 클라이언트 활성화 완료");

    // 클린업
    return () => {
      if (client.active) {
        // 구독 해제 요청
        try {
          client.publish({
            destination: "/app/orderbook/unsubscribe",
            body: JSON.stringify({ stockCode }),
          });
          console.log(`📤 구독 해제 요청: ${stockCode}`);
        } catch (error) {
          console.error("구독 해제 에러:", error);
        }

        client.deactivate();
      }
    };
  }, [stockCode]);

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
    }
  }, []);

  return {
    isConnected,
    orderbookData,
    disconnect,
  };
};