"use client";

import MenuTab from "@/components/tab/MenuTab";
import SimpleTab from "@/components/tab/SimpleTab";
import SimpleTabComponent from "@/components/tab/SimpleTab";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

export default function RealtimeContainer() {
  const uptabs = [
    { id: "보유주식", label: "보유주식" },
    { id: "국내주식", label: "국내주식" },
    { id: "해외주식", label: "해외주식" },
  ];

  const downtabs = [
    { id: "매수", label: "매수" },
    { id: "매도", label: "매도" },
  ];

  const asks = [
    { price: 101.0, size: 0.12 },
    { price: 101.5, size: 0.06 },
    { price: 102.0, size: 0.12 },
    { price: 102.5, size: 0.06 },
    { price: 103.0, size: 0.12 },
    { price: 103.5, size: 0.06 },
    { price: 104.0, size: 0.12 },
    { price: 104.5, size: 0.06 },
    { price: 105.0, size: 0.2 },
    { price: 105.5, size: 0.06 },
    { price: 106.0, size: 0.12 },
    { price: 106.5, size: 0.06 },
    { price: 107.0, size: 0.12 },
    { price: 107.5, size: 0.06 },
    { price: 108.0, size: 0.12 },
    { price: 108.5, size: 0.06 },
    { price: 109.0, size: 0.2 },
  ];

  const [activeTab, setActiveTab] = useState("매수");
  const [currenPrice, setCurrentPrice] = useState(103);
  return (
    <div>
      <div className="flex gap-[10px] items-center justify-start py-2 px-5">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-800 hover:text-black"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
        </button>
        <span className="text-[14px] font-bold">아마존닷컴</span>
      </div>

      <div className="px-8">
        <div className="flex justify-between items-center text-blue-600 font-bold  gap-[10px] text-[10px] py-[10px]">
          <div className="text-[20px]">82,900</div>
          <div>
            <div className="flex items-center">
              <div>▼</div>
              <div>3,200</div>
            </div>
            <div className="text-[14px]">-3.72%</div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center border border-[#e9e9e9] border-[2px] rounded-[10px] py-[5px] px-[5px] ">
          <div>001-12-566789</div>
          <div className="text-[#686868] text-[12px]">[종합매매]가나다</div>
        </div>
        <SimpleTab tabs={downtabs} defaultTab="매수"></SimpleTab>
        <div className="grid grid-cols-2">
          <div className="flex flex-col overflow-y-auto max-h-[55vh]">
            {/* 하 여기서 스크롤되게 해야하는디;;;; */}
            {asks.map((ask) => (
              <button
                key={ask.price}
                className={`px-6 py-2 text-[14px] font-medium w-full flex items-center justify-between ${
                  ask.price >= currenPrice ? "text-red-600" : "text-blue-600"
                }`}
              >
                <span>{ask.price.toFixed(0)}</span>
                <span className="text-gray-500">{ask.size.toFixed(0)}</span>
              </button>
            ))}
          </div>
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mt-6">
                {activeTab === "매수" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        총 매수 금액을 입력해주세요
                      </label>
                      <input
                        type="text"
                        placeholder=""
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        마감 일자
                      </label>
                      <input
                        type="text"
                        placeholder=""
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        매수 제한 이유
                      </label>
                      <input
                        type="text"
                        placeholder=""
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-start items-center border border-[#e9e9e9] border-[2px] rounded-[10px] py-[5px] px-[5px] ">
                      <div className="text-[#686868] text-[12px]">주문금액</div>
                    </div>
                    <button
                      className={
                        "px-6 py-2 text-[14px] font-medium rounded-[10px] ease-in-out bg-red-500 text-white shadow-md w-full"
                      }
                    >
                      매수
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    매도 관련 내용
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
