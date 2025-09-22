"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import BottomBar from "./BottomBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // 화면 전체: 가운데에 모바일 프레임을 놓고, safe-area 패딩을 준다
    <div className="min-h-dvh flex justify-center bg-stone-50 p-safe">
      {/* 모바일 프레임 박스 */}
      <div
        className="w-full max-w-[var(--app-max-w)] bg-white border border-stone-200
                   rounded-2xl shadow-sm flex flex-col overflow-hidden"
      >
        <Header />
        {/* 본문만 스크롤 */}
        <main className="flex-1 overflow-y-auto">{children}</main>
        <BottomBar />
      </div>
    </div>
  );
}
