import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppShell from "../src/components/layout/AppShell";
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
  src: process.env.NODE_ENV === 'production' 
    ? `${process.env.CDN_URL || 'https://d36ue99r8i68ow.cloudfront.net'}/fonts/PretendardVariable.woff2`
    : "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "ToGather",
  description: "모임 투자 웹앱",
  icons: {
    icon: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? `${process.env.CDN_URL || 'https://d36ue99r8i68ow.cloudfront.net'}/favicon.ico`
          : '/favicon.ico',
        sizes: 'any',
      },
    ],
    apple: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? `${process.env.CDN_URL || 'https://d36ue99r8i68ow.cloudfront.net'}/logo.png`
          : '/logo.png',
        sizes: '180x180',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#6592FD',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable}`}>
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href={process.env.NODE_ENV === 'production' 
            ? `${process.env.CDN_URL || 'https://d36ue99r8i68ow.cloudfront.net'}/fonts/PretendardVariable.woff2`
            : '/fonts/PretendardVariable.woff2'
          }
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* DNS Prefetch for faster external resource loading */}
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <GroupIdProvider>
        <body className={pretendard.className}>
          <AppShell>{children}</AppShell>
        </body>
      </GroupIdProvider>
    </html>
  );
}
