"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import VoteModal from "../../components/vote/VoteModal";
import type { ProposalDTO } from "../../types/api/proposal";
import {
  ProposalCategory,
  ProposalAction,
  ProposalStatus,
} from "../../types/api/proposal";
import { cn } from "@/lib/utils";
import { getAuthHeaders } from "@/utils/token";

// Vote Service API 호출 함수
async function fetchProposals(): Promise<ProposalDTO[]> {
  const VOTE_SERVICE_URL = process.env.NEXT_PUBLIC_VOTE_SERVICE_URL
  
  try {
    const response = await fetch(`${VOTE_SERVICE_URL}/vote`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(), // Authorization 헤더 자동 추가
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Fetched proposals:', data)
    
    // API 응답을 ProposalDTO 형식으로 변환
    return data.map((item: any) => ({
      proposalId: item.proposalId,
      proposalName: item.proposalName,
      proposerName: item.proposerName,
      category: item.category as ProposalCategory,
      action: item.action as ProposalAction,
      payload: typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload,
      status: item.status as ProposalStatus,
      date: item.date,
      closeDate: item.closeDate || item.date, // closeDate가 없으면 date 사용
      agreeCount: item.agreeCount,
      disagreeCount: item.disagreeCount,
      myVote: item.myVote,
    }))
  } catch (error) {
    console.error('Failed to fetch proposals:', error)
    // 에러 발생 시 빈 배열 반환
    return []
  }
}

const mockProposals: ProposalDTO[] = [
  {
    proposalId: 1,
    proposalName: "엔비디아 1주 24600원 매수 제안",
    proposerName: "정다영",
    category: ProposalCategory.TRADE,
    action: ProposalAction.BUY,
    payload: {
      reason:
        "AI 영역의 엔비디아에 대한 투자 검토를 위해 1주 매수를 제안합니다. 현재 주가가 적정 수준이라고 판단되며, 향후 성장 가능성이 높다고 생각합니다.",
    },
    status: ProposalStatus.OPEN,
    date: "2025-09-24",
    closeDate: "2025-09-24 23:59:59",
    agreeCount: 4,
    disagreeCount: 1,
    myVote: "NEUTRAL",
  },
  {
    proposalId: 2,
    proposalName: "아마존 2주 12345원",
    proposerName: "김지수",
    category: ProposalCategory.TRADE,
    action: ProposalAction.SELL,
    payload: {
      reason:
        "AI 영역의 테슬라에 대한 투자 검토를 위해 예수금 충전을 제안합니다. 현재 시장 상황을 고려할 때 매도가 적절한 시점이라고 판단됩니다.",
    },
    status: ProposalStatus.REJECTED,
    date: "2025-09-14",
    closeDate: "2025-09-14 23:59:59",
    agreeCount: 2,
    disagreeCount: 4,
    myVote: "DISAGREE",
  },
  {
    proposalId: 3,
    proposalName: "다영이 스위치 사주기",
    proposerName: "황인찬",
    category: ProposalCategory.PAY,
    action: ProposalAction.CHARGE,
    payload: {
      reason:
        "닌텐도 스위치2 나온 김에 다영이 스위치2 사줍시다.",
    },
    status: ProposalStatus.APPROVED,
    date: "2025-09-13",
    closeDate: "2025-09-13 23:59:59",
    agreeCount: 5,
    disagreeCount: 1,
    myVote: "AGREE",
  },
  {
    proposalId: 4,
    proposalName: "테슬라 3주 매수 제안",
    proposerName: "김태헌",
    category: ProposalCategory.TRADE,
    action: ProposalAction.BUY,
    payload: {
      reason:
        "전기차 시장 확대와 자율주행 기술 발전에 따라 장기적 성장이 기대됩니다. 최근 조정으로 적정 매수 기회라 판단됩니다.",
    },
    status: ProposalStatus.OPEN,
    date: "2025-09-10",
    closeDate: "2025-09-10 23:59:59",
    agreeCount: 3,
    disagreeCount: 0,
    myVote: "AGREE",
  },
  {
    proposalId: 5,
    proposalName: "삼성전자 5주 매도 제안",
    proposerName: "박순영",
    category: ProposalCategory.TRADE,
    action: ProposalAction.SELL,
    payload: {
      reason:
        "단기적인 반도체 업황 둔화를 고려해 일부 수익 실현을 제안합니다.",
    },
    status: ProposalStatus.OPEN,
    date: "2025-09-20",
    closeDate: "2025-09-20 23:59:59",
    agreeCount: 2,
    disagreeCount: 3,
    myVote: "DISAGREE",
  },
  {
    proposalId: 6,
    proposalName: "저녁 치킨 회식",
    proposerName: "정다영",
    category: ProposalCategory.PAY,
    action: ProposalAction.CHARGE,
    payload: {
      reason:
        "팀 사기 진작 및 프로젝트 완성 축하 차원에서 치킨 회식을 제안합니다.",
    },
    status: ProposalStatus.APPROVED,
    date: "2025-09-18",
    closeDate: "2025-09-18 23:59:59",
    agreeCount: 6,
    disagreeCount: 0,
    myVote: "AGREE",
  },
  {
    proposalId: 7,
    proposalName: "ETF 투자 전략 세미나 참여",
    proposerName: "정다영",
    category: ProposalCategory.PAY,
    action: ProposalAction.CHARGE,
    payload: {
      reason:
        "ETF 트렌드와 리스크 관리 전략에 대한 세미나 참석으로 투자 역량을 강화하고자 합니다.",
    },
    status: ProposalStatus.OPEN,
    date: "2025-09-22",
    closeDate: "2025-09-28 23:59:59",
    agreeCount: 4,
    disagreeCount: 1,
    myVote: "NEUTRAL",
  },
  {
    proposalId: 8,
    proposalName: "정기 모임 계좌 관리 서비스 변경",
    proposerName: "오세훈",
    category: ProposalCategory.PAY,
    action: ProposalAction.BUY,
    payload: {
      reason:
        "현재 은행 서비스의 수수료 및 사용성 문제로 인해 더 효율적인 계좌 관리 서비스를 사용하고자 합니다.",
    },
    status: ProposalStatus.REJECTED,
    date: "2025-09-10",
    closeDate: "2025-09-15 23:59:59",
    agreeCount: 1,
    disagreeCount: 5,
    myVote: "DISAGREE",
  },
];

export default function VotingPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "TRADE" | "PAY">("ALL");     // “전체/매매/페이” 중 어디를 보고 있는지
  const [tradeDropdown, setTradeDropdown] = useState<string>("전체");             // 매매 탭일 때 “전체/매수/매도/예수금 충전”.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);                    // 드롭다운 열림 상태
  const [expandedProposals, setExpandedProposals] = useState<Set<string>>(        // 닫힌 제안 카드에서 “자세히 보기” 눌렀는지(펼쳐짐 상태)
    new Set()
  );
  // 모달에 들어갈 데이터(현재 선택한 제안명 + 찬/반)
  const [voteModal, setVoteModal] = useState<{
    isOpen: boolean;
    proposalName: string;
    voteType: "AGREE" | "DISAGREE";
  }>({
    isOpen: false,
    proposalName: "",
    voteType: "AGREE",
  });
  
  // 실제 API에서 가져온 제안 데이터
  const [proposals, setProposals] = useState<ProposalDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    const loadProposals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchProposals();
        setProposals(data);
      } catch (err) {
        console.error('Failed to load proposals:', err);
        setError('제안 데이터를 불러오는데 실패했습니다.');
        // 에러 발생 시 mock 데이터 사용
        setProposals(mockProposals);
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
  }, []);

  // 탭 바꿀 때 로직. 탭 바꾸면 드롭다운 닫음
  const handleTabChange = (tab: "ALL" | "TRADE" | "PAY") => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
  };

  // 닫힌 카드에서 "자세히 보기" 토글
  const toggleExpanded = (proposalId: string) => {
    const newExpanded = new Set(expandedProposals);
    if (newExpanded.has(proposalId)) {
      newExpanded.delete(proposalId);
    } else {
      newExpanded.add(proposalId);
    }
    setExpandedProposals(newExpanded);
  };

  // 모달 열고 어떤 선택인지 기록
  const handleVote = (proposalName: string, voteType: "AGREE" | "DISAGREE") => {
    setVoteModal({
      isOpen: true,
      proposalName,
      voteType,
    });
  };

  const getFilteredProposals = () => {
    let filtered = proposals;

    // 1) 탭 필터
    if (activeTab === "TRADE") {
      filtered = filtered.filter(
        (proposal) => proposal.category === ProposalCategory.TRADE
      );

      // 2) 매매 드롭다운 필터
      if (tradeDropdown === "매수") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.BUY
        );
      } else if (tradeDropdown === "매도") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.SELL
        );
      } else if (tradeDropdown === "예수금 충전") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.DEPOSIT
        );
      }
      // "전체"일 때는 모든 매매 관련 제안을 표시
    } else if (activeTab === "PAY") {
      filtered = filtered.filter(
        (proposal) => proposal.category === ProposalCategory.PAY
      );
    }

    // 3) 정렬
    return filtered.sort((a, b) => {
      // OPEN이 항상 상단
      if (a.status === ProposalStatus.OPEN && b.status !== ProposalStatus.OPEN) return -1;
      if (a.status !== ProposalStatus.OPEN && b.status === ProposalStatus.OPEN) return 1;

      // 같은 상태끼리는 date 기준 내림차순(최신 먼저)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.APPROVED:
        return (
          <Badge className="bg-[#2563EB] text-white hover:bg-[#2563EB] text-xs font-medium px-3.5 py-1">
            가결
          </Badge>
        );
      case ProposalStatus.REJECTED:
        return (
          <Badge className="bg-[#686868] text-white hover:bg-[#686868] text-xs font-medium px-3.5 py-1">
            부결
          </Badge>
        );
      default:
        return null;
    }
  };

  const truncateText = (text: string, maxLines = 2) => {
    const words = text.split(" ");
    if (words.length <= 15) return text; // 대략 2줄 분량
    return words.slice(0, 15).join(" ") + "...";
  };

  return (
    <div className="min-h-screen bg-white pb-4">
      <div className="bg-white px-4 py-3">
        <div className="flex w-full gap-2 justify-center">
          <button
            onClick={() => handleTabChange("ALL")}
            className={cn(
              "flex-1 px-6 py-3 rounded-xl text-sm font-medium text-center transition-colors",
              activeTab === "ALL"
                ? "bg-[#447AFA] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            전체
          </button>
          <button
            onClick={() => handleTabChange("TRADE")}
            className={cn(
              "flex-1 px-6 py-3 rounded-xl text-sm font-medium text-center transition-colors",
              activeTab === "TRADE"
                ? "bg-[#447AFA] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            매매
          </button>
          <button
            onClick={() => handleTabChange("PAY")}
            className={cn(
              "flex-1 px-6 py-3 rounded-xl text-sm font-medium text-center transition-colors",
              activeTab === "PAY"
                ? "bg-[#447AFA] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            페이
          </button>
        </div>
      </div>

      {activeTab === "TRADE" && (
        <div className="bg-white px-4 py-3">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-32 px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
            >
              {tradeDropdown}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-lg z-10">
                <button
                  onClick={() => {
                    setTradeDropdown("전체");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  전체
                </button>
                <button
                  onClick={() => {
                    setTradeDropdown("매수");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  매수
                </button>
                <button
                  onClick={() => {
                    setTradeDropdown("매도");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  매도
                </button>
                <button
                  onClick={() => {
                    setTradeDropdown("예수금 충전");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  예수금 충전
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">제안 데이터를 불러오는 중...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : getFilteredProposals().length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">표시할 제안이 없습니다.</div>
          </div>
        ) : (
          getFilteredProposals().map((proposal) => (
          <Card
            key={proposal.proposalId}
            className={cn(
              proposal.status === ProposalStatus.OPEN
                ? "bg-[#EEF2FF]"
                : "bg-white"
            )}
          >
            <div className="px-5 py-4 relative">
              {proposal.status !== ProposalStatus.OPEN && (
                 <div className="absolute top-4 left-5 z-10">
                  {getStatusBadge(proposal.status)}
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {proposal.status === ProposalStatus.OPEN && (
                    <span className="text-xs">
                      <span className="text-blue-600 font-bold">{proposal.closeDate}</span>
                      <span className="text-gray-500 font-normal">까지</span>
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {proposal.date}
                </span>
              </div>

              <div
                className={cn(
                  "mb-4",
                  proposal.status !== ProposalStatus.OPEN && "mt-6"
                )}
              >
                <h3 className="text-base font-medium text-gray-900">
                  {proposal.proposalName}
                </h3>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                {proposal.proposerName}
              </div>

              {proposal.status === ProposalStatus.OPEN ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    {proposal.payload.reason}
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleVote(proposal.proposalName, "AGREE")}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#2563EB] text-white rounded hover:bg-[#1D4ED8] transition-colors"
                    >
                      찬성 {proposal.agreeCount}
                    </button>
                    <button
                      onClick={() =>
                        handleVote(proposal.proposalName, "DISAGREE")
                      }
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#F85449] text-white rounded hover:bg-[#E53E3E] transition-colors"
                    >
                      반대 {proposal.disagreeCount}
                    </button>
                  </div>
                </div>
              ) : expandedProposals.has(proposal.proposalId.toString()) ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    {proposal.payload.reason}
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#2563EB] text-white rounded cursor-default">
                      찬성 {proposal.agreeCount}
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#F85449] text-white rounded cursor-default">
                      반대 {proposal.disagreeCount}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    {truncateText(proposal.payload.reason)}
                  </p>
                  <button
                    onClick={() => toggleExpanded(proposal.proposalId.toString())}
                    className="flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                  >
                    자세히 보기
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        )))}
      </div>

      <VoteModal
        isOpen={voteModal.isOpen}
        onClose={() => setVoteModal({ ...voteModal, isOpen: false })}
        voteType={voteModal.voteType === "AGREE" ? "approve" : "reject"}
        proposalName={voteModal.proposalName}
        onConfirm={() => {
          console.log(
            `Vote ${voteModal.voteType} for ${voteModal.proposalName}`
          );
          setVoteModal({ ...voteModal, isOpen: false });
        }}
      />
    </div>
  );
}
