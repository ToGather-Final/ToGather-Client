"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface StockTabCtx {
  stockTab: string;
  setStockTab: (t: string) => void;
}

const StockTabContext = createContext<StockTabCtx | undefined>(undefined);

export function StockTabProvider({ children }: { children: ReactNode }) {
  const [stockTab, setStockTab] = useState("My");
  return (
    <StockTabContext.Provider value={{ stockTab, setStockTab }}>
      {children}
    </StockTabContext.Provider>
  );
}

export function useStockTab() {
  const ctx = useContext(StockTabContext);
  if (!ctx)
    throw new Error("useStockTab must be used within <StockTabProvider>");
  return ctx;
}
