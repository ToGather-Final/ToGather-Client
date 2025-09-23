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
    proposalName: "예수금 출금 50000원",
    category: ProposalCategory.PAY,
    action: ProposalAction.DEPOSIT,
    payload: {
      reason: "주식 투자를 위한 예수금 출금을 진행하고자 합니다.",
    },
    status: ProposalStatus.OPEN,
    date: "2024.01.15",
    agreeCount: 4,
    disagreeCount: 1,
    neutralCount: 2,
    myVote: "NEUTRAL",
  },
  {
    proposalName: "테슬라 1주 580000원",
    category: ProposalCategory.TRADE,
    action: ProposalAction.BUY,
    payload: {
      reason: "AI 영역의 테슬라에 대한 투자 검토를 위해 1주 매수를 제안합니다.",
    },
    status: ProposalStatus.OPEN,
    date: "2024.01.16",
    agreeCount: 0,
    disagreeCount: 0,
    neutralCount: 7,
    myVote: "NEUTRAL",
  },
  {
    proposalName: "아마존 2주 123456원",
    category: ProposalCategory.TRADE,
    action: ProposalAction.SELL,
    payload: {
      reason: "아마존 주식 2주 매도 제안입니다.",
    },
    status: ProposalStatus.REJECTED,
    date: "2024.01.14",
    agreeCount: 2,
    disagreeCount: 5,
    neutralCount: 0,
    myVote: "DISAGREE",
  },
  {
    proposalName: "다음이 나눔로또 사기",
    category: ProposalCategory.PAY,
    action: ProposalAction.ENABLE,
    payload: { reason: "다음이 나눔로또 구매 제안입니다." },
    status: ProposalStatus.APPROVED,
    date: "2024.01.13",
    agreeCount: 8,
    disagreeCount: 1,
    neutralCount: 0,
    myVote: "AGREE",
  },
  {
    proposalName: "엔비디아 1주 246600원",
    category: ProposalCategory.TRADE,
    action: ProposalAction.BUY,
    payload: {
      reason:
        "AI 영역의 엔비디아에 대한 투자 검토를 위해 1주 매수를 제안합니다.",
    },
    status: ProposalStatus.OPEN,
    date: "2024.01.11",
    agreeCount: 0,
    disagreeCount: 0,
    neutralCount: 7,
    myVote: "NEUTRAL",
  },
];

export default function VotePage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "TRADING" | "PAY">("ALL");
  const [activeSubTab, setActiveSubTab] = useState<string>("");
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

  const handleTabChange = (tab: "ALL" | "TRADING" | "PAY") => {
    setActiveTab(tab);
    setActiveSubTab("");
  };

  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab);
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

    if (activeTab === "TRADING") {
      filtered = filtered.filter(
        (proposal) => proposal.category === ProposalCategory.TRADE
      );
      if (activeSubTab === "sell") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.SELL
        );
      } else if (activeSubTab === "buy") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.BUY
        );
      } else if (activeSubTab === "deposit") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.DEPOSIT
        );
      }
    } else if (activeTab === "PAY") {
      filtered = filtered.filter(
        (proposal) => proposal.category === ProposalCategory.PAY
      );
      if (activeSubTab === "charge") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.DEPOSIT
        );
      } else if (activeSubTab === "activate") {
        filtered = filtered.filter(
          (proposal) => proposal.action === ProposalAction.ENABLE
        );
      }
    }

    return filtered;
  };

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-500">
            진행중
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-500">
            가결
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-500">부결</Badge>
        );
    }
  };

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case "OPEN":
        return "border-l-blue-500";
      case "APPROVED":
        return "border-l-green-500";
      case "REJECTED":
        return "border-l-red-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange("ALL")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "ALL"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            전체
          </button>
          <button
            onClick={() => handleTabChange("TRADING")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "TRADING"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            매매
          </button>
          <button
            onClick={() => handleTabChange("PAY")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "PAY"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            페이
          </button>
        </div>
      </div>

      {activeTab === "TRADING" && (
        <div className="bg-white border-b px-4 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => handleSubTabChange("sell")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeSubTab === "sell"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              매도
            </button>
            <button
              onClick={() => handleSubTabChange("buy")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeSubTab === "buy"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              매수
            </button>
            <button
              onClick={() => handleSubTabChange("deposit")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeSubTab === "deposit"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              예수금
            </button>
          </div>
        </div>
      )}

      {activeTab === "PAY" && (
        <div className="bg-white border-b px-4 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => handleSubTabChange("charge")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeSubTab === "charge"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              충전
            </button>
            <button
              onClick={() => handleSubTabChange("activate")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeSubTab === "activate"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              활성화
            </button>
          </div>
        </div>
      )}

      {/* Proposal List */}
      <div className="p-4 space-y-3">
        {getFilteredProposals().map((proposal) => (
          <Card
            key={proposal.proposalName}
            className={cn(
              "border-l-4",
              getStatusColor(proposal.status),
              proposal.status !== "OPEN" ? "bg-gray-100" : "bg-white"
            )}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusBadge(proposal.status)}
                  <span className="text-sm font-medium">
                    {proposal.proposalName}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{proposal.date}</span>
              </div>

              {/* Show full content for ongoing proposals, collapsed for completed proposals */}
              {proposal.status === "OPEN" ||
              expandedProposals.has(proposal.proposalName) ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    {proposal.payload.reason}
                  </p>

                  {proposal.status === "OPEN" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleVote(proposal.proposalName, "AGREE")
                        }
                        className="flex items-center gap-1 px-3 py-1 text-sm border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        찬성
                      </button>
                      <button
                        onClick={() =>
                          handleVote(proposal.proposalName, "DISAGREE")
                        }
                        className="flex items-center gap-1 px-3 py-1 text-sm border border-red-500 text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        반대
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {proposal.agreeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3" />
                      {proposal.disagreeCount}
                    </span>
                    <span>💬 {proposal.neutralCount}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => toggleExpanded(proposal.proposalName)}
                  className="flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                >
                  자세히 보기
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <VoteModal
        isOpen={voteModal.isOpen}
        onClose={() => setVoteModal({ ...voteModal, isOpen: false })}
        voteType={voteModal.voteType === "AGREE" ? "approve" : "reject"}
        onConfirm={() => {
          // Handle vote confirmation
          console.log(
            `Vote ${voteModal.voteType} for ${voteModal.proposalName}`
          );
          setVoteModal({ ...voteModal, isOpen: false });
        }}
      />
    </div>
  );
}
