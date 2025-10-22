/**
 * 🖼️ Next.js 이미지 로더 설정
 * - S3 + CloudFront를 통한 이미지 최적화
 * - stock 이미지들을 CDN에서 직접 서빙
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // 개발 환경에서는 기본 Next.js 이미지 처리 사용
  if (process.env.NODE_ENV !== 'production') {
    return src;
  }
  
  // CDN URL 설정 (프로덕션 환경에서만)
  const cdnUrl = process.env.CDN_URL || 'https://d36ue99r8i68ow.cloudfront.net';
  
  // stock 이미지인지 확인 (API에서 받은 stockImage URL)
  if (src.includes('/images/stock/') || src.includes('stock/')) {
    // API에서 받은 stockImage가 이미 CDN URL인 경우
    if (src.startsWith('http')) {
      return src;
    }
    
    // 상대 경로인 경우 CDN URL로 변환
    const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
    return `${cdnUrl}/${cleanSrc}`;
  }
  
  // 로고 및 파비콘 파일들 처리
  const logoFiles = ['logo.png', 'logo.webp', 'logo_blue.png', 'favicon.ico'];
  const isLogoFile = logoFiles.some(logoFile => src.includes(logoFile));
  
  if (isLogoFile) {
    // 이미 CDN URL인 경우
    if (src.startsWith('http')) {
      return src;
    }
    
    // 상대 경로인 경우 CDN URL로 변환
    const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
    return `${cdnUrl}/${cleanSrc}`;
  }

  // images/ PNG 파일들 처리 (stock 폴더 제외)
  if (src.includes('/images/') && src.endsWith('.png') && !src.includes('/images/stock/')) {
    // 이미 CDN URL인 경우
    if (src.startsWith('http')) {
      return src;
    }
    
    // 상대 경로인 경우 CDN URL로 변환
    const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
    return `${cdnUrl}/${cleanSrc}`;
  }
  
  // 기타 이미지들은 Next.js 기본 최적화 사용
  return src;
}