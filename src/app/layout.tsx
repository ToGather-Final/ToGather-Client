import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppShell from "../components/layout/AppShell";

const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/Pretendard-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
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
    <html lang="ko">
      <body className={`${pretendard.variable} font-sans`}>{children}</body>
    </html>
  );
}
