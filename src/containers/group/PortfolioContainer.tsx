"use client";

import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pencil } from "lucide-react";
import CelebrateContainer from "./CelebrateContainer";
import SetGoalModal from "@/components/group/goal/SetGoalModal";
import GoalCompleteModal from "@/components/group/goal/GoalCompleteModal";
import DepositProposalModal from "@/components/group/deposit/DepositProposalModal";
import DepositCompleteModal from "@/components/group/deposit/DepositCompleteModal";

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

// dummy data
export const dummyPortfolio: Portfolio = {
  goal: 5_000_000, // 목표 금액 500만원
  netAssets: 2_745_000, // 2,745,000 = 2,245,000(평가) + 500,000(현금)
  valuation: 2_245_000,
  cash: 500_000,

  // 총 손익/수익률 (보유상품 기준)
  totalPnlAmount: 45_000, // 2,245,000 - 2,200,000
  totalPnlRate: 0.0205, // ≈ +2.05%

  holdings: [
    {
      symbol: "005930",
      name: "삼성전자",
      qty: 2,
      avgPrice: 700_000,
      currentPrice: 750_000,
      evalAmount: 1_500_000,
      purchaseAmount: 1_400_000,
      pnlAmount: 100_000,
      pnlRate: 0.0714, // +7.14%
      weight: 1_500_000 / 2_245_000, // ≈ 0.668
    },
    {
      symbol: "035420",
      name: "NAVER",
      qty: 1,
      avgPrice: 800_000,
      currentPrice: 745_000,
      evalAmount: 745_000,
      purchaseAmount: 800_000,
      pnlAmount: -55_000,
      pnlRate: -0.0688, // -6.88%
      weight: 745_000 / 2_245_000, // ≈ 0.332
    },
  ],
};

// 도넛 차트에 필요한 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: dummyPortfolio.holdings.map((h) => h.name),
  datasets: [
    {
      label: "평가금액",
      data: dummyPortfolio.holdings.map((h) => h.evalAmount),
      backgroundColor: [
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
        "rgb(255, 205, 86)",
      ],
      borderWidth: 0,
      hoverOffset: 4,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      align: "center",
      labels: {
        usePointStyle: true, // 동그란 점 스타일
        pointStyle: "circle",
        padding: 16,
        boxWidth: 8,
        boxHeight: 8,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          const v = ctx.parsed ?? 0;
          const holding = dummyPortfolio.holdings[ctx.dataIndex];
          const weight = holding ? holding.weight : 0;
          return `평가금액: ${currency.format(v)}원 (${(weight * 100).toFixed(
            1
          )}%)`;
        },
      },
    },
    // title: { display: true, text: "포트폴리오" },
  },
  layout: { padding: { bottom: 8 } }, // 차트와 범례 사이 간격(선택)
} as const;

export default function PortfolioContainer() {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isDepositCompleteModalOpen, setIsDepositCompleteModalOpen] =
    useState(false);
  const [goalAmount, setGoalAmount] = useState(dummyPortfolio.goal);

  // 목표 달성률 계산 (최대 100%)
  const goalAchievementRate = Math.min(
    (dummyPortfolio.netAssets / dummyPortfolio.goal) * 100,
    100
  );
  const progressBarWidth = `${goalAchievementRate}%`;

  const handlePencilClick = () => {
    setIsGoalModalOpen(true);
  };

  const handleGoalComplete = (amount: number) => {
    console.log("목표 금액 설정:", amount);
    setGoalAmount(amount);
    setIsCompleteModalOpen(true);
  };

  const handleDepositClick = () => {
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = (data: {
    amount: number;
    dueDate: string;
    reason: string;
  }) => {
    console.log("예수금 제안:", data);
    setIsDepositCompleteModalOpen(true);
  };

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
              className="bg-blue-600 text-white rounded-[10px] px-4 py-2 text-[12px] hover:bg-blue-700 transition-colors"
              onClick={handleDepositClick}
            >
              예수금 제안
            </button>
          </div>
          <div className="flex gap-[15px] items-center pt-[15px] justify-center">
            <div className="w-full">
              <div className="relative h-[15px] w-full bg-blue-100 rounded-full">
                <div
                  className="absolute h-[15px] bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: progressBarWidth }}
                ></div>
              </div>
            </div>
            <div className="text-[16px] font-bold">
              {goalAchievementRate.toFixed(1)}%
            </div>
          </div>
          <div className="flex justify-between text-[12px] text-gray-500 mt-2">
            <span>현재: {currency.format(dummyPortfolio.netAssets)}원</span>
            <span>목표: {currency.format(dummyPortfolio.goal)}원</span>
          </div>
        </div>
        <div className="border border-[#e9e9e9] m-[15px] p-[20px] rounded-[20px]">
          <h1 className="font-bold text-[18px]">전체 순자산</h1>
          <div className="flex flex-col items-end">
            <p className="text-[22px]">
              {currency.format(dummyPortfolio.netAssets)}원
            </p>
          </div>
          <div className="border-t border-[#e9e9e9] my-3"></div>

          <div>
            <div className="flex justify-between ">
              <div>평가손익</div>
              <div
                className={
                  dummyPortfolio.totalPnlAmount >= 0
                    ? "text-red-600"
                    : "text-blue-600"
                }
              >
                {dummyPortfolio.totalPnlAmount >= 0 ? "+" : ""}
                {currency.format(dummyPortfolio.totalPnlAmount)}원
              </div>
            </div>
            <div className="flex justify-between">
              <div>평가손익률</div>
              <div
                className={
                  dummyPortfolio.totalPnlRate >= 0
                    ? "text-red-600"
                    : "text-blue-600"
                }
              >
                {dummyPortfolio.totalPnlRate >= 0 ? "+" : ""}
                {(dummyPortfolio.totalPnlRate * 100).toFixed(2)}%
              </div>
            </div>
            <div className="border-t border-[#e9e9e9] my-3"></div>

            <div className="flex justify-between">
              <div>보유상품 평가금액</div>
              <div>{currency.format(dummyPortfolio.valuation)}원</div>
            </div>
            <div className="flex justify-between">
              <div>예수금(원화)</div>
              <div>{currency.format(dummyPortfolio.cash)}원</div>
            </div>
          </div>
        </div>
        <div className="border border-[#e9e9e9] m-[15px] p-[20px] rounded-[20px]">
          <h1 className="font-bold text-[18px]">포트폴리오</h1>
          <div className="flex flex-col items-center">
            <p className="font-bold text-[30px] mt-[15px]">
              {currency.format(dummyPortfolio.valuation)}원
            </p>
            <div
              className={`flex justify-center gap-[7px] ${
                dummyPortfolio.totalPnlAmount >= 0
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              <p>
                {dummyPortfolio.totalPnlAmount >= 0 ? "+" : ""}
                {currency.format(dummyPortfolio.totalPnlAmount)}
              </p>
              <p>
                ({dummyPortfolio.totalPnlAmount >= 0 ? "+" : ""}
                {(dummyPortfolio.totalPnlRate * 100).toFixed(2)}%)
              </p>
            </div>
            <div className="h-60 mt-[10px]">
              <Doughnut data={data} options={options} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-[7px]">
              <h2 className="font-bold">보유 종목</h2>
              <div className="text-[#686868]">
                총 {dummyPortfolio.holdings.length}건
              </div>
            </div>
            {dummyPortfolio.holdings.map((holding, index) => (
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
                      holding.pnlAmount >= 0 ? "text-red-600" : "text-blue-600"
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
      </div>
      {/* Todo 목표 달성률 100% 이상일 때 해당 팝업 완료하면 더이상 창 띄우지 않기 */}
      {dummyPortfolio.netAssets >= goalAmount ? <CelebrateContainer /> : null}

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

      {/* 예수금 제안 완료 모달 */}
      <DepositCompleteModal
        isOpen={isDepositCompleteModalOpen}
        onClose={() => setIsDepositCompleteModalOpen(false)}
      />
    </div>
  );
}
