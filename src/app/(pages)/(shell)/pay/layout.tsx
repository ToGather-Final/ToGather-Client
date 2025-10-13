import PayMenuTab from "@/components/tab/PayMenuTab";
import { PayTabProvider } from "@/contexts/payTabContext";

export default function PayLayout({ children }: { children: React.ReactNode }) {
  const tabs = [
    { id: "BARCODE", label: "바코드" },
    { id: "QR", label: "QR" },
  ];

  return (
    <PayTabProvider>
      <PayMenuTab tabs={tabs}>{children}</PayMenuTab>
    </PayTabProvider>
  );
}
