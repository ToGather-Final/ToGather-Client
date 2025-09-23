// src/constants/bottomBarTabs.ts
import { BottomTab } from "@/types/view/navigation";
import {
  Users,
  TrendingUp,
  SquareCheckBig,
  History as HistoryIcon,
} from "lucide-react";

export const BOTTOM_TABS: BottomTab[] = [
  { href: "/group", label: "모임", Icon: Users, match: "prefix" },
  { href: "/stock", label: "주식", Icon: TrendingUp, match: "prefix" },
  { href: "/vote", label: "투표", Icon: SquareCheckBig, match: "prefix" },
  { href: "/history", label: "히스토리", Icon: HistoryIcon, match: "prefix" },
];
