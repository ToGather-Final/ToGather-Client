# ---- runtime only ----
FROM node:18-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat vips

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=128"
ENV NODE_NO_WARNINGS=1

# 🚀 API 엔드포인트 환경변수 (런타임에 설정)
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# 깃헙 액션에서 넣어준 산출물만 복사
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]


#FROM node:18-alpine AS builder
#
#WORKDIR /app
#
## 빌드 인자로 받은 API URL과 CDN URL을 환경변수로 설정
#ARG NEXT_PUBLIC_API_BASE_URL
#ARG CDN_URL
#ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
#ENV CDN_URL=$CDN_URL
#
## 🚀 Sharp 빌드를 위한 필수 라이브러리 설치
#RUN apk add --no-cache \
#    libc6-compat \
#    vips-dev \
#    build-base \
#    gcc \
#    g++ \
#    make \
#    python3
#
## pnpm 설치
#RUN npm install -g pnpm
#
## 의존성 파일 복사
#COPY package.json pnpm-lock.yaml ./
#
## 의존성 설치
#RUN pnpm install --frozen-lockfile
#
## 소스 코드 복사
#COPY . .
#
## Next.js 빌드 (React 19 + Next.js 15 최적화)
#RUN pnpm run build
#
## 🚀 빌드 최적화: 불필요한 파일 제거
#RUN find .next -name "*.map" -delete && \
#    find .next -name "*.d.ts" -delete && \
#    find .next -name "*.tsbuildinfo" -delete && \
#    find .next -name "*.log" -delete && \
#    rm -rf .next/cache
#
#FROM node:18-alpine AS runner
#WORKDIR /app
#
## 🚀 Sharp 런타임 의존성 설치 (빌드 도구는 불필요)
#RUN apk add --no-cache \
#    libc6-compat \
#    vips
#
#ENV NODE_ENV=production
#ENV NEXT_TELEMETRY_DISABLED=1
#
## 🚀 Node.js 성능 최적화 (Kubernetes 환경에 최적화)
#ENV NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=128"
#ENV NODE_NO_WARNINGS=1
#
## 필요한 파일들만 복사 (standalone 모드)
#COPY --from=builder /app/.next/standalone ./
#COPY --from=builder /app/.next/static ./.next/static
#COPY --from=builder /app/public ./public
#
## 🚀 Builder에서 빌드된 Sharp 복사 (재설치 불필요!)
#COPY --from=builder /app/node_modules/.pnpm/sharp@*/node_modules/sharp ./node_modules/sharp
#
## 🚀 보안 및 성능 최적화
#RUN addgroup --system --gid 1001 nodejs && \
#    adduser --system --uid 1001 nextjs && \
#    chown -R nextjs:nodejs /app
#
#USER nextjs
#
## 포트 노출
#EXPOSE 3000
#
## 서버 실행
#CMD ["node", "server.js"]