// src/types/api/history.ts

// 1) 공통 분류/타입
export enum HistoryCategory {
    VOTE = "VOTE",      // 투표 - 투표 올라옴(매도/매수/예수금/페이 충전), 투표 가결, 투표 부결
    TRADE = "TRADE",    // 매매 - 매도/매수 완료, 매도/매수 실패
    CASH = "CASH",      // 예수금 - 예수금 충전 완료
    PAY = "PAY",        // 페이 충전 완료
    GOAL = "GOAL",      // 목표(목표 달성)
  }
  
  export enum HistoryType {
    // 투표
    VOTE_CREATED_BUY = "VOTE_CREATED_BUY",     // 매수 투표 제안
    VOTE_CREATED_SELL = "VOTE_CREATED_SELL",   // 매도 투표 제안
    VOTE_CREATED_PAY = "VOTE_CREATED_PAY",     // 페이 충전 투표 제안
    VOTE_APPROVED = "VOTE_APPROVED",           // 투표 가결
    VOTE_REJECTED = "VOTE_REJECTED",           // 투표 부결
    VOTE_EXPIRED = "VOTE_EXPIRED",             // 투표 만료

    // 매매
    TRADE_EXECUTED = "TRADE_EXECUTED", // 매도/매수 완료
    TRADE_FAILED = "TRADE_FAILED",     // 매도/매수 실패

    // 예수금
    CASH_DEPOSIT_COMPLETED = "CASH_DEPOSIT_COMPLETED", // 예수금 충전 완료

    // 페이
    PAY_CHARGE_COMPLETED = "PAY_CHARGE_COMPLETED", // 페이 충전 완료(모임통장으로 송금)

    // 목표
    GOAL_ACHIEVED = "GOAL_ACHIEVED",            // 목표 달성
  }
  
  export type TradeSide = "BUY" | "SELL";
  
  // 2) 서버가 주는 히스토리 아이템(DTO)
  export type HistoryDTO = {
    id: string;  // 서버에서는 string으로 옴옴
    category: HistoryCategory;
    type: HistoryType;
    title: string;           // 카드 타이틀
    date: string;    // 우측 날짜 표기(선택, 서버 or 클라 포맷)
    payload?:
      | VoteCreatedPayloadDTO
      | VoteApprovedPayloadDTO
      | VoteRejectedPayloadDTO
      | VoteExpiredPayloadDTO
      | TradeExecutedPayloadDTO
      | TradeFailedPayloadDTO
      | CashDepositCompletedPayloadDTO
      | PayChargeCompletedPayloadDTO
      | GoalAchievedPayloadDTO;
  };
  
  // 3) 타입별 페이로드
  
  // 투표 올라옴
  export type VoteCreatedPayloadDTO = {
    proposalId: string;  // 서버에서는 string으로 옴
    proposalName: string;
    proposerName: string;
  };
  
  // 투표 가결
  export type VoteApprovedPayloadDTO = {
    proposalId: string;  // 제안 아이디
    scheduledAt: string; // 실행 예정 시각
    historyType: "TRADE" | "PAY"; // TRADE/PAY 구분
    side: "BUY" | "SELL" | "PAY"; // 매수/매도/페이
    stockName: string | null; // 주식 이름 (TRADE일 때만, PAY일 때는 null)
    shares: number | null; // 몇 주 (TRADE일 때만, PAY일 때는 null)
    unitPrice: number | null; // 1주 가격 (TRADE일 때만, PAY일 때는 null)
    currency: "KRW" | "USD" | null; // 원/달러 (TRADE일 때만, PAY일 때는 null)
  };
  
  // 투표 부결
  export type VoteRejectedPayloadDTO = {
    proposalId: string;  // 서버에서는 string으로 옴
    proposalName: string;
  };

  // 투표 만료
  export type VoteExpiredPayloadDTO = {
    proposalId: string;  // 서버에서는 string으로 옴
    proposalName: string;
    reason: string;      // 만료 사유 (예: "마감시간")
  };
  
  // 매도/매수 완료
  export type TradeExecutedPayloadDTO = {
    side: TradeSide;         // "BUY" | "SELL"
    stockName: string;            // 예: 테슬라
    shares: number;          // 체결 수량
    unitPrice: number;           // 1주 체결가
    accountBalance: number; // 체결 후 모임계좌잔액
  };
  
  // 매도/매수 실패
  export type TradeFailedPayloadDTO = {
    side: TradeSide;
    stockName: string;
    reason: string;         // 실패 사유(잔고부족, 호가변경 등)
  };
  
  // 예수금 충전 완료
  export type CashDepositCompletedPayloadDTO = {
    amount: number;          // 금액
    accountBalance: number; // 이후 모임계좌잔액
  };
  
  // 페이 충전 완료(모임통장으로 송금)
  export type PayChargeCompletedPayloadDTO = {
    amount: number;          // 금액
    accountBalance: number; // 이후 모임계좌잔액
  };
  
  // 목표 달성
  export type GoalAchievedPayloadDTO = {
    targetAmount: number;    // 목표 금액
  };
  
  // 4) 목록 응답
  export type GetHistoryResponse = {
    items: HistoryDTO[];
    nextCursor?: string;
  };
  