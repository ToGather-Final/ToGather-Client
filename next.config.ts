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
        // 🚀 빌드 최적화
        optimizeCss: true
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
    
    // 🚀 Webpack 설정으로 assetPrefix 강제 적용 (프로덕션 환경만)
    webpack: (config, { isServer }) => {
        if (!isServer && process.env.NODE_ENV === 'production') {
            const cdnUrl = process.env.CDN_URL || 'https://d36ue99r8i68ow.cloudfront.net';
            
            // 정적 자산에 CDN URL 강제 적용
            config.output.publicPath = `${cdnUrl}/`;
        }
        // 개발 환경에서는 기본 Next.js 설정 사용
        return config;
    },
    
    // 🚀 캐싱 전략 (SSR 성능 향상)
    headers: async () => [
        {
            source: '/(.*)',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=0, must-revalidate',
                },
            ],
        },
        {
            source: '/api/(.*)',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=60, s-maxage=60',
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
    
    // 🚀 리다이렉트 최적화
    redirects: async () => [
        {
            source: '/home',
            destination: '/',
            permanent: true,
        },
    ],
    
    // 🚀 CDN을 통한 정적 자산 서빙 (프로덕션 환경만)
    rewrites: async () => {
        if (process.env.NODE_ENV === 'production') {
            const cdnUrl = process.env.CDN_URL || 'https://d36ue99r8i68ow.cloudfront.net';
            return [
                {
                    source: '/static/:path*',
                    destination: `${cdnUrl}/_next/static/:path*`,
                },
                {
                    source: '/fonts/:path*',
                    destination: `${cdnUrl}/fonts/:path*`,
                },
                {
                    source: '/images/:path*',
                    destination: `${cdnUrl}/images/:path*`,
                },
                {
                    source: '/favicon.ico',
                    destination: `${cdnUrl}/favicon.ico`,
                },
            ];
        }
        // 개발 환경에서는 rewrites 없음 (기본 Next.js 동작 사용)
        return [];
    },
};

export default nextConfig;