import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        minimumCacheTTL: 60,
    },
    compress: true,
    
    // Docker 환경 최적화
    poweredByHeader: false,
    generateEtags: true, // ETag 활성화로 캐싱 개선
};

export default nextConfig;