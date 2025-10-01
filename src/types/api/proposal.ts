// 서버가 주는 제안 한 건(DTO) 모양
export type ProposalDTO = {
  proposalId : number;  // 제안 아이디
  proposalName: string; // 제안 이름
  proposerName: string; // 제안자 이름
  category: ProposalCategory; // 제안 카테고리 (매매/페이)
  action: ProposalAction; // 제안의 실제 액션 종류 (매수/매도/예수금/출금/계좌활성화)
  payload: ProposalPayload; // 제안의 실제 내용 (JSON)
  status: ProposalStatus; // 제안 상태 (OPEN, APPROVED, REJECTED)
  date: string; // 제안 날짜
  closeDate: string; // 투표 마감 날짜
  agreeCount: number; // 찬성한 사람 수
  disagreeCount: number; // 반대한 사람 수
  myVote: "AGREE" | "DISAGREE" | "NEUTRAL"; // 투표 했는지 안 했는지
};

// 제안 카테고리 - 매매/페이 구분
export enum ProposalCategory {
  TRADE = "TRADE",
  PAY = "PAY",
}

// 제안의 실제 액션 종류 - 매수/매도/예수금/페이 충전
export enum ProposalAction {
  BUY = "BUY",              // 매수
  SELL = "SELL",            // 매도
  DEPOSIT = "DEPOSIT",      // 예수금 입금
  CHARGE = "CHARGE",    // 페이 충전
  // ENABLE = "ENABLE", -> 로직 없어짐.
}

// 제안의 상태 - 진행중/가결/부결
export enum ProposalStatus {
  OPEN = "OPEN",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// 제안의 실제 내용 - JSON 구조
export type ProposalPayload = {
  reason: string; // 제안 이유
};

// 서버가 주는 제안 목록 응답 모양
export type GetProposalsResponse = {
  items: ProposalDTO[]; // 제안들 목록 (카드 여러 개)
  // nextCursor?: string; // 무한스크롤/페이지네이션용 커서 (있을 수도 있고 없을 수도 있음)
};
