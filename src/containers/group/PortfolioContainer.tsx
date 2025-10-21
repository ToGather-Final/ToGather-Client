"use client";

import { useState, useEffect, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pencil } from "lucide-react";
import SetGoalModal from "@/components/group/goal/SetGoalModal";
import GoalCompleteModal from "@/components/group/goal/GoalCompleteModal";
import DepositProposalModal from "@/components/group/deposit/DepositProposalModal";
import { useGroupId } from "@/contexts/groupIdContext";
import CelebrateContainer from "@/containers/group/CelebrateContainer";
import { baseUrl } from "@/constants/baseUrl";
import useSWR from "swr";
import { getPortfolioSummary } from "@/services/group/portfolio";
import { getGroupInfo, updateGoalAmount } from "@/services/group/group";

// utils/format.ts
export const currency = new Intl.NumberFormat("ko-KR");

// types
export type Holding = {
  symbol: string; // 종목코드
  name: string; // 종목명
  qty: number; // 보유 수량(주)
  avgPrice: number; // 평균단가
  currentPrice: number; // 현재가
  evalAmount: number; // 평가금액 = currentPrice * qty
  purchaseAmount: number; // 매입금액 = avgPrice * qty
  pnlAmount: number; // 평가손익 = evalAmount - purchaseAmount
  pnlRate: number; // 평가손익률 (소수, 0.071 = 7.1%)
  weight: number; // 포트폴리오 비중 (소수)
};

export type Portfolio = {
  goal: number; // 목표 금액
  netAssets: number; // 전체 순자산 = valuation + cash
  valuation: number; // 보유상품 평가금액(총합)
  cash: number; // 예수금(현금)
  totalPnlAmount: number; // 총 평가손익
  totalPnlRate: number; // 총 평가손익률 (소수)
  holdings: Holding[];
};

// 도넛 차트에 필요한 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PortfolioContainer() {
  const { groupId, setGroupId } = useGroupId();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const {
    data: groupPortfolioData,
    error: groupProtfolioError,
    isLoading: groupPortfolioIsLoading,
  } = useSWR(
    groupId ? `${baseUrl}/trading/portfolio/summary?groupId=${groupId}` : null,
    getPortfolioSummary
  );

  const {
    data: groupData,
    error: groupError,
    isLoading: groupIsLoading,
    mutate: mutateGroupData,
  } = useSWR(groupId ? `${baseUrl}/groups/${groupId}` : null, getGroupInfo);

  console.log("groupId", groupId);

  const [goalAmount, setGoalAmount] = useState<number>(0);

  // groupData가 로드되면 goalAmount 설정
  useEffect(() => {
    if (groupData?.goalAmount) {
      setGoalAmount(groupData.goalAmount);
    }
  }, [groupData]);

  // API 데이터를 Portfolio 형식으로 변환
  const portfolio: Portfolio | null = useMemo(() => {
    if (!groupPortfolioData?.data || !groupData) {
      console.log("포트폴리오 데이터 없음");
      return null;
    }

    console.log("=== API 데이터 변환 시작 ===");
    console.log("groupPortfolioData:", groupPortfolioData);
    console.log("groupData:", groupData);

    const apiData = groupPortfolioData.data;
    const totalValue = apiData.totalValue; // valuation

    // topHoldings를 Holding 타입으로 변환
    const holdings: Holding[] = apiData.topHoldings.map((holding) => {
      const purchaseAmount = holding.avgCost * holding.quantity;
      const weight = totalValue > 0 ? holding.evaluatedPrice / totalValue : 0;

      return {
        symbol: holding.stockCode,
        name: holding.stockName,
        qty: holding.quantity,
        avgPrice: holding.avgCost,
        currentPrice: holding.currentPrice,
        evalAmount: holding.evaluatedPrice,
        purchaseAmount: purchaseAmount,
        pnlAmount: holding.profit,
        pnlRate: holding.profitRate / 100, // 퍼센트 → 소수로 변환
        weight: weight,
      };
    });

    const convertedPortfolio = {
      goal: groupData.goalAmount,
      netAssets: apiData.totalValue + apiData.totalCashBalance,
      valuation: apiData.totalValue,
      cash: apiData.totalCashBalance,
      totalPnlAmount: apiData.totalProfit,
      totalPnlRate: apiData.totalProfitRate / 100, // 퍼센트 → 소수로 변환
      holdings: holdings,
    };

    // console.log("변환된 포트폴리오:", convertedPortfolio);
    console.log("=== API 데이터 변환 완료 ===");

    return convertedPortfolio;
  }, [groupPortfolioData, groupData]);

  // 차트 데이터 동적 생성
  const chartData = useMemo(() => {
    if (!portfolio) {
      return {
        labels: [],
        datasets: [
          {
            label: "평가금액",
            data: [],
            backgroundColor: [],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      };
    }

    // 평가금액 기준으로 내림차순 정렬
    const sortedHoldings = [...portfolio.holdings].sort((a, b) => b.evalAmount - a.evalAmount);
    
    // 상위 5개와 나머지 분리
    const topHoldings = sortedHoldings.slice(0, 5);
    const otherHoldings = sortedHoldings.slice(5);
    
    // 라벨과 데이터 구성
    const labels = topHoldings.map((h) => h.name);
    const data = topHoldings.map((h) => h.evalAmount);
    
    // 나머지 종목이 있으면 "기타" 추가
    if (otherHoldings.length > 0) {
      const otherTotalAmount = otherHoldings.reduce((sum, h) => sum + h.evalAmount, 0);
      labels.push("기타");
      data.push(otherTotalAmount);
    }
    
    // 색상 배열 (상위 5개 + 기타용 회색)
    const colors = [
      "rgb(255, 99, 132)",   // 빨강
      "rgb(54, 162, 235)",   // 파랑
      "rgb(255, 205, 86)",   // 노랑
      "rgb(255, 159, 64)",   // 주황
      "rgb(153, 102, 255)",  // 보라
      "rgb(128, 128, 128)",  // 회색 (기타용)
    ];

    return {
      labels,
      datasets: [
        {
          label: "평가금액",
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }, [portfolio]);

  // 차트 옵션
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom" as const,
          align: "center" as const,
          labels: {
            usePointStyle: true,
            pointStyle: "circle" as const,
            padding: 16,
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              if (!portfolio) return "";
              const v = ctx.parsed ?? 0;
              const isOther = ctx.label === "기타";
              
              if (isOther) {
                // 기타 항목의 경우 전체 비중 계산
                const totalValuation = portfolio.holdings.reduce((sum, h) => sum + h.evalAmount, 0);
                const otherWeight = totalValuation > 0 ? v / totalValuation : 0;
                return `평가금액: ${currency.format(v)}원 (${(otherWeight * 100).toFixed(1)}%)`;
              } else {
                // 개별 종목의 경우
                const sortedHoldings = [...portfolio.holdings].sort((a, b) => b.evalAmount - a.evalAmount);
                const topHoldings = sortedHoldings.slice(0, 5);
                const holding = topHoldings[ctx.dataIndex];
                const weight = holding ? holding.weight : 0;
                return `평가금액: ${currency.format(v)}원 (${(weight * 100).toFixed(1)}%)`;
              }
            },
          },
        },
      },
      layout: { padding: { bottom: 8 } },
    };
  }, [portfolio]);

  // 목표 달성률 계산 (최대 100%)
  const goalAchievementRate = Math.min(
    portfolio && portfolio.goal > 0
      ? (portfolio.netAssets / portfolio.goal) * 100
      : 0,
    100
  );
  const progressBarWidth = `${goalAchievementRate}%`;

  const handlePencilClick = () => {
    setIsGoalModalOpen(true);
  };

  const handleGoalComplete = async (amount: number) => {
    console.log("목표 금액 설정:", amount);

    if (!groupId) {
      console.error("그룹 ID가 없습니다.");
      return;
    }

    try {
      // API 호출
      await updateGoalAmount(groupId, amount);
      console.log("목표 금액 설정 API 호출 성공");

      // 로컬 상태 업데이트
      setGoalAmount(amount);

      // SWR 캐시 갱신 - 그룹 데이터를 다시 가져옵니다
      await mutateGroupData();
      console.log("그룹 데이터 갱신 완료");

      // 완료 모달 표시
      setIsCompleteModalOpen(true);
    } catch (error: any) {
      console.error("목표 금액 설정 실패:", error);
      // API에서 반환한 에러 메시지를 표시
      const errorMessage =
        error?.message || "목표 금액 설정에 실패했습니다. 다시 시도해주세요.";
      alert(errorMessage);
    }
  };

  const handleDepositClick = () => {
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = (data: {
    amount: number;
    dueDate: string;
    reason: string;
  }) => {
    console.log("예수금 제안 완료:", data);
    // API 호출은 DepositProposalModal에서 처리됨
  };

  // 로딩 중일 때 (포트폴리오 데이터가 없으면 로딩 중으로 처리)
  if (groupPortfolioIsLoading || groupIsLoading || !portfolio) {
    return (
      <div className="flex items-center justify-center  h-64 ">
        <div className="text-center">
          <div className="text-gray-500 ">
            포트폴리오 데이터를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 에러가 발생했을 때
  if (groupProtfolioError || groupError) {
    return (
      <div className="flex items-center justify-center h-64 ">
        <div className="text-center text-red-600">
          <div className="font-bold">데이터를 불러오는데 실패했습니다.</div>
          <div className="mt-2">
            {groupProtfolioError?.message || groupError?.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="border border-[#e9e9e9] m-[15px] p-[20px] rounded-[20px]">
          <div className="flex justify-between">
            <div className="flex items-center">
              <h1 className="font-bold text-[18px]">목표 달성률</h1>
              <Pencil
                className="text-[#686868] h-[15px] cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handlePencilClick}
              />
            </div>
            <button
              className="bg-primary text-white rounded-[10px] px-4 py-2 text-[12px] hover:bg-blue-700 transition-colors"
              onClick={handleDepositClick}
            >
              예수금 제안
            </button>
          </div>
          <div className="flex gap-[15px] items-center pt-[15px] justify-center">
            <div className="w-full">
              <div className="relative h-[15px] w-full bg-blue-100 rounded-full">
                <div
                  className="absolute h-[15px] bg-primary rounded-full transition-all duration-300"
                  style={{ width: progressBarWidth }}
                ></div>
              </div>
            </div>
            <div className="text-[16px] font-bold">
              {goalAchievementRate.toFixed(1)}%
            </div>
          </div>
          <div className="flex justify-between text-[12px] text-gray-500 mt-2">
            <span>현재: {currency.format(portfolio.netAssets)}원</span>
            <span>목표: {currency.format(portfolio.goal)}원</span>
          </div>
        </div>
        <div className="border border-[#e9e9e9] m-[15px] p-[20px] rounded-[20px]">
          <h1 className="font-bold text-[18px]">전체 순자산</h1>
          <div className="flex flex-col items-end">
            <p className="text-[22px]">
              {currency.format(portfolio.netAssets)}원
            </p>
          </div>
          <div className="border-t border-[#e9e9e9] my-3"></div>

          <div>
            <div className="flex justify-between ">
              <div>평가손익</div>
              <div
                className={
                  portfolio.totalPnlAmount >= 0
                    ? "text-red-600"
                    : "text-blue-600"
                }
              >
                {portfolio.totalPnlAmount >= 0 ? "+" : ""}
                {currency.format(portfolio.totalPnlAmount)}원
              </div>
            </div>
            <div className="flex justify-between">
              <div>평가손익률</div>
              <div
                className={
                  portfolio.totalPnlRate >= 0 ? "text-red-600" : "text-blue-600"
                }
              >
                {portfolio.totalPnlRate >= 0 ? "+" : ""}
                {(portfolio.totalPnlRate * 100).toFixed(2)}%
              </div>
            </div>
            <div className="border-t border-[#e9e9e9] my-3"></div>

            <div className="flex justify-between">
              <div>보유상품 평가금액</div>
              <div>{currency.format(portfolio.valuation)}원</div>
            </div>
            <div className="flex justify-between">
              <div>예수금(원화)</div>
              <div>{currency.format(portfolio.cash)}원</div>
            </div>
          </div>
        </div>
        <div className="border border-[#e9e9e9] m-[15px] p-[20px] rounded-[20px]">
          <h1 className="font-bold text-[18px]">포트폴리오</h1>
          {portfolio.holdings.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-500 text-center">
                매매 제안으로 포트폴리오를 구성해주세요.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center">
                <p className="font-bold text-[30px] mt-[15px]">
                  {currency.format(portfolio.valuation)}원
                </p>
                <div
                  className={`flex justify-center gap-[7px] ${
                    portfolio.totalPnlAmount >= 0
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  <p>
                    {portfolio.totalPnlAmount >= 0 ? "+" : ""}
                    {currency.format(portfolio.totalPnlAmount)}
                  </p>
                  <p>
                    ({portfolio.totalPnlAmount >= 0 ? "+" : ""}
                    {(portfolio.totalPnlRate * 100).toFixed(2)}%)
                  </p>
                </div>
                <div className="h-60 mt-[10px]">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-[7px]">
                  <h2 className="font-bold">보유 종목</h2>
                  <div className="text-[#686868]">
                    총 {portfolio.holdings.length}건
                  </div>
                </div>
                {portfolio.holdings.map((holding, index) => (
                  <div
                    key={holding.symbol}
                    className="border border-[#e9e9e9] p-[15px] rounded-[20px] mb-3"
                  >
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <div className="flex gap-[7px] items-center">
                          <div className="font-bold text-[16px]">
                            {holding.name}
                          </div>
                          <div className="text-[12px]">
                            ({(holding.weight * 100).toFixed(1)}%)
                          </div>
                        </div>
                        <div className="text-[12px]">{holding.qty}주</div>
                      </div>
                      <div
                        className={`flex flex-col items-end ${
                          holding.pnlAmount >= 0
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        <div className="font-bold">
                          {holding.pnlAmount >= 0 ? "+" : ""}
                          {currency.format(holding.pnlAmount)}원
                        </div>
                        <div>
                          {holding.pnlAmount >= 0 ? "+" : ""}
                          {(holding.pnlRate * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-[#e9e9e9] my-3"></div>
                    <div className="grid grid-cols-2">
                      <div className="flex flex-col gap-[20px]">
                        <div>
                          <div className="text-[#686868]">평가금액</div>
                          <div className="font-bold">
                            {currency.format(holding.evalAmount)}원
                          </div>
                        </div>
                        <div>
                          <div className="text-[#686868]">현재가</div>
                          <div className="font-bold">
                            {currency.format(holding.currentPrice)}원
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-[20px]">
                        <div>
                          <div className="text-[#686868]">매입금액</div>
                          <div className="font-bold">
                            {currency.format(holding.purchaseAmount)}원
                          </div>
                        </div>
                        <div>
                          <div className="text-[#686868]">평균단가</div>
                          <div className="font-bold">
                            {currency.format(holding.avgPrice)}원
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Todo 목표 달성률 100% 이상일 때 해당 팝업 완료하면 더이상 창 띄우지 않기 */}
      {goalAmount > 0 && portfolio.netAssets >= goalAmount ? (
        <CelebrateContainer />
      ) : null}

      {/* 목표 금액 설정 모달 */}
      <SetGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onComplete={handleGoalComplete}
        initialAmount={goalAmount}
      />

      {/* 목표 금액 설정 완료 모달 */}
      <GoalCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        goalAmount={goalAmount}
      />

      {/* 예수금 제안 모달 */}
      <DepositProposalModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSubmit={handleDepositSubmit}
      />
    </div>
  );
}
