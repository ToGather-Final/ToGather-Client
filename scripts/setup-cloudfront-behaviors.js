#!/usr/bin/env node

const { CloudFrontClient, GetDistributionCommand, UpdateDistributionCommand } = require('@aws-sdk/client-cloudfront');

const cloudfrontClient = new CloudFrontClient({ region: 'ap-northeast-2' });
const DISTRIBUTION_ID = 'E15ZDIW40YBVEN';

async function setupCloudFrontBehaviors() {
    try {
        console.log('🔍 현재 CloudFront 배포 설정 확인 중...');
        
        // 현재 배포 설정 가져오기
        const getCommand = new GetDistributionCommand({
            DistributionId: DISTRIBUTION_ID
        });
        
        const distribution = await cloudfrontClient.send(getCommand);
        const config = distribution.Distribution.DistributionConfig;
        
        console.log('📋 현재 Origin 설정:');
        config.Origins.Items.forEach(origin => {
            console.log(`  - ${origin.Id}: ${origin.DomainName}`);
        });
        
        console.log('📋 현재 Behavior 설정:');
        config.CacheBehaviors.Items.forEach(behavior => {
            console.log(`  - ${behavior.PathPattern}: ${behavior.TargetOriginId}`);
        });
        
        // 필요한 Behavior들이 있는지 확인
        const requiredBehaviors = [
            '/_next/static/*',
            '/static/*',
            '/fonts/*',
            '/images/*'
        ];
        
        const existingPatterns = config.CacheBehaviors.Items.map(b => b.PathPattern);
        const missingBehaviors = requiredBehaviors.filter(pattern => !existingPatterns.includes(pattern));
        
        if (missingBehaviors.length > 0) {
            console.log('⚠️ 누락된 Behavior 패턴들:');
            missingBehaviors.forEach(pattern => console.log(`  - ${pattern}`));
            console.log('');
            console.log('💡 AWS 콘솔에서 다음 Behavior들을 추가해주세요:');
            console.log('');
            missingBehaviors.forEach(pattern => {
                console.log(`Path Pattern: ${pattern}`);
                console.log('Target Origin: S3-togather-static-assets');
                console.log('Cache Policy: Managed-CachingOptimized');
                console.log('Origin Request Policy: Managed-CORS-S3Origin');
                console.log('Response Headers Policy: Managed-SecurityHeadersPolicy');
                console.log('TTL: 1년 (31536000초)');
                console.log('Compress: Yes');
                console.log('---');
            });
        } else {
            console.log('✅ 모든 필요한 Behavior가 설정되어 있습니다.');
        }
        
        // S3 Origin이 올바르게 설정되어 있는지 확인
        const s3Origin = config.Origins.Items.find(origin => 
            origin.DomainName.includes('togather-static-assets')
        );
        
        if (!s3Origin) {
            console.log('❌ S3 Origin이 설정되지 않았습니다.');
            console.log('💡 AWS 콘솔에서 다음 Origin을 추가해주세요:');
            console.log('Origin Domain: togather-static-assets.s3.ap-northeast-2.amazonaws.com');
            console.log('Origin Path: (비어있음)');
            console.log('Origin Access Control: (설정 필요)');
        } else {
            console.log('✅ S3 Origin이 올바르게 설정되어 있습니다.');
        }
        
    } catch (error) {
        console.error('❌ CloudFront 설정 확인 실패:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    setupCloudFrontBehaviors();
}

module.exports = { setupCloudFrontBehaviors };
