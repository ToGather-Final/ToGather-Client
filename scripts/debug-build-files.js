#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function scanDirectory(dir, prefix = '') {
    const items = [];
    
    if (!fs.existsSync(dir)) {
        return items;
    }
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const relativePath = path.join(prefix, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            items.push(...scanDirectory(fullPath, relativePath));
        } else {
            items.push(relativePath.replace(/\\/g, '/'));
        }
    });
    
    return items;
}

function main() {
    console.log('🔍 Next.js 빌드 파일 구조 분석');
    console.log('=====================================');
    
    const nextDir = path.join(__dirname, '..', '.next');
    
    if (!fs.existsSync(nextDir)) {
        console.log('❌ .next 디렉토리가 없습니다. 먼저 빌드를 실행하세요.');
        console.log('   pnpm run build');
        return;
    }
    
    console.log('📁 .next 디렉토리 구조:');
    const nextContents = fs.readdirSync(nextDir);
    nextContents.forEach(item => {
        const itemPath = path.join(nextDir, item);
        const isDir = fs.statSync(itemPath).isDirectory();
        console.log(`  ${isDir ? '📁' : '📄'} ${item}`);
    });
    
    console.log('\n📦 정적 자산 파일들:');
    const staticFiles = scanDirectory(path.join(nextDir, 'static'));
    staticFiles.forEach(file => {
        console.log(`  /_next/static/${file}`);
    });
    
    console.log('\n🖥️ 서버 자산 파일들:');
    const serverFiles = scanDirectory(path.join(nextDir, 'server'));
    serverFiles.forEach(file => {
        console.log(`  /_next/server/${file}`);
    });
    
    console.log('\n📦 Standalone 자산 파일들:');
    const standaloneFiles = scanDirectory(path.join(nextDir, 'standalone'));
    standaloneFiles.forEach(file => {
        console.log(`  /_next/standalone/${file}`);
    });
    
    console.log('\n💾 캐시 파일들:');
    const cacheFiles = scanDirectory(path.join(nextDir, 'cache'));
    cacheFiles.forEach(file => {
        console.log(`  /_next/cache/${file}`);
    });
    
    console.log('\n📁 Public 자산 파일들:');
    const publicFiles = scanDirectory(path.join(__dirname, '..', 'public'));
    publicFiles.forEach(file => {
        console.log(`  /${file}`);
    });
    
    console.log('\n🔍 JavaScript 파일들만 필터링:');
    const allJsFiles = [
        ...staticFiles.filter(f => f.endsWith('.js')),
        ...serverFiles.filter(f => f.endsWith('.js')),
        ...standaloneFiles.filter(f => f.endsWith('.js')),
        ...cacheFiles.filter(f => f.endsWith('.js')),
    ];
    
    allJsFiles.forEach(file => {
        if (file.includes('chunks')) {
            console.log(`  /_next/static/${file}`);
        } else if (file.includes('server')) {
            console.log(`  /_next/server/${file}`);
        } else {
            console.log(`  /_next/static/${file}`);
        }
    });
    
    console.log('\n✅ 분석 완료!');
    console.log('💡 이 파일들이 S3에 올바르게 업로드되었는지 확인하세요.');
}

if (require.main === module) {
    main();
}

module.exports = { scanDirectory };
