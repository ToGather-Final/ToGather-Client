#!/usr/bin/env node

const http = require('http');
const https = require('https');

const SITE_URL = process.env.SITE_URL || 'https://xn--o79aq2k062a.store';
const TEST_COUNT = 10;

async function measureResponseTime(path) {
    return new Promise((resolve, reject) => {
        const url = `${SITE_URL}${path}`;
        const startTime = Date.now();
        
        const client = url.startsWith('https') ? https : http;
        
        const req = client.get(url, (res) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 응답 헤더 확인
            const headers = {
                'content-type': res.headers['content-type'],
                'content-length': res.headers['content-length'],
                'server': res.headers['server'],
                'x-response-time': res.headers['x-response-time'],
                'cache-control': res.headers['cache-control'],
            };
            
            resolve({
                path,
                statusCode: res.statusCode,
                duration,
                headers,
                timestamp: new Date().toISOString()
            });
        });
        
        req.on('error', (error) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            resolve({
                path,
                error: error.message,
                duration,
                timestamp: new Date().toISOString()
            });
        });
        
        req.setTimeout(30000, () => {
            req.destroy();
            resolve({
                path,
                error: 'TIMEOUT',
                duration: 30000,
                timestamp: new Date().toISOString()
            });
        });
    });
}

async function debugResponseTimes() {
    console.log('🔍 Next.js 단일 Pod 응답 시간 디버깅');
    console.log('=====================================');
    console.log(`🌐 대상 URL: ${SITE_URL}`);
    console.log(`📊 테스트 횟수: ${TEST_COUNT}회`);
    console.log('🚀 단일 Pod 고성능 모드 (Cold Start 없음)');
    console.log('');
    
    const results = [];
    
    for (let i = 0; i < TEST_COUNT; i++) {
        console.log(`🔄 테스트 ${i + 1}/${TEST_COUNT}...`);
        
        const result = await measureResponseTime('/');
        results.push(result);
        
        console.log(`  ${result.error ? '❌' : '✅'} ${result.duration}ms - ${result.statusCode || 'ERROR'}`);
        
        if (result.error) {
            console.log(`    에러: ${result.error}`);
        } else {
            console.log(`    서버: ${result.headers.server || 'Unknown'}`);
            console.log(`    Content-Type: ${result.headers['content-type'] || 'Unknown'}`);
        }
        
        // 테스트 간 간격
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 결과 분석
    console.log('');
    console.log('📊 응답 시간 분석');
    console.log('=====================================');
    
    const successResults = results.filter(r => !r.error);
    const errorResults = results.filter(r => r.error);
    
    if (successResults.length > 0) {
        const durations = successResults.map(r => r.duration);
        const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);
        
        console.log(`✅ 성공: ${successResults.length}/${results.length}`);
        console.log(`⏱️ 평균 응답시간: ${Math.round(avgDuration)}ms`);
        console.log(`⚡ 최단 응답시간: ${minDuration}ms`);
        console.log(`🐌 최장 응답시간: ${maxDuration}ms`);
        
        // 응답 시간 분포
        const fastResponses = durations.filter(d => d < 1000).length;
        const mediumResponses = durations.filter(d => d >= 1000 && d < 5000).length;
        const slowResponses = durations.filter(d => d >= 5000).length;
        
        console.log('');
        console.log('📈 응답 시간 분포:');
        console.log(`  🚀 빠름 (<1초): ${fastResponses}회`);
        console.log(`  🐌 보통 (1-5초): ${mediumResponses}회`);
        console.log(`  🐢 느림 (>5초): ${slowResponses}회`);
        
        // 고정된 지연 패턴 확인
        const uniqueDurations = [...new Set(durations.map(d => Math.round(d / 1000) * 1000))];
        if (uniqueDurations.length < durations.length * 0.5) {
            console.log('');
            console.log('⚠️ 고정된 지연 패턴 감지!');
            console.log(`   고유한 응답시간: ${uniqueDurations.join(', ')}ms`);
            console.log('   이는 Health Check나 타임아웃 설정 문제일 수 있습니다.');
        }
    }
    
    if (errorResults.length > 0) {
        console.log('');
        console.log(`❌ 실패: ${errorResults.length}/${results.length}`);
        errorResults.forEach(r => {
            console.log(`  - ${r.path}: ${r.error} (${r.duration}ms)`);
        });
    }
    
    console.log('');
    console.log('🎯 권장사항:');
    console.log('1. kubectl get pods -n togather -l app=nextjs-client');
    console.log('2. kubectl logs -n togather -l app=nextjs-client --tail=50');
    console.log('3. kubectl describe pod -n togather -l app=nextjs-client');
    console.log('4. Health Check 설정 확인');
}

if (require.main === module) {
    debugResponseTimes().catch(console.error);
}

module.exports = { debugResponseTimes };
