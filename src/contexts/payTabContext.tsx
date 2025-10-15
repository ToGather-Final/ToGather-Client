"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface PayTabCtx {
  payTab: string;
  setPayTab: (t: string) => void;
}

const PayTabContext = createContext<PayTabCtx | undefined>(undefined);

export function PayTabProvider({ children }: { children: ReactNode }) {
  const [payTab, setPayTab] = useState("BARCODE");
  return (
    <PayTabContext.Provider value={{ payTab, setPayTab }}>
      {children}
    </PayTabContext.Provider>
  );
}

export function usePayTab() {
  const ctx = useContext(PayTabContext);
  if (!ctx) throw new Error("usePayTab must be used within <PayTabProvider>");
  return ctx;
}
