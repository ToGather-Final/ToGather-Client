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
import { apiGet, apiPost } from "@/utils/api/client";

// Vote Service API 호출 함수
async function fetchProposals(): Promise<ProposalDTO[]> {
    try {
        const data = await apiGet<any[]>("/vote");
        console.log("Fetched proposals:", data);

        // API 응답을 ProposalDTO 형식으로 변환
        return data.map((item: any) => ({
            proposalId: item.proposalId,
            proposalName: item.proposalName,
            proposerName: item.proposerName,
            category: item.category as ProposalCategory,
            action: item.action as ProposalAction,
            payload:
                typeof item.payload === "string"
                    ? JSON.parse(item.payload)
                    : item.payload,
            status: item.status as ProposalStatus,
            date: item.date,
            closeAt: item.closeAt,
            agreeCount: item.agreeCount,
            disagreeCount: item.disagreeCount,
            myVote: item.myVote,
        }));
    } catch (error) {
        console.error("Failed to fetch proposals:", error);
        // 에러 발생 시 빈 배열 반환
        return [];
    }
}

export default function VotingPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "TRADE" | "PAY">("ALL"); // "전체/매매/예수금 충전" 중 어디를 보고 있는지
  const [tradeDropdown, setTradeDropdown] = useState<string>("전체"); // 매매 탭일 때 "전체/매수/매도".
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열림 상태
  const [expandedProposals, setExpandedProposals] = useState<Set<string>>( // 닫힌 제안 카드에서 “자세히 보기” 눌렀는지(펼쳐짐 상태)
    new Set()
  );
  // 모달에 들어갈 데이터(현재 선택한 제안명 + 찬/반)
  const [voteModal, setVoteModal] = useState<{
    isOpen: boolean;
    proposalName: string;
    proposalId: string;
    voteType: "AGREE" | "DISAGREE";
  }>({
    isOpen: false,
    proposalName: "",
    proposalId: "",
    voteType: "AGREE",
  });

  // 실제 API에서 가져온 제안 데이터
  const [proposals, setProposals] = useState<ProposalDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    if (!isMounted) return;
    
    const loadProposals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchProposals();
        setProposals(data);
      } catch (err) {
        console.error("Failed to load proposals:", err);
        setError("제안 데이터를 불러오는데 실패했습니다.");
        // 에러 발생 시 빈 배열 사용
        setProposals([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
  }, [isMounted]);

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

  // 투표 API 호출 함수
  const submitVote = async (
    proposalId: string,
    voteType: "AGREE" | "DISAGREE"
  ) => {
    try {
      await apiPost(`/vote/${proposalId}`, {
        choice: voteType,
      });

    // 투표 API 호출 함수
    const submitVote = async (
        proposalId: string,
        voteType: "AGREE" | "DISAGREE"
    ) => {
        try {
            await apiPost(`/vote/${proposalId}`, {
                choice: voteType,
            });

            console.log("Vote submitted successfully");

            // 투표 성공 후 데이터 새로고침
            const updatedProposals = await fetchProposals();
            setProposals(updatedProposals);
        } catch (error) {
            console.error("Failed to submit vote:", error);

            // 409 Conflict - 이미 투표했을 때
            if (error instanceof Error && (error as any).status === 409) {
                alert(error.message);
                return;
            }

            // 기타 에러
            alert("투표 제출에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 모달 열고 어떤 선택인지 기록
    const handleVote = (
        proposalName: string,
        proposalId: string,
        voteType: "AGREE" | "DISAGREE"
    ) => {
        setVoteModal({
            isOpen: true,
            proposalName,
            proposalId,
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
        } else if (activeTab === "PAY") {
            filtered = filtered.filter(
                (proposal) => proposal.category === ProposalCategory.PAY
            );
        }
        // "ALL" 탭일 때는 모든 카테고리의 제안을 표시

        // 2) 드롭다운 필터 (매매 탭에서만 적용)
        if (activeTab === "TRADE") {
            if (tradeDropdown === "매수") {
                filtered = filtered.filter(
                    (proposal) => proposal.action === ProposalAction.BUY
                );
            } else if (tradeDropdown === "매도") {
                filtered = filtered.filter(
                    (proposal) => proposal.action === ProposalAction.SELL
                );
            }
            // "전체"일 때는 모든 매매 관련 제안을 표시
        }

        // 3) 정렬
        return filtered.sort((a, b) => {
            // OPEN이 항상 상단
            if (a.status === ProposalStatus.OPEN && b.status !== ProposalStatus.OPEN)
                return -1;
            if (a.status !== ProposalStatus.OPEN && b.status === ProposalStatus.OPEN)
                return 1;

            // 같은 상태끼리는 date 기준 내림차순(최신 먼저)
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    };

      // 기타 에러
      alert("투표 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 모달 열고 어떤 선택인지 기록
  const handleVote = (proposalName: string, proposalId: string, voteType: "AGREE" | "DISAGREE", myVote: string | null) => {
    // 이미 투표한 경우 모달을 열지 않음
    if (myVote !== null) {
      return;
    }
    
    setVoteModal({
      isOpen: true,
      proposalName,
      proposalId,
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
    } else if (activeTab === "PAY") {
      filtered = filtered.filter(
        (proposal) => proposal.category === ProposalCategory.PAY
      );
    }
    // "ALL" 탭일 때는 모든 카테고리의 제안을 표시

    // 2) 드롭다운 필터 (매매 탭에서만 적용)
    if (activeTab === "TRADE") {
      if (tradeDropdown === "매수") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.BUY
        );
      } else if (tradeDropdown === "매도") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.SELL
        );
      }
      // "전체"일 때는 모든 매매 관련 제안을 표시
    }

    const truncateText = (text: string, maxLines = 2) => {
        const words = text.split(" ");
        if (words.length <= 15) return text; // 대략 2줄 분량
        return words.slice(0, 15).join(" ") + "...";
    };

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

  // closeAt 시간 표시 포맷팅 함수
  const formatCloseAt = (closeAt: string) => {
    if (!closeAt) return '시간 미정';
    
    try {
      // "2025-10-21 19시 57분" 형식에서 날짜와 시간 추출
      const dateTimeMatch = closeAt.match(/(\d{4}-\d{2}-\d{2})\s+(\d+시\s+\d+분)/);
      if (!dateTimeMatch) return closeAt;
      
      const [, dateStr, timeStr] = dateTimeMatch;
      const closeDate = new Date(dateStr);
      const today = new Date();
      
      // 날짜 비교 (년월일만)
      const isToday = closeDate.getFullYear() === today.getFullYear() &&
                     closeDate.getMonth() === today.getMonth() &&
                     closeDate.getDate() === today.getDate();
      
      if (isToday) {
        return `오늘 ${timeStr}까지`;
      } else {
        return `${closeAt}까지`;
      }
    } catch (error) {
      console.error('Error formatting closeAt:', error);
      return closeAt;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-4">
      <div className="bg-white px-4 py-3">
        <div className="flex w-full gap-2 justify-center">
          <button
            onClick={() => handleTabChange("ALL")}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl text-sm font-medium text-center transition-colors",
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
            예수금 충전
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
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {!isMounted ? (
          <div className="flex justify-center items-center text-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center text-center h-64">
            <div className="text-gray-500">제안 데이터를 불러오는 중...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center text-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        ) : getFilteredProposals().length === 0 ? (
          <div className="flex justify-center items-center text-center h-64">
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
                  <div className="absolute top-4 left-5 z-0">
                    {getStatusBadge(proposal.status)}
                  </div>
                )}

            <div className="p-4 space-y-3">
                {isLoading ? (
                    <div className="flex justify-center items-center  text-center h-64">
                        <div className="text-gray-500">제안 데이터를 불러오는 중...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center  text-center h-64">
                        <div className="text-red-500">{error}</div>
                    </div>
                ) : getFilteredProposals().length === 0 ? (
                    <div className="flex justify-center items-center text-center h-64">
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
                                    <div className="absolute top-4 left-5 z-0">
                                        {getStatusBadge(proposal.status)}
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {proposal.status === ProposalStatus.OPEN && (
                                            <span className="text-xs">
                        <span className="text-blue-600 font-bold">
                          {formatCloseAt(proposal.closeAt)}
                        </span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{proposal.date}</span>
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
                        onClick={() => handleVote(proposal.proposalName, proposal.proposalId, "AGREE", proposal.myVote)}
                        disabled={proposal.myVote !== null}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
                          proposal.myVote === "AGREE"
                            ? "bg-[#2563EB] text-white cursor-default"
                            : proposal.myVote !== null
                            ? "bg-[#2563EB] text-white cursor-default"
                            : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                        }`}
                      >
                        찬성 {proposal.agreeCount}
                      </button>
                      <button
                        onClick={() =>
                          handleVote(proposal.proposalName, proposal.proposalId, "DISAGREE", proposal.myVote)
                        }
                        disabled={proposal.myVote !== null}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
                          proposal.myVote === "DISAGREE"
                            ? "bg-gray-300 text-gray-500 cursor-default"
                            : proposal.myVote !== null
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#F85449] text-white hover:bg-[#E53E3E]"
                        }`}
                      >
                        반대 {proposal.disagreeCount}
                      </button>
                    </div>
                  </div>
                ) : expandedProposals.has(proposal.proposalId) ? (
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
                      onClick={() => toggleExpanded(proposal.proposalId)}
                      className="flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                    >
                      자세히 보기
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
            </div>

            <VoteModal
                isOpen={voteModal.isOpen}
                onClose={() => setVoteModal({ ...voteModal, isOpen: false })}
                voteType={voteModal.voteType === "AGREE" ? "approve" : "reject"}
                proposalName={voteModal.proposalName}
                onConfirm={async () => {
                    console.log(
                        `Vote ${voteModal.voteType} for ${voteModal.proposalName}`
                    );

                    // 실제 투표 제출
                    await submitVote(voteModal.proposalId, voteModal.voteType);

                    setVoteModal({ ...voteModal, isOpen: false });
                }}
            />
        </div>
    );
}