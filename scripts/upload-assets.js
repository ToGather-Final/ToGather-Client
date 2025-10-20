#!/usr/bin/env node

const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// AWS 설정
const s3Client = new S3Client({ region: 'ap-northeast-2' });
const cloudfrontClient = new CloudFrontClient({ region: 'ap-northeast-2' });

const BUCKET_NAME = 'togather-static-assets';
const CLOUDFRONT_DISTRIBUTION_ID = 'E15ZDIW40YBVEN';

async function uploadDirectory(localDir, s3Prefix = '') {
    console.log(`🚀 정적 자산 업로드 시작: ${localDir} -> s3://${BUCKET_NAME}/${s3Prefix}`);
    
    const files = getAllFiles(localDir);
    const uploadPromises = files.map(file => uploadFile(file, localDir, s3Prefix));
    
    await Promise.all(uploadPromises);
    console.log(`✅ ${files.length}개 파일 업로드 완료`);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    
    return arrayOfFiles;
}

async function uploadFile(filePath, baseDir, s3Prefix) {
    const relativePath = path.relative(baseDir, filePath);
    // Windows 경로 구분자(\\)를 웹 경로 구분자(/)로 변환
    const normalizedPath = relativePath.replace(/\\/g, '/');
    const s3Key = s3Prefix ? `${s3Prefix}/${normalizedPath}` : normalizedPath;
    
    const fileContent = fs.readFileSync(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
        CacheControl: getCacheControl(filePath),
    });
    
    try {
        await s3Client.send(command);
        console.log(`  ✅ ${s3Key}`);
    } catch (error) {
        console.error(`  ❌ ${s3Key}: ${error.message}`);
    }
}

function getCacheControl(filePath) {
    // 정적 자산은 1년 캐시
    if (filePath.includes('_next/static/')) {
        return 'public, max-age=31536000, immutable';
    }
    // 이미지는 1년 캐시
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) {
        return 'public, max-age=31536000, immutable';
    }
    // 폰트는 1년 캐시
    if (filePath.match(/\.(woff|woff2|ttf|otf)$/)) {
        return 'public, max-age=31536000, immutable';
    }
    // 기본 1시간 캐시
    return 'public, max-age=3600';
}

async function invalidateCloudFront() {
    console.log('🔄 CloudFront 캐시 무효화 중...');
    
    const command = new CreateInvalidationCommand({
        DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
        InvalidationBatch: {
            CallerReference: `static-assets-${Date.now()}`,
            Paths: {
                Quantity: 1,
                Items: ['/*']
            }
        }
    });
    
    try {
        const result = await cloudfrontClient.send(command);
        console.log(`✅ CloudFront 무효화 완료: ${result.Invalidation.Id}`);
    } catch (error) {
        console.error(`❌ CloudFront 무효화 실패: ${error.message}`);
    }
}

async function main() {
    try {
        // .next 디렉토리 전체 구조 확인
        const nextDir = path.join(__dirname, '..', '.next');
        console.log('🔍 .next 디렉토리 구조 확인 중...');
        
        if (fs.existsSync(nextDir)) {
            const nextContents = fs.readdirSync(nextDir);
            console.log('📁 .next 디렉토리 내용:', nextContents);
        }
        
        // .next/static 디렉토리 업로드 (Next.js 정적 자산)
        const staticDir = path.join(__dirname, '..', '.next', 'static');
        if (fs.existsSync(staticDir)) {
            console.log('📦 Next.js 정적 자산 업로드 중...');
            await uploadDirectory(staticDir, '_next/static');
        }
        
        // .next/server 디렉토리 업로드 (SSR 관련 자산)
        const serverDir = path.join(__dirname, '..', '.next', 'server');
        if (fs.existsSync(serverDir)) {
            console.log('🖥️ Next.js 서버 자산 업로드 중...');
            await uploadDirectory(serverDir, '_next/server');
        }
        
        // .next/standalone 디렉토리 업로드 (standalone 빌드 시)
        const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
        if (fs.existsSync(standaloneDir)) {
            console.log('📦 Next.js standalone 자산 업로드 중...');
            await uploadDirectory(standaloneDir, '_next/standalone');
        }
        
        // .next/cache 디렉토리 업로드 (캐시 파일들)
        const cacheDir = path.join(__dirname, '..', '.next', 'cache');
        if (fs.existsSync(cacheDir)) {
            console.log('💾 Next.js 캐시 자산 업로드 중...');
            await uploadDirectory(cacheDir, '_next/cache');
        }
        
        // .next/static/chunks 디렉토리 확인 및 업로드
        const chunksDir = path.join(__dirname, '..', '.next', 'static', 'chunks');
        if (fs.existsSync(chunksDir)) {
            console.log('🧩 Next.js chunks 자산 업로드 중...');
            await uploadDirectory(chunksDir, '_next/static/chunks');
        }
        
        // public 디렉토리 업로드 (이미지, 폰트 등)
        const publicDir = path.join(__dirname, '..', 'public');
        if (fs.existsSync(publicDir)) {
            console.log('📁 Public 자산 업로드 중...');
            await uploadDirectory(publicDir, '');
        }
        
        // CloudFront 캐시 무효화
        await invalidateCloudFront();
        
        console.log('🎉 정적 자산 CDN 배포 완료!');
        console.log('📋 업로드된 자산 확인:');
        console.log('  - Next.js 정적 자산: /_next/static/*');
        console.log('  - Next.js 서버 자산: /_next/server/*');
        console.log('  - Next.js standalone: /_next/standalone/*');
        console.log('  - Next.js 캐시: /_next/cache/*');
        console.log('  - Public 자산: /*');
    } catch (error) {
        console.error('❌ 배포 실패:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { uploadDirectory, invalidateCloudFront };
