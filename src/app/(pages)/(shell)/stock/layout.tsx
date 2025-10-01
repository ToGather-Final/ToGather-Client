import MenuTab from "@/components/tab/MenuTab";

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const uptabs = [
    { id: "보유주식", label: "보유주식" },
    { id: "국내주식", label: "국내주식" },
    { id: "해외주식", label: "해외주식" },
  ];
  return (
    <MenuTab tabs={uptabs} defaultTab="국내주식">
      {children}
    </MenuTab>
  );
}
