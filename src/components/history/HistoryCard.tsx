import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  type HistoryDTO,
  HistoryType,
  type VoteApprovedPayloadDTO,
  type TradeExecutedPayloadDTO,
  type CashDepositCompletedPayloadDTO,
  type PayChargeCompletedPayloadDTO,
  type VoteCreatedPayloadDTO,
  type GoalAchievedPayloadDTO,
} from "@/types/api/history";
import { Handshake, CheckCircle, Wallet, XCircle, DollarSign, Award, X, Vote, Coins } from "lucide-react";

// 한글 받침 유무에 따라 이/가 구별하는 함수
const getKoreanParticle = (text: string) => {
  const lastChar = text.charAt(text.length - 1);
  const lastCharCode = lastChar.charCodeAt(0);
  
  // 한글 범위 확인 (가-힣)
  if (lastCharCode >= 0xAC00 && lastCharCode <= 0xD7A3) {
    // 한글의 경우 받침이 있으면 '이', 없으면 '가'
    const hasFinalConsonant = (lastCharCode - 0xAC00) % 28 !== 0;
    return hasFinalConsonant ? '이' : '가';
  }
  
  // 한글이 아닌 경우 기본값
  return '이';
};

// ISO 날짜를 한국어 형식으로 변환하는 함수
const formatKoreanDate = (isoDateString: string) => {
  try {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
  } catch (error) {
    // console.error('날짜 포맷팅 오류:', error);
    return isoDateString; // 오류 시 원본 반환
  }
};

// 주식 거래 정보를 포맷팅하는 함수
const formatStockTradeInfo = (payload: VoteApprovedPayloadDTO) => {
  const { stockName, shares, unitPrice, side } = payload;
  
  if (!shares || !unitPrice) {
    return `${stockName} 거래 예정`;
  }
  
  const totalAmount = shares * unitPrice;
  const sideKorean = side === "BUY" ? "매수" : "매도";
  
  return `${stockName} ${shares}주 ${totalAmount.toLocaleString()}원 ${sideKorean} 예정`;
};

// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
const formatSimpleDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    // console.error('날짜 포맷팅 오류:', error);
    return dateString; // 오류 시 원본 반환
  }
};

const getHistoryIcon = (type: HistoryType) => {
  switch (type) {
    case HistoryType.TRADE_EXECUTED: // 매수/매도 거래 완료 - 악수 아이콘
      return <Handshake className="w-5 h-5" />
    case HistoryType.VOTE_APPROVED: // 투표 가결 - 초록색 체크 아이콘
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case HistoryType.VOTE_REJECTED: // 투표 부결 - 빨간색 X 아이콘
      return <XCircle className="w-5 h-5 text-red-600" />
    case HistoryType.CASH_DEPOSIT_COMPLETED: // 예수금 충전 완료 - 동전 아이콘
      return <Coins className="w-5 h-5" />
    case HistoryType.PAY_CHARGE_COMPLETED: // 페이 충전 완료 - 달러 아이콘
      return <DollarSign className="w-5 h-5" />
    case HistoryType.VOTE_CREATED_BUY: // 매수 투표 제안 - 투표 아이콘
    case HistoryType.VOTE_CREATED_SELL: // 매도 투표 제안 - 투표 아이콘
    case HistoryType.VOTE_CREATED_PAY: // 페이 충전 투표 제안 - 투표 아이콘
      return <Vote className="w-5 h-5" />
    case HistoryType.TRADE_FAILED: // 거래 실패 - 악수 아이콘 + 빨간 X 오버레이
      return (
        <div className="relative w-5 h-5">
          <Handshake className="w-5 h-5" />
          <X className="w-3 h-3 text-red-500 absolute bottom-0 right-0" strokeWidth={5} />
        </div>
      )
    case HistoryType.GOAL_ACHIEVED: // 목표 달성 - 금색 훈장 아이콘
      return <Award className="w-5 h-5 text-yellow-500" />
    default: // 기본값 - 지갑 아이콘
      return <Wallet className="w-5 h-5" />
  }
}

const getHistoryDescription = (item: HistoryDTO) => {
  switch (item.type) {
    // 매수/매도 거래 완료
    case HistoryType.TRADE_EXECUTED:
      const tradePayload = item.payload as TradeExecutedPayloadDTO
      return `계좌 잔액 ${tradePayload.accountBalance.toLocaleString()}원`
    // 투표 가결
    case HistoryType.VOTE_APPROVED:
      const votePayload = item.payload as VoteApprovedPayloadDTO
      const formattedDate = formatKoreanDate(votePayload.scheduledAt)
      
      if (votePayload.historyType === "PAY") {
        // PAY인 경우: 예수금 충전 메시지만 표시
        return `예수금 충전이 자동으로 진행됩니다.`
      } else if (votePayload.historyType === "TRADE") {
        // TRADE인 경우: 주식 정보 표시
        const sideText = votePayload.side === "BUY" ? "매수" : "매도"
        const currencyText = votePayload.currency === "USD" ? "달러" : "원"
        const stockName = votePayload.stockName || "주식"
        const shares = votePayload.shares || 0
        const unitPrice = votePayload.unitPrice || 0
        
        return `${formattedDate}\n${stockName} ${shares}주 ${unitPrice.toLocaleString()}${currencyText} ${sideText} 예정`
      }
      
      return `투표가 가결되었습니다\n${formattedDate}`
    // 투표 부결
    case HistoryType.VOTE_REJECTED:
      const rejectedPayload = item.payload as VoteCreatedPayloadDTO
      const particle = getKoreanParticle(rejectedPayload.proposalName)
      return `${rejectedPayload.proposalName}${particle} 부결되었습니다.`
    // 예수금 충전 완료
    case HistoryType.CASH_DEPOSIT_COMPLETED:
      const cashPayload = item.payload as CashDepositCompletedPayloadDTO
      return `각자 ${cashPayload.amount.toLocaleString()}원씩 예수금 충전 완료했습니다.\n예수금 잔액 ${cashPayload.accountBalance.toLocaleString()}원`
    // 페이 충전 완료
    case HistoryType.PAY_CHARGE_COMPLETED:
      const payChargePayload = item.payload as PayChargeCompletedPayloadDTO
      return `각자 ${payChargePayload.amount.toLocaleString()}원씩 페이 충전 완료했습니다.\n계좌 잔액 ${payChargePayload.accountBalance.toLocaleString()}원`
    // 투표 제안 등록
    case HistoryType.VOTE_CREATED_BUY:
      const buyPayload = item.payload as VoteCreatedPayloadDTO
      return `${buyPayload.proposerName}님이 매수 제안을 등록했습니다.`
    case HistoryType.VOTE_CREATED_SELL:
      const sellPayload = item.payload as VoteCreatedPayloadDTO
      return `${sellPayload.proposerName}님이 매도 제안을 등록했습니다.`
    case HistoryType.VOTE_CREATED_PAY:
      const payVotePayload = item.payload as VoteCreatedPayloadDTO
      return `${payVotePayload.proposerName}님이 페이 충전 제안을 등록했습니다.`
    // 거래 실패
    case HistoryType.TRADE_FAILED:
      const failedPayload = item.payload as TradeExecutedPayloadDTO
      return `${failedPayload.stockName} ${failedPayload.shares}주 매도가 실패했습니다.\n계좌 잔액 ${failedPayload.accountBalance.toLocaleString()}원`
    // 목표 달성
    case HistoryType.GOAL_ACHIEVED:
      const goalPayload = item.payload as GoalAchievedPayloadDTO
      return `목표 금액 ${goalPayload.targetAmount}원을 달성했습니다!`
    default:
      return ""
  }
}

interface HistoryCardProps {
  item: HistoryDTO;
  className?: string;
}

export default function HistoryCard({ item, className }: HistoryCardProps) {
  return (
    <Card className={cn("p-4 bg-white rounded-3xl border border-gray-200", className)}>
      <div className="flex items-center gap-3 mb-0">
        <div className="flex-shrink-0">{getHistoryIcon(item.type)}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
        </div>
      </div>
      <div className="ml-8 mb-2">
        <p className="text-sm text-gray-600 whitespace-pre-line">{getHistoryDescription(item)}</p>
      </div>
      <div className="flex justify-end">
        <div className="text-xs text-gray-400">{formatSimpleDate(item.date)}</div>
      </div>
    </Card>
  );
}
