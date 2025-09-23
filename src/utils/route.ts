import type { MatchMode } from "../types/view/navigation";

// 경로 활성화 판정 (탭 공통 사용 가능)
export const isActivePath = (
  pathname: string,
  href: string,
  match: MatchMode = "prefix"
) => {
  // 후행 슬래시 정규화 ("/stock/" -> "/stock")
  const norm = (s: string) => s.replace(/\/+$/, "");

  const p = norm(pathname);
  const h = norm(href);

  if (h === "/") return p === "/";

  if (match === "exact") return p === h;

  // prefix: 세그먼트 경계까지 고려 ("/stock" 또는 "/stock/...")
  return p === h || p.startsWith(h + "/");
};
