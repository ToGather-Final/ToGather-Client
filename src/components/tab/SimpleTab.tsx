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

export default function SimpleTab({ tabs, defaultTab }: MenuTabProps) {
  const [activeTab, setActiveTab] = useState("매수");

  return (
    <div className="flex space-x-8 border-b border-gray-200 mt-[15px]">
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
