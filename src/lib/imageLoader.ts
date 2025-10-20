export default function imageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // 프로덕션 환경에서는 CDN을 통해 이미지 서빙
  if (process.env.NODE_ENV === 'production') {
    const cdnUrl = process.env.CDN_URL || 'https://d36ue99r8i68ow.cloudfront.net';
    return `${cdnUrl}${src}?w=${width}&q=${quality || 75}`;
  }
  
  // 개발 환경에서는 Next.js 기본 이미지 최적화 사용
  // src가 이미 절대 경로인 경우 그대로 사용
  if (src.startsWith('http')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }
  
  // 상대 경로인 경우 public 디렉토리에서 직접 서빙
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
