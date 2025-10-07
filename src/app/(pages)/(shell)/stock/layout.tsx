import { StockTabProvider } from "@/contexts/stockTabContext";

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StockTabProvider>{children}</StockTabProvider>;
}
