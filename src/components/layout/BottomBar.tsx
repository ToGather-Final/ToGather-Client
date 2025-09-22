"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  TrendingUp,
  SquareCheckBig,
  History as HistoryIcon,
} from "lucide-react";

const tabs = [
  { href: "/group", label: "모임", Icon: Users },
  { href: "/stock", label: "주식", Icon: TrendingUp },
  { href: "/vote", label: "투표", Icon: SquareCheckBig },
  { href: "/history", label: "히스토리", Icon: HistoryIcon },
];

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  // 정확한 경계 체크: /stock, /stock/..., (탭에 들어가서 또 다른 페이지로 이동할 때를 대비)
  return pathname === href || pathname.startsWith(href + "/");
};

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <nav className="h-[var(--tabbar-h)] border-t border-stone-200 bg-white flex items-center justify-around gap-2 pb-[max(env(safe-area-inset-bottom),8px)]">
      {tabs.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`text-xs px-3 py-2 rounded-lg flex flex-col items-center gap-1
              ${
                active
                  ? "text-stone-900 bg-stone-100"
                  : "text-stone-500 hover:bg-stone-50"
              }`}
            aria-current={active ? "page" : undefined}
            aria-label={label}
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
