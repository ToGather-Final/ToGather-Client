"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_TABS } from "../../constants/bottomBarTabs";
import { isActivePath } from "../../utils/route";
import { useNotification } from "@/hooks/useNotification";

export default function BottomBar() {
  const pathname = usePathname();
  const { notificationCount, clearNotification } = useNotification();

  return (
    <nav
      className="h-[var(--tabbar-h)] border-t border-stone-200 bg-white
                    flex items-center justify-around gap-2
                    pb-[max(env(safe-area-inset-bottom),8px)]"
    >
      {BOTTOM_TABS.map(({ href, label, Icon, match }) => {
        // 현재 경로와 비교해 활성화 여부 판단
        const active = isActivePath(pathname, href, match);
        const showNotification = href === "/history" && notificationCount > 0;
        
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`group text-xs px-3 pt-3 rounded-lg flex flex-col items-center gap-1 relative
                        ${
                          active
                            ? "text-[#447AFA]"
                            : "text-stone-500 hover:text-[#447AFA] "
                        }`}
            onClick={() => {
              // 히스토리 탭 클릭 시 알림 카운트 초기화
              if (href === "/history") {
                clearNotification();
              }
            }}
          >
            <div className="relative">
              <Icon
                size={18}
                className={
                  active
                    ? "stroke-[#447AFA]"
                    : "stroke-stone-500 group-hover:stroke-[#447AFA]"
                }
              />
              {/* 🔔 알림 점 표시 (개선된 애니메이션) */}
              {showNotification && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                </div>
              )}
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
