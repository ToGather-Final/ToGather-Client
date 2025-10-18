import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppShell from "../components/layout/AppShell";
import { GroupIdProvider } from "@/contexts/groupIdContext";

const pretendard = localFont({
  // src: [
  //   {
  //     path: "../../public/fonts/Pretendard-Light.otf",
  //     weight: "300",
  //     style: "normal",
  //   },
  //   {
  //     path: "../../public/fonts/Pretendard-Regular.otf",
  //     weight: "400",
  //     style: "normal",
  //   },
  //   {
  //     path: "../../public/fonts/Pretendard-Medium.otf",
  //     weight: "500",
  //     style: "normal",
  //   },
  //   {
  //     path: "../../public/fonts/Pretendard-SemiBold.otf",
  //     weight: "600",
  //     style: "normal",
  //   },
  //   {
  //     path: "../../public/fonts/Pretendard-Bold.otf",
  //     weight: "700",
  //     style: "normal",
  //   },
  //   {
  //     path: "../../public/fonts/Pretendard-ExtraBold.otf",
  //     weight: "800",
  //     style: "normal",
  //   },
  // ],
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "ToGather",
  description: "모임 투자 웹앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable}`}>
      <head>
        {/* Preload critical font */}
        <link
          rel="preload"
          href="/fonts/PretendardVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preconnect to external domains if any */}
      </head>
      <GroupIdProvider>
        <body className={pretendard.className}>{children}</body>
      </GroupIdProvider>
    </html>
  );
}
