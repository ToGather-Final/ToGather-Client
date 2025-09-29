import { useState } from "react";


type Period = "일" | "주" | "월" | "년";

export default function PeriodSelector({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  
  const periods: Period[] = ["일", "주", "월", "년"];

  return (
    <div className="flex justify-start">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`
            px-2 py-2 border font-medium transition-colors duration-200 text-[10px]
            ${value === period 
              ? "bg-white text-black border-black" 
              : "bg-white text-gray-500 border-gray-300 hover:text-black hover:border-black"
            }
          `}
        >
          {period}
        </button>
      ))}
    </div>
  );
}
