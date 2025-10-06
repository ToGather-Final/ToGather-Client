"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pencil } from "lucide-react";

// 도넛 차트에 필요한 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      label: "My First Dataset",
      data: [300, 50, 100],
      backgroundColor: [
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
        "rgb(255, 205, 86)",
      ],
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
      position: "bottom", // 👈 아래로
      align: "center",
      labels: {
        usePointStyle: true, // 동그란 점 스타일
        pointStyle: "circle",
        padding: 16,
        boxWidth: 8,
        boxHeight: 8,
      },
    },
    // title: { display: true, text: "포트폴리오" },
  },
  layout: { padding: { bottom: 8 } }, // 차트와 범례 사이 간격(선택)
} as const;

export default function PortfolioContainer() {
  return (
    <>
      <div className="border border-[#e9e9e9] m-[15px] p-[20px] rounded-[20px]">
        <div className="flex justify-between">
          <div className="flex items-center">
            <h1 className="font-bold text-[18px]">목표 달성률</h1>
            <Pencil className="text-[#686868] h-[15px]" />
          </div>
          <button className="bg-blue-600 text-white rounded-[10px] px-4 py-2 text-[12px]">
            예수금 제안
          </button>
        </div>
        <div className="flex gap-[15px] items-center pt-[15px] justify-center">
          <div className="w-full">
            <div className="relative h-[15px] w-full bg-blue-100 rounded-full">
              <div className="absolute h-[15px] w-[90px] bg-blue-600 rounded-full"></div>
            </div>
          </div>
          <div className="text-[16px] font-bold">30%</div>
        </div>
      </div>
      <div className="border border-[#e9e9e9] m-[15px] p-[20px] rounded-[20px]">
        <h1 className="font-bold text-[18px]">전체 순자산</h1>
        <div className="flex flex-col items-end">
          <p className="text-[22px]">200000원</p>
        </div>
        <div className="border-t border-[#e9e9e9] my-3"></div>

        <div>
          <div className="flex justify-between ">
            <div>평가손익</div>
            <div className="text-red-600">+100000원</div>
          </div>
          <div className="flex justify-between">
            <div>평가손익률</div>
            <div className="text-red-600">5.00%</div>
          </div>
          <div className="border-t border-[#e9e9e9] my-3"></div>

          <div className="flex justify-between">
            <div>보유상품 평가금액</div>
            <div>150000원</div>
          </div>
          <div className="flex justify-between">
            <div>예수금(원화)</div>
            <div>50000원</div>
          </div>
        </div>
      </div>
      <div className="border border-[#e9e9e9] m-[15px] p-[20px] rounded-[20px]">
        <h1 className="font-bold text-[18px]">포트폴리오</h1>
        <div className="flex flex-col items-center">
          <p className="font-bold text-[30px] mt-[15px]">12450000원</p>
          <div className="flex justify-center gap-[7px] text-red-600">
            <p>1250000</p>
            <p>(+11.4%)</p>
          </div>
          <div className="h-60 mt-[10px]">
            <Doughnut data={data} options={options} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-[7px]">
            <h2 className="font-bold">보유 종목</h2>
            <div className="text-[#686868]">총 2건</div>
          </div>
          <div className="border border-[#e9e9e9] p-[15px] rounded-[20px]">
            <div className="flex justify-between">
              <div className="flex flex-col">
                <div className="flex gap-[7px] items-center">
                  <div className="font-bold text-[16px]">삼성전자</div>
                  <div className="text-[12px]">(25%)</div>
                </div>
                <div className="text-[12px]">2주</div>
              </div>
              <div className="flex flex-col items-end  text-red-600">
                <div className="font-bold">+100000원</div>
                <div>+5.00%</div>
              </div>
            </div>
            <div className="border-t border-[#e9e9e9] my-3"></div>
            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-[20px]">
                <div>
                  <div className="text-[#686868]">평가금액</div>
                  <div className="font-bold">150000원</div>
                </div>
                <div>
                  <div className="text-[#686868]">현재가</div>
                  <div className="font-bold">50000원</div>
                </div>
              </div>
              <div className="flex flex-col gap-[20px]">
                <div>
                  <div className="text-[#686868]">매입금액</div>
                  <div className="font-bold">50000원</div>
                </div>
                <div>
                  <div className="text-[#686868]">평균단가</div>
                  <div className="font-bold">50000원</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
