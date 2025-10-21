import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    // 🚀 CDN 최적화: 정적 자산을 CloudFront + S3로 분리
    assetPrefix: process.env.NODE_ENV === 'production' 
        ? process.env.CDN_URL || 'https://d36ue99r8i68ow.cloudfront.net'
        : '',
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        minimumCacheTTL: 60,
        // 이미지 최적화 강화
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        // 환경별 이미지 로더 설정
        ...(process.env.NODE_ENV === 'production' ? {
            loader: 'custom',
            loaderFile: './src/lib/imageLoader.ts',
        } : {}),
    },
    compress: true,
    
    // Docker 환경 최적화
    poweredByHeader: false,
    generateEtags: true,
    
    // 🚀 SSR 성능 최적화 (Next.js 15 + React 19)
    experimental: {
        // 메모리 사용량 최적화
        memoryBasedWorkersCount: true,
        // React 19 최적화
        reactCompiler: false, // Turbopack과 충돌 방지
        // 스트리밍 SSR 활성화
        serverActions: {
            allowedOrigins: ['localhost:3000', 'xn--o79aq2k062a.store'],
        },
        // Next.js 15.5.3에서 지원하는 최적화만 사용
        optimizePackageImports: ['lucide-react'],
        // 🚀 CSS 최적화 (Next.js 15.5.3에서 불안정하므로 비활성화)
        // optimizeCss: true  // critters 에러로 인해 비활성화
    },
    
    // 🚀 서버 외부 패키지 설정 (Next.js 15+)
    serverExternalPackages: ['sharp'],
    
    // 🚀 빌드 안정성 설정
    outputFileTracingRoot: process.cwd(), // 워크스페이스 루트 경고 해결
    
    // 🚀 빌드 캐시 설정 (CI/CD 최적화)
    generateBuildId: process.env.CI ? () => 'build' : undefined,
    
    // 🚀 서버 타임아웃 설정 (Cold Start 방지)
    serverRuntimeConfig: {
        // 서버 사이드 타임아웃 설정
        timeout: 30000, // 30초
    },
    
    // 🚀 CSS 최적화 설정 (Next.js 15.5.3에서 제거됨)
    // swcMinify: true, // Next.js 15+에서 기본 활성화
    
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
    
    // 🚀 Webpack 설정 (assetPrefix가 이미 설정되어 있으므로 webpack 설정 제거)
    // webpack: (config, { isServer, dev }) => {
    //     // assetPrefix가 이미 CDN URL을 처리하므로 webpack 설정 불필요
    //     return config;
    // },
    
    // 🚀 캐싱 전략 (SSR 성능 향상)
    headers: async () => [
        {
            source: '/(.*)',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
                },
            ],
        },
        {
            source: '/api/(.*)',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=30',
                },
            ],
        },
        {
            source: '/_next/static/(.*)',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
            ],
        },
    ],
    
    // // 🚀 리다이렉트 최적화
    // redirects: async () => [
    //     {
    //         source: '/home',
    //         destination: '/',
    //         permanent: true,
    //     },
    // ],
    
    // 🚀 CDN을 통한 정적 자산 서빙 (assetPrefix가 이미 처리하므로 rewrites 제거)
    // rewrites: async () => {
    //     // assetPrefix가 이미 CDN URL을 처리하므로 rewrites 불필요
    //     return [];
    // },
};

export default nextConfig;