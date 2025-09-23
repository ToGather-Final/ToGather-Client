import React from "react";

export type MatchMode = "prefix" | "exact";

export type BottomTab = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  match?: MatchMode; // 기본은 prefix로 사용할 예정
};
