"use client";

import { useStockTab } from "@/contexts/stockTabContext";
import { useEffect } from "react";

interface Tab {
  id: string;
  label: string;
}

interface MenuTabProps {
  tabs: Tab[];
  defaultTab: string;
  children: React.ReactNode;
}

export default function MenuTab({ tabs, defaultTab, children }: MenuTabProps) {
  const { stockTab, setStockTab } = useStockTab();
  useEffect(() => {
    setStockTab(defaultTab);
  }, []);
  return (
    <div>
      <div className="sticky top-0 bg-white flex items-center justify-center px-4 py-3 w-full gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStockTab(tab.id)}
            className={`
              flex-1 px-6 py-3 text-sm font-medium rounded-xl transition-colors
              ${
                stockTab === tab.id
                  ? "bg-[#447AFA] text-white"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
