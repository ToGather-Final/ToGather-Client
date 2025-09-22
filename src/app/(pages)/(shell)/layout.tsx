import AppShell from "../../../components/layout/AppShell";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // AppShell 안에 Header/BottomBar 들어있음
  return <AppShell>{children}</AppShell>;
}
