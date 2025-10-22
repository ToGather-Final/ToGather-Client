#!/usr/bin/env node

/**
 * ✅ 안정형 Next.js 정적 자산 업로더
 * - .next/static 전체를 단일 업로드 (중복 제거)
 * - 빌드 완료 후에만 실행 (사전 존재 확인)
 * - 직렬 업로드로 누락 방지
 * - CloudFront 무효화 자동 실행
 */

const {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const {
    CloudFrontClient,
    CreateInvalidationCommand,
} = require("@aws-sdk/client-cloudfront");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const REGION = "ap-northeast-2";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "togather-static-assets";
const CLOUDFRONT_DISTRIBUTION_ID =
    process.env.CLOUDFRONT_DISTRIBUTION_ID || "E15ZDIW40YBVEN";

const s3Client = new S3Client({ region: REGION });
const cloudfrontClient = new CloudFrontClient({ region: REGION });

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function getAllFiles(dirPath, fileList = []) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const full = path.join(dirPath, file);
        if (fs.statSync(full).isDirectory()) {
            getAllFiles(full, fileList);
        } else {
            fileList.push(full);
        }
    }
    return fileList;
}

async function uploadFile(filePath, baseDir, prefix = "") {
    const relative = path.relative(baseDir, filePath).replace(/\\/g, "/");
    const s3Key = prefix ? `${prefix}/${relative}` : relative;
    const contentType = mime.lookup(filePath) || "application/octet-stream";
    const fileContent = fs.readFileSync(filePath);

    const cacheControl =
        filePath.includes("_next/static/") ||
        filePath.match(/\.(jpg|jpeg|png|gif|webp|svg|woff2?)$/)
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600";

    try {
        await s3Client.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fileContent,
                ContentType: contentType,
                CacheControl: cacheControl,
            })
        );
        console.log(`✅ Uploaded: ${s3Key}`);
    } catch (err) {
        console.error(`❌ Failed: ${s3Key} (${err.message})`);
    }
}

async function uploadDirectory(localDir, s3Prefix = "") {
    console.log(`📦 Uploading directory: ${localDir}`);
    const files = getAllFiles(localDir);
    console.log(`📁 Found ${files.length} files`);
    for (const file of files) {
        await uploadFile(file, localDir, s3Prefix);
    }
    console.log("✅ Upload complete");
}

async function invalidateCloudFront() {
    console.log("🔄 Invalidating CloudFront cache...");
    const cmd = new CreateInvalidationCommand({
        DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
        InvalidationBatch: {
            CallerReference: `deploy-${Date.now()}`,
            Paths: { Quantity: 1, Items: ["/*"] },
        },
    });
    const res = await cloudfrontClient.send(cmd);
    console.log(`✅ Invalidation started: ${res.Invalidation.Id}`);
}

async function clearS3Bucket() {
    console.log("🧹 Clearing S3 bucket before upload...");
    let totalDeleted = 0;
    let continuationToken = undefined;
    
    try {
        do {
            const listCommand = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: "_next/",
                MaxKeys: 1000, // 한 번에 최대 1000개
                ContinuationToken: continuationToken
            });
            
            const listResult = await s3Client.send(listCommand);
            
            if (listResult.Contents && listResult.Contents.length > 0) {
                console.log(`🗑️ Deleting ${listResult.Contents.length} files (batch)...`);
                
                // 병렬 삭제로 속도 향상
                const deletePromises = listResult.Contents.map(async (object) => {
                    try {
                        const deleteCommand = new DeleteObjectCommand({
                            Bucket: BUCKET_NAME,
                            Key: object.Key
                        });
                        await s3Client.send(deleteCommand);
                        console.log(`  ✅ Deleted: ${object.Key}`);
                        return true;
                    } catch (deleteErr) {
                        console.error(`  ❌ Failed to delete ${object.Key}:`, deleteErr.message);
                        return false;
                    }
                });
                
                const results = await Promise.all(deletePromises);
                const successCount = results.filter(r => r).length;
                totalDeleted += successCount;
                
                if (successCount < listResult.Contents.length) {
                    console.warn(`⚠️ ${listResult.Contents.length - successCount} files failed to delete`);
                }
            }
            
            // 다음 페이지가 있는지 확인
            continuationToken = listResult.NextContinuationToken;
            
        } while (continuationToken);
        
        console.log(`✅ S3 bucket cleared successfully! Deleted ${totalDeleted} files total.`);
        
    } catch (err) {
        console.error("❌ Failed to clear S3 bucket:", err.message);
        console.warn("⚠️ Continuing with upload despite clear failure...");
        // 삭제 실패해도 업로드는 계속 진행
    }
}

async function main() {
    console.log("🚀 Starting static asset deployment...");
    const nextDir = path.join(__dirname, "..", ".next");
    const staticDir = path.join(nextDir, "static");
    const publicDir = path.join(__dirname, "..", "public");

    // 1️⃣ 빌드 완료 대기 (.next/static/chunks 존재해야 함)
    let retries = 0;
    while (!fs.existsSync(staticDir) && retries < 5) {
        console.log("⏳ Waiting for .next/static to be ready...");
        await sleep(2000);
        retries++;
    }

    if (!fs.existsSync(staticDir)) {
        throw new Error("❌ .next/static 디렉토리를 찾을 수 없습니다. 빌드 실패로 추정됩니다.");
    }

    // 2️⃣ 기존 S3 파일 정리 (선택사항)
    await clearS3Bucket();

        // 3️⃣ .next/static 전체 업로드
        console.log("🔍 Uploading .next/static files...");
        console.log("📁 Static directory contents:");
        const staticFiles = getAllFiles(staticDir);
        console.log(`Found ${staticFiles.length} files in .next/static`);
        
        // main-app 파일들 확인
        const mainAppFiles = staticFiles.filter(f => f.includes('main-app'));
        console.log("📋 main-app files found:", mainAppFiles.map(f => path.basename(f)));
        
        await uploadDirectory(staticDir, "_next/static");

        // 4️⃣ stock 이미지 업로드
        console.log("🖼️ Uploading stock images...");
        const stockImagesDir = path.join(process.cwd(), "public", "images", "stock");
        if (fs.existsSync(stockImagesDir)) {
            const stockFiles = getAllFiles(stockImagesDir);
            console.log(`Found ${stockFiles.length} stock image files`);
            
            for (const file of stockFiles) {
                const relativePath = path.relative(stockImagesDir, file);
                const s3Key = `images/stock/${relativePath}`;
                await uploadFile(file, stockImagesDir, "images/stock");
                console.log(`✅ Uploaded stock image: ${s3Key}`);
            }
        } else {
            console.log("⚠️ Stock images directory not found, skipping...");
        }

        // 5️⃣ 로고 및 파비콘 업로드
        console.log("🎨 Uploading logos and favicons...");
        const logoFiles = [
            'logo.png',
            'logo.webp', 
            'logo_blue.png',
            'favicon.ico'
        ];
        
        for (const logoFile of logoFiles) {
            const logoPath = path.join(process.cwd(), "public", logoFile);
            if (fs.existsSync(logoPath)) {
                await uploadFile(logoPath, path.join(process.cwd(), "public"), "");
                console.log(`✅ Uploaded logo/favicon: ${logoFile}`);
            } else {
                console.log(`⚠️ Logo file not found: ${logoFile}`);
            }
        }

        // 6️⃣ images/ PNG 파일들 업로드 (stock 폴더 제외)
        console.log("🖼️ Uploading images/ PNG files (excluding stock)...");
        const imagesDir = path.join(process.cwd(), "public", "images");
        if (fs.existsSync(imagesDir)) {
            const allFiles = getAllFiles(imagesDir);
            const pngFiles = allFiles.filter(file => 
                file.endsWith('.png') && 
                !file.includes('stock/') // stock 폴더 제외
            );
            
            console.log(`Found ${pngFiles.length} PNG files in images/ (excluding stock)`);
            
            for (const file of pngFiles) {
                const relativePath = path.relative(imagesDir, file);
                await uploadFile(file, imagesDir, "images");
                console.log(`✅ Uploaded PNG image: images/${relativePath}`);
            }
        } else {
            console.log("⚠️ Images directory not found, skipping...");
        }

        // 7️⃣ 폰트 파일들 업로드
        console.log("🔤 Uploading font files...");
        const fontsDir = path.join(process.cwd(), "public", "fonts");
        if (fs.existsSync(fontsDir)) {
            const fontFiles = getAllFiles(fontsDir);
            console.log(`Found ${fontFiles.length} font files`);
            
            for (const file of fontFiles) {
                const relativePath = path.relative(fontsDir, file);
                await uploadFile(file, fontsDir, "fonts");
                console.log(`✅ Uploaded font: fonts/${relativePath}`);
            }
        } else {
            console.log("⚠️ Fonts directory not found, skipping...");
        }

    // 4️⃣ public 디렉토리 업로드 (이미지, 폰트 등)
    if (fs.existsSync(publicDir)) {
        await uploadDirectory(publicDir, "");
    }

    // 5️⃣ CDN 캐시 무효화
    await invalidateCloudFront();

    console.log("🎉 S3 업로드 및 CDN 무효화 완료!");
}

main().catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
});


// #!/usr/bin/env node
//
// const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
// const fs = require('fs');
// const path = require('path');
// const mime = require('mime-types');
//
// // AWS 설정
// const s3Client = new S3Client({ region: 'ap-northeast-2' });
// const cloudfrontClient = new CloudFrontClient({ region: 'ap-northeast-2' });
//
// const BUCKET_NAME = 'togather-static-assets';
// const CLOUDFRONT_DISTRIBUTION_ID = 'E15ZDIW40YBVEN';
//
// async function uploadDirectory(localDir, s3Prefix = '') {
//     console.log(`🚀 정적 자산 업로드 시작: ${localDir} -> s3://${BUCKET_NAME}/${s3Prefix}`);
//
//     const files = getAllFiles(localDir);
//     const uploadPromises = files.map(file => uploadFile(file, localDir, s3Prefix));
//
//     await Promise.all(uploadPromises);
//     console.log(`✅ ${files.length}개 파일 업로드 완료`);
// }
//
// function getAllFiles(dirPath, arrayOfFiles = []) {
//     const files = fs.readdirSync(dirPath);
//
//     files.forEach(file => {
//         const fullPath = path.join(dirPath, file);
//         if (fs.statSync(fullPath).isDirectory()) {
//             getAllFiles(fullPath, arrayOfFiles);
//         } else {
//             arrayOfFiles.push(fullPath);
//         }
//     });
//
//     return arrayOfFiles;
// }
//
// async function uploadFile(filePath, baseDir, s3Prefix) {
//     const relativePath = path.relative(baseDir, filePath);
//     // Windows 경로 구분자(\\)를 웹 경로 구분자(/)로 변환
//     const normalizedPath = relativePath.replace(/\\/g, '/');
//     const s3Key = s3Prefix ? `${s3Prefix}/${normalizedPath}` : normalizedPath;
//
//     const fileContent = fs.readFileSync(filePath);
//     const contentType = mime.lookup(filePath) || 'application/octet-stream';
//
//     const command = new PutObjectCommand({
//         Bucket: BUCKET_NAME,
//         Key: s3Key,
//         Body: fileContent,
//         ContentType: contentType,
//         CacheControl: getCacheControl(filePath),
//     });
//
//     try {
//         await s3Client.send(command);
//         console.log(`  ✅ ${s3Key}`);
//     } catch (error) {
//         console.error(`  ❌ ${s3Key}: ${error.message}`);
//     }
// }
//
// function getCacheControl(filePath) {
//     // 정적 자산은 1년 캐시
//     if (filePath.includes('_next/static/')) {
//         return 'public, max-age=31536000, immutable';
//     }
//     // 이미지는 1년 캐시
//     if (filePath.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) {
//         return 'public, max-age=31536000, immutable';
//     }
//     // 폰트는 1년 캐시
//     if (filePath.match(/\.(woff|woff2|ttf|otf)$/)) {
//         return 'public, max-age=31536000, immutable';
//     }
//     // 기본 1시간 캐시
//     return 'public, max-age=3600';
// }
//
// async function invalidateCloudFront() {
//     console.log('🔄 CloudFront 캐시 무효화 중...');
//
//     const command = new CreateInvalidationCommand({
//         DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
//         InvalidationBatch: {
//             CallerReference: `static-assets-${Date.now()}`,
//             Paths: {
//                 Quantity: 1,
//                 Items: ['/*']
//             }
//         }
//     });
//
//     try {
//         const result = await cloudfrontClient.send(command);
//         console.log(`✅ CloudFront 무효화 완료: ${result.Invalidation.Id}`);
//     } catch (error) {
//         console.error(`❌ CloudFront 무효화 실패: ${error.message}`);
//     }
// }
//
// async function main() {
//     try {
//         // .next 디렉토리 전체 구조 확인
//         const nextDir = path.join(__dirname, '..', '.next');
//         console.log('🔍 .next 디렉토리 구조 확인 중...');
//
//         if (fs.existsSync(nextDir)) {
//             const nextContents = fs.readdirSync(nextDir);
//             console.log('📁 .next 디렉토리 내용:', nextContents);
//         }
//
//         // .next/static 디렉토리 업로드 (Next.js 정적 자산)
//         const staticDir = path.join(__dirname, '..', '.next', 'static');
//         if (fs.existsSync(staticDir)) {
//             console.log('📦 Next.js 정적 자산 업로드 중...');
//             await uploadDirectory(staticDir, '_next/static');
//         }
//
//         // .next/server 디렉토리 업로드 (SSR 관련 자산)
//         const serverDir = path.join(__dirname, '..', '.next', 'server');
//         if (fs.existsSync(serverDir)) {
//             console.log('🖥️ Next.js 서버 자산 업로드 중...');
//             await uploadDirectory(serverDir, '_next/server');
//         }
//
//         // .next/standalone 디렉토리 업로드 (standalone 빌드 시)
//         const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
//         if (fs.existsSync(standaloneDir)) {
//             console.log('📦 Next.js standalone 자산 업로드 중...');
//             await uploadDirectory(standaloneDir, '_next/standalone');
//         }
//
//         // .next/cache 디렉토리 업로드 (캐시 파일들)
//         const cacheDir = path.join(__dirname, '..', '.next', 'cache');
//         if (fs.existsSync(cacheDir)) {
//             console.log('💾 Next.js 캐시 자산 업로드 중...');
//             await uploadDirectory(cacheDir, '_next/cache');
//         }
//
//         // .next/static/chunks 디렉토리 확인 및 업로드
//         const chunksDir = path.join(__dirname, '..', '.next', 'static', 'chunks');
//         if (fs.existsSync(chunksDir)) {
//             console.log('🧩 Next.js chunks 자산 업로드 중...');
//             await uploadDirectory(chunksDir, '_next/static/chunks');
//         }
//
//         // public 디렉토리 업로드 (이미지, 폰트 등)
//         const publicDir = path.join(__dirname, '..', 'public');
//         if (fs.existsSync(publicDir)) {
//             console.log('📁 Public 자산 업로드 중...');
//             await uploadDirectory(publicDir, '');
//         }
//
//         // CloudFront 캐시 무효화
//         await invalidateCloudFront();
//
//         console.log('🎉 정적 자산 CDN 배포 완료!');
//         console.log('📋 업로드된 자산 확인:');
//         console.log('  - Next.js 정적 자산: /_next/static/*');
//         console.log('  - Next.js 서버 자산: /_next/server/*');
//         console.log('  - Next.js standalone: /_next/standalone/*');
//         console.log('  - Next.js 캐시: /_next/cache/*');
//         console.log('  - Public 자산: /*');
//     } catch (error) {
//         console.error('❌ 배포 실패:', error);
//         process.exit(1);
//     }
// }
//
// if (require.main === module) {
//     main();
// }
//
// module.exports = { uploadDirectory, invalidateCloudFront };
