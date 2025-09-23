"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_TABS } from "../../constants/bottomBarTabs";
import { isActivePath } from "../../utils/route";

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <nav
      className="h-[var(--tabbar-h)] border-t border-stone-200 bg-white
                    flex items-center justify-around gap-2
                    pb-[max(env(safe-area-inset-bottom),8px)]"
    >
      {BOTTOM_TABS.map(({ href, label, Icon, match }) => {
        // 현재 경로와 비교해 활성화 여부 판단
        const active = isActivePath(pathname, href, match);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`text-xs px-3 py-2 rounded-lg flex flex-col items-center gap-1
                        ${
                          active
                            ? "text-stone-900 bg-stone-100"
                            : "text-stone-500 hover:bg-stone-50"
                        }`}
          >
            <Icon
              size={18}
              className={active ? "stroke-stone-900" : "stroke-stone-500"}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
