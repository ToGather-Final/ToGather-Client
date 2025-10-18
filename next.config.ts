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
    
    // 🚀 SSR 성능 최적화
    experimental: {
        // 메모리 사용량 최적화
        memoryBasedWorkersCount: true,
    },
    
    // 🚀 서버 외부 패키지 설정 (Next.js 15+)
    serverExternalPackages: ['sharp'],
    
    // 🚀 컴파일러 최적화
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
        // React 19 최적화
        reactRemoveProperties: process.env.NODE_ENV === 'production' ? {
            properties: ['^data-testid$']
        } : false,
    },
    
    // 🚀 성능 최적화
    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
        },
    },
};

export default nextConfig;