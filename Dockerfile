# Togather-Client/Dockerfile

# 1. 의존성 설치 스테이지
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. 빌드 스테이지
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. 최종 실행 스테이지
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 빌드 결과물 중 standalone 실행에 필요한 파일들만 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Next.js 서버 실행 (기본 포트 3000)
EXPOSE 3000
CMD ["node", "server.js"]