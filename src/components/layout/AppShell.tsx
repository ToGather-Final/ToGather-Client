"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import BottomBar from "./BottomBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // 화면 전체를 고정: 바깥은 스크롤 안 됨
    <div className="fixed inset-0 flex justify-center bg-stone-50 p-safe overflow-hidden">
      {/* 모바일 프레임: 뷰포트 높이에 딱 맞춤 */}
      <div
        className="
          flex h-dvh w-full max-w-[var(--app-max-w)] flex-col
          overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm
        "
      >
        {/* (선택) 상단 고정하고 싶으면 sticky */}
        <div className="sticky top-0 z-10 bg-white">
          <Header />
        </div>

        {/* 본문만 스크롤 */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div>
            {children}
          </div>
        </main>

        {/* (선택) 하단을 더 확실히 고정하고 싶으면 sticky */}
        <div className="sticky bottom-0 z-10 bg-white">
          <BottomBar />
        </div>
      </div>
    </div>
  );
}
