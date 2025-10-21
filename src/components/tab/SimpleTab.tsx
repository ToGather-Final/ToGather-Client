"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface SimpleTabProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function SimpleTab({
  tabs,
  defaultTab,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
}: SimpleTabProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id || ""
  );

  // 외부에서 activeTab을 제어하는 경우 외부 값을 사용, 그렇지 않으면 내부 상태 사용
  const activeTab =
    externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalSetActiveTab || setInternalActiveTab;

  return (
    <div className="flex space-x-8 border-b border-gray-200 mt-[5px]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
                pb-3 px-1 text-sm font-medium transition-colors duration-200 relative
                ${
                  activeTab === tab.id
                    ? "text-black"
                    : "text-gray-400 hover:text-gray-600"
                }
              `}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );
}
