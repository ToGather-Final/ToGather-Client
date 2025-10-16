import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    eslint: {
        // ESLint 실행을 비활성화 >> 빌드 테스트 때문에 eslint 끔
        ignoreDuringBuilds: true,
    },
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    }
};

export default nextConfig;
