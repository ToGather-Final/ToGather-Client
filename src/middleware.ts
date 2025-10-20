// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // TODO: 인증 가드/리다이렉트 등 넣고 싶으면 여기
  return NextResponse.next();
}

// 적용 경로(정적/이미지/api는 제외), 이렇게 설정하면 ISR이나 Static Cache이 안됨.
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)",
//   ],
// };

export const config = {
    matcher: ["/login", "/signup", "/protected/:path*"], // 인증 필요한 경로만
};

