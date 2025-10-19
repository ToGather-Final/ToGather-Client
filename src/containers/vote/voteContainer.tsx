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
import { getAuthHeaders, getRefreshToken, saveTokens, clearTokens } from "@/utils/token";
import { getDeviceId } from "@/utils/deviceId";
import { API_GATEWAY_URL, API_ENDPOINTS } from "@/utils/api/config";

// 토큰 자동 갱신 함수
async function refreshTokenIfNeeded(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  const deviceId = getDeviceId()
  
  if (!refreshToken || !deviceId) {
    console.log('Refresh token or device ID not found')
    return false
  }
  
  try {
    console.log('Attempting to refresh token...')
    const response = await fetch(`${API_GATEWAY_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshToken,
        'X-Device-Id': deviceId,
      },
    })
    
    if (!response.ok) {
      console.log('Token refresh failed:', response.status)
      return false
    }
    
    const newTokens = await response.json()
    console.log('Token refreshed successfully')
    
    // 새로운 토큰 저장
    saveTokens(newTokens.accessToken, newTokens.refreshToken, newTokens.userId)
    return true
  } catch (error) {
    console.error('Token refresh error:', error)
    return false
  }
}

// Vote Service API 호출 함수
async function fetchProposals(): Promise<ProposalDTO[]> {
  const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL
  
  try {
    const response = await fetch(`${API_GATEWAY_URL}/vote`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(), // Authorization 헤더 자동 추가
      },
    })

    // 401 에러 시 토큰 갱신 시도
    if (response.status === 401) {
      console.log('401 Unauthorized - attempting token refresh...')
      const refreshSuccess = await refreshTokenIfNeeded()
      
      if (refreshSuccess) {
        // 토큰 갱신 성공 시 재시도
        console.log('Retrying with refreshed token...')
        const retryResponse = await fetch(`${API_GATEWAY_URL}/vote`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        })
        
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`)
        }
        
        const retryData = await retryResponse.json()
        console.log('Fetched proposals after refresh:', retryData)
        
        // API 응답을 ProposalDTO 형식으로 변환
        return retryData.map((item: any) => ({
          proposalId: item.proposalId,
          proposalName: item.proposalName,
          proposerName: item.proposerName,
          category: item.category as ProposalCategory,
          action: item.action as ProposalAction,
          payload: typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload,
          status: item.status as ProposalStatus,
          createdAt: new Date(item.createdAt),
          expiresAt: new Date(item.expiresAt),
          agreeCount: item.agreeCount || 0,
          disagreeCount: item.disagreeCount || 0,
          userVote: item.userVote || null,
        }))
      } else {
        throw new Error('Token refresh failed')
      }
    }

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
      closeAt: item.closeAt, // API에서는 closeAt 필드 사용
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
        // 에러 발생 시 빈 배열 사용
        setProposals([]);
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

  // 투표 API 호출 함수
  const submitVote = async (proposalId: string, voteType: "AGREE" | "DISAGREE") => {
    const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL
    
    try {
      const response = await fetch(`${API_GATEWAY_URL}/vote/${proposalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), // Authorization 헤더 자동 추가
        },
        body: JSON.stringify({
          choice: voteType
        }),
      });

      // 401 에러 시 토큰 갱신 시도
      if (response.status === 401) {
        console.log('401 Unauthorized - attempting token refresh...')
        const refreshSuccess = await refreshTokenIfNeeded()
        
        if (refreshSuccess) {
          // 토큰 갱신 성공 시 재시도
          console.log('Retrying vote with refreshed token...')
          const retryResponse = await fetch(`${API_GATEWAY_URL}/vote/${proposalId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({
              choice: voteType
            }),
          })
          
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`)
          }
          
          console.log('Vote submitted successfully after refresh')
          
          // 투표 성공 후 데이터 새로고침
          const updatedProposals = await fetchProposals()
          setProposals(updatedProposals)
          return
        } else {
          throw new Error('Token refresh failed')
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Vote submitted successfully');
      
      // 투표 성공 후 데이터 새로고침
      const updatedProposals = await fetchProposals();
      setProposals(updatedProposals);
      
    } catch (error) {
      console.error('Failed to submit vote:', error);
      // 에러 처리 (사용자에게 알림 등)
    }
  };

  // 모달 열고 어떤 선택인지 기록
  const handleVote = (proposalName: string, proposalId: string, voteType: "AGREE" | "DISAGREE") => {
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

    // 2) 드롭다운 필터 (전체 탭에서만 적용)
    if (activeTab === "ALL") {
      if (tradeDropdown === "매수") {
        filtered = filtered.filter(
          (proposal) => proposal.category === ProposalCategory.TRADE && proposal.action === ProposalAction.BUY
        );
      } else if (tradeDropdown === "매도") {
        filtered = filtered.filter(
          (proposal) => proposal.category === ProposalCategory.TRADE && proposal.action === ProposalAction.SELL
        );
      } else if (tradeDropdown === "예수금 충전") {
        filtered = filtered.filter(
          (proposal) => proposal.category === ProposalCategory.TRADE && proposal.action === ProposalAction.DEPOSIT
        );
      }
      // "전체"일 때는 모든 제안을 표시 (이미 위에서 처리됨)
    } else if (activeTab === "TRADE") {
      // 매매 탭에서의 세부 필터
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

      {activeTab === "ALL" && (
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
                      <span className="text-blue-600 font-bold">
                        {proposal.closeAt && proposal.closeAt.includes('시') && proposal.closeAt.includes('분') 
                          ? proposal.closeAt.match(/\d+시 \d+분/)?.[0] || proposal.closeAt // "15시 39분" 패턴 추출
                          : proposal.closeAt || '시간 미정'
                        }
                      </span>
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
                      onClick={() => handleVote(proposal.proposalName, proposal.proposalId, "AGREE")}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#2563EB] text-white rounded hover:bg-[#1D4ED8] transition-colors"
                    >
                      찬성 {proposal.agreeCount}
                    </button>
                    <button
                      onClick={() =>
                        handleVote(proposal.proposalName, proposal.proposalId, "DISAGREE")
                      }
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#F85449] text-white rounded hover:bg-[#E53E3E] transition-colors"
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
          </Card>
        )))}
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
