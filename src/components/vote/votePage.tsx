"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import VoteModal from "./voteModal";
import type { ProposalDTO } from "../../types/api/proposal.ts";
import {
  ProposalCategory,
  ProposalAction,
  ProposalStatus,
} from "../../types/api/proposal";
import { cn } from "@/lib/utils";

const mockProposals: ProposalDTO[] = [
  {
    proposalName: "엔비디아 1주 24600원 매수 제안",
    proposerName: "김투자",
    category: ProposalCategory.TRADE,
    action: ProposalAction.BUY,
    payload: {
      reason:
        "AI 영역의 엔비디아에 대한 투자 검토를 위해 1주 매수를 제안합니다. 현재 주가가 적정 수준이라고 판단되며, 향후 성장 가능성이 높다고 생각합니다.",
    },
    status: ProposalStatus.OPEN,
    date: "2025-10-03 까지",
    closeDate: "2025.9.16",
    agreeCount: 4,
    disagreeCount: 1,
    neutralCount: 0,
    myVote: "NEUTRAL",
  },
  {
    proposalName: "아마존 2주 12345원",
    proposerName: "최매도",
    category: ProposalCategory.TRADE,
    action: ProposalAction.SELL,
    payload: {
      reason:
        "AI 영역의 테슬라에 대한 투자 검토를 위해 예수금 충전을 제안합니다. 현재 시장 상황을 고려할 때 매도가 적절한 시점이라고 판단됩니다.",
    },
    status: ProposalStatus.REJECTED,
    date: "2025.9.14",
    closeDate: "2025.9.14",
    agreeCount: 2,
    disagreeCount: 4,
    neutralCount: 0,
    myVote: "DISAGREE",
  },
  {
    proposalName: "다음이 나눔로또 사기",
    proposerName: "로또왕",
    category: ProposalCategory.PAY,
    action: ProposalAction.ENABLE,
    payload: {
      reason:
        "AI 영역의 테슬라에 대한 투자 검토를 위해 예수금 충전을 제안합니다. 이번 기회를 놓치면 안 될 것 같습니다.",
    },
    status: ProposalStatus.APPROVED,
    date: "2025.9.14",
    closeDate: "2025.9.14",
    agreeCount: 5,
    disagreeCount: 1,
    neutralCount: 0,
    myVote: "AGREE",
  },
];

export default function VotingPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "TRADE" | "PAY">("ALL");
  const [tradeDropdown, setTradeDropdown] = useState<string>("전체");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedProposals, setExpandedProposals] = useState<Set<string>>(
    new Set()
  );
  const [voteModal, setVoteModal] = useState<{
    isOpen: boolean;
    proposalName: string;
    voteType: "AGREE" | "DISAGREE";
  }>({
    isOpen: false,
    proposalName: "",
    voteType: "AGREE",
  });

  const handleTabChange = (tab: "ALL" | "TRADE" | "PAY") => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
  };

  const toggleExpanded = (proposalName: string) => {
    const newExpanded = new Set(expandedProposals);
    if (newExpanded.has(proposalName)) {
      newExpanded.delete(proposalName);
    } else {
      newExpanded.add(proposalName);
    }
    setExpandedProposals(newExpanded);
  };

  const handleVote = (proposalName: string, voteType: "AGREE" | "DISAGREE") => {
    setVoteModal({
      isOpen: true,
      proposalName,
      voteType,
    });
  };

  const getFilteredProposals = () => {
    let filtered = mockProposals;

    if (activeTab === "TRADE") {
      filtered = filtered.filter(
        (proposal) => proposal.category === ProposalCategory.TRADE
      );
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

    return filtered.sort((a, b) => {
      if (a.status === ProposalStatus.OPEN && b.status !== ProposalStatus.OPEN)
        return -1;
      if (a.status !== ProposalStatus.OPEN && b.status === ProposalStatus.OPEN)
        return 1;
      if (
        a.status !== ProposalStatus.OPEN &&
        b.status !== ProposalStatus.OPEN
      ) {
        return (
          new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime()
        );
      }
      return 0;
    });
  };

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.APPROVED:
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-500 text-xs px-2 py-1">
            가결
          </Badge>
        );
      case ProposalStatus.REJECTED:
        return (
          <Badge className="bg-gray-500 text-white hover:bg-gray-500 text-xs px-2 py-1">
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange("ALL")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "ALL"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            전체
          </button>
          <button
            onClick={() => handleTabChange("TRADE")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "TRADE"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            매매
          </button>
          <button
            onClick={() => handleTabChange("PAY")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "PAY"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            페이
          </button>
        </div>
      </div>

      {activeTab === "TRADE" && (
        <div className="bg-white border-b px-4 py-3">
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
        {getFilteredProposals().map((proposal) => (
          <Card
            key={proposal.proposalName}
            className={cn(
              proposal.status === ProposalStatus.OPEN
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200"
            )}
          >
            <div className="p-4 relative">
              {proposal.status !== ProposalStatus.OPEN && (
                <div className="absolute top-3 left-3 z-10">
                  {getStatusBadge(proposal.status)}
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600 font-medium">
                    {proposal.date}
                  </span>
                </div>
                {proposal.status === ProposalStatus.OPEN && (
                  <span className="text-xs text-gray-400">
                    {proposal.closeDate}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "mb-2",
                  proposal.status !== ProposalStatus.OPEN && "mt-6"
                )}
              >
                <h3 className="text-sm font-medium text-gray-900">
                  {proposal.proposalName}
                </h3>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                {proposal.proposerName}
              </div>

              {proposal.status === ProposalStatus.OPEN ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    {proposal.payload.reason}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(proposal.proposalName, "AGREE")}
                      className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      찬성 {proposal.agreeCount}
                    </button>
                    <button
                      onClick={() =>
                        handleVote(proposal.proposalName, "DISAGREE")
                      }
                      className="flex items-center gap-1 px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      반대 {proposal.disagreeCount}
                    </button>
                  </div>
                </div>
              ) : expandedProposals.has(proposal.proposalName) ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    {proposal.payload.reason}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-500 text-white rounded cursor-default">
                      찬성 {proposal.agreeCount}
                    </div>
                    <div className="flex items-center gap-1 px-4 py-2 text-sm bg-red-500 text-white rounded cursor-default">
                      반대 {proposal.disagreeCount}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    {truncateText(proposal.payload.reason)}
                  </p>
                  <button
                    onClick={() => toggleExpanded(proposal.proposalName)}
                    className="flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                  >
                    자세히 보기
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
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
