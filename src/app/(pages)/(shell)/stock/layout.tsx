import MenuTab from "@/components/tab/MenuTab";
import { StockTabProvider } from "@/contexts/stockTabContext";

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const uptabs = [
    { id: "MY", label: "보유주식" },
    { id: "DOMESTIC", label: "국내주식" },
    { id: "OVERSEAS", label: "해외주식" },
  ];
  return (
    <StockTabProvider>
      <MenuTab tabs={uptabs} defaultTab="MY">
        {children}
      </MenuTab>
    </StockTabProvider>
  );
}
