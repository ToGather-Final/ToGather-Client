"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const payActive = pathname === "/pay" || pathname.startsWith("/pay/");

  return (
    <header
      className="h-[var(--header-h)] sticky top-0 z-10
                 bg-white border-b border-stone-200
                 flex items-center gap-3 px-4"
    >
      <Image src="/logo.png" alt="logo" width={35} height={35} />

      <Link
        href="/pay"
        aria-label="페이"
        className={`ml-auto inline-flex items-center justify-center
                    size-9 rounded-lg transition
                    ${
                      payActive
                        ? "bg-stone-100 text-stone-900"
                        : "text-stone-500 hover:bg-stone-50"
                    }`}
      >
        <CreditCard size={25} className="stroke-current" />
      </Link>
    </header>
  );
}
