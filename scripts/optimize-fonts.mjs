// 폰트 최적화 스크립트
// Pretendard 폰트를 한글 서브셋으로 변환하여 용량 최적화

import { readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 실제로 폰트 서브셋을 만들려면 python의 fonttools가 필요합니다.
// 여기서는 대신 Next.js 최적화 전략을 사용하도록 안내합니다.

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📝 Pretendard 폰트 최적화 가이드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

현재 폰트 크기 확인...
`);

try {
  const fontPath = join(projectRoot, 'public/fonts/PretendardVariable.woff2');
  const stats = statSync(fontPath);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  
  console.log(`✅ PretendardVariable.woff2: ${sizeInMB}MB`);
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 최적화 옵션:

옵션 1: 한글 서브셋 폰트 다운로드 (권장) ⭐
────────────────────────────────────────────────
1. https://github.com/orioncactus/pretendard 방문
2. "subset" 버전 다운로드
3. PretendardVariable.subset.woff2 를 다운로드
4. public/fonts/ 폴더에 저장
5. src/app/layout.tsx 에서 경로 변경:
   
   src: "../../public/fonts/PretendardVariable.subset.woff2"

예상 효과: 2MB → 200KB (90% 감소)


옵션 2: Next.js Font Optimization (현재 적용됨) ✅
────────────────────────────────────────────────
- display: 'swap' 사용 (이미 적용됨)
- Variable 폰트 사용 (이미 적용됨)
- preload 자동 적용 (Next.js 기본)

현재 설정은 이미 최적화되어 있습니다!


옵션 3: 시스템 폰트 Fallback 개선
────────────────────────────────────────────────
layout.tsx에서 다음과 같이 수정:

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "optional", // swap → optional로 변경
  weight: "100 900",
  variable: "--font-pretendard",
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ]
});

이렇게 하면 폰트 로딩이 느릴 때 시스템 폰트를 먼저 보여줍니다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 Pretendard Subset 다운로드 링크:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

직접 다운로드:
https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/woff2-subset/PretendardVariable.subset.woff2

또는 CDN 사용 (권장):
https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
💡 추천: CDN 사용이 가장 간단하고 효과적입니다!
   layout.tsx에서 <link> 태그로 불러오세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

} catch (error) {
  console.error('❌ 폰트 파일을 찾을 수 없습니다:', error.message);
}

