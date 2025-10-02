import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    eslint: {
        // ESLint 실행을 비활성화 >> 빌드 테스트 때문에 eslint 끔
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
