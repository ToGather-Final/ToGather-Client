"use client";

import { usePayTab } from "@/contexts/payTabContext";

interface Tab {
  id: string;
  label: string;
}

interface MenuTabProps {
  tabs: Tab[];
  children: React.ReactNode;
}

export default function PayMenuTab({ tabs, children }: MenuTabProps) {
  const { payTab, setPayTab } = usePayTab();

  return (
    <div>
      <div
        className={`sticky top-0 z-5 bg-white flex items-center justify-center px-4 py-3 w-full gap-2`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPayTab(tab.id)}
            className={`
              flex-1 px-6 py-3 text-sm font-medium rounded-xl transition-colors
              ${
                payTab === tab.id
                  ? "bg-[#447AFA] text-white"
                  : "text-[#686868] bg-white hover:bg-gray-200"
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
