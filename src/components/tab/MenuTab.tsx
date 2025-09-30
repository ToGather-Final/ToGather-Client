"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface MenuTabProps {
  tabs: Tab[];
  defaultTab: string;
}

export default function MenuTab({ tabs, defaultTab }: MenuTabProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  //아래와 같은 매개변수로 보내줘야 함
  // const tabs = [
  //   { id: "보유주식", label: "보유주식" },
  //   { id: "국내주식", label: "국내주식" },
  //   { id: "해외주식", label: "해외주식" }
  // ];

  return (
    <div className="flex items-center justify-around">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
              px-6 py-2 text-[14px] font-medium rounded-[15px] transition-all duration-200 ease-in-out
              ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }
            `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
