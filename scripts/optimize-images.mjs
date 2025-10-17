// 이미지 최적화 스크립트
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const images = [
  {
    name: 'heart_coin',
    input: join(projectRoot, 'public/images/heart_coin.png'),
    output: join(projectRoot, 'public/images/heart_coin.webp'),
    width: 224, // 56 * 4 (tailwind w-56 = 224px)
    quality: 85
  },
  {
    name: 'smile_coin',
    input: join(projectRoot, 'public/images/smile_coin.png'),
    output: join(projectRoot, 'public/images/smile_coin.webp'),
    width: 160, // 40 * 4 (tailwind w-40 = 160px)
    quality: 85
  },
  {
    name: 'star_coin',
    input: join(projectRoot, 'public/images/star_coin.png'),
    output: join(projectRoot, 'public/images/star_coin.webp'),
    width: 144, // 36 * 4 (tailwind w-36 = 144px)
    quality: 85
  },
  // 로고 이미지도 최적화
  {
    name: 'logo-blue',
    input: join(projectRoot, 'public/images/logo-blue.png'),
    output: join(projectRoot, 'public/images/logo-blue.webp'),
    width: 256,
    quality: 90
  },
  {
    name: 'logo-white',
    input: join(projectRoot, 'public/images/logo-white.png'),
    output: join(projectRoot, 'public/images/logo-white.webp'),
    width: 256,
    quality: 90
  },
  {
    name: 'account-create',
    input: join(projectRoot, 'public/images/account-create.png'),
    output: join(projectRoot, 'public/images/account-create.webp'),
    width: 800,
    quality: 85
  },
  {
    name: 'group-create',
    input: join(projectRoot, 'public/images/group-create.png'),
    output: join(projectRoot, 'public/images/group-create.webp'),
    width: 800,
    quality: 85
  }
];

async function optimizeImage(image) {
  try {
    console.log(`\n처리 중: ${image.name}...`);
    
    // 원본 파일 정보
    const originalStats = await sharp(image.input).metadata();
    const originalSize = (await sharp(image.input).toBuffer()).length;
    
    console.log(`  원본: ${originalStats.width}x${originalStats.height}, ${(originalSize / 1024).toFixed(2)}KB`);
    
    // WebP로 변환 및 최적화
    const buffer = await sharp(image.input)
      .resize(image.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: image.quality, effort: 6 })
      .toBuffer();
    
    // 파일 저장
    await sharp(buffer).toFile(image.output);
    
    const optimizedSize = buffer.length;
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
    
    console.log(`  최적화: ${image.width}px, ${(optimizedSize / 1024).toFixed(2)}KB`);
    console.log(`  ✅ 감소율: ${reduction}% 줄임`);
    
    return {
      name: image.name,
      originalSize: originalSize / 1024,
      optimizedSize: optimizedSize / 1024,
      reduction: parseFloat(reduction)
    };
  } catch (error) {
    console.error(`❌ ${image.name} 처리 실패:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 이미지 최적화 시작...\n');
  
  const results = [];
  
  for (const image of images) {
    const result = await optimizeImage(image);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\n\n📊 최적화 결과 요약:');
  console.log('================================');
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  results.forEach(result => {
    totalOriginal += result.originalSize;
    totalOptimized += result.optimizedSize;
    console.log(`${result.name}: ${result.originalSize.toFixed(2)}KB → ${result.optimizedSize.toFixed(2)}KB (${result.reduction}% 감소)`);
  });
  
  const totalReduction = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);
  
  console.log('================================');
  console.log(`전체: ${totalOriginal.toFixed(2)}KB → ${totalOptimized.toFixed(2)}KB`);
  console.log(`✅ 총 ${totalReduction}% 감소!`);
  console.log('\n✨ 최적화 완료!');
}

main().catch(console.error);

