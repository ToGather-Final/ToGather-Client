# ---- Runtime Only (빌드는 CI/CD에서 완료) ----
FROM node:18-alpine AS runner
WORKDIR /app

# 🚀 빌드 시 환경 변수 받기
ARG NEXT_PUBLIC_WS_URL
ARG CDN_URL

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=128"
ENV NODE_NO_WARNINGS=1
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV CDN_URL=${CDN_URL}

# ✅ CI/CD에서 빌드된 아티팩트 복사
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000

# ✅ Next.js 런타임 (server.js 또는 next-server.js 중 존재하는 것 실행)
CMD ["sh", "-c", "if [ -f /app/server.js ]; then node server.js; elif [ -f /app/next-server.js ]; then node next-server.js; elif [ -f /app/.next/standalone/server.js ]; then node .next/standalone/server.js; else echo 'No server file found' && ls -la /app && exit 1; fi"]

    
## ---- runtime only ----
#FROM node:18-alpine AS runner
##FROM ghcr.io/library/node:18.19.1-alpine AS runner
##FROM node:20-alpine AS runner
#
#WORKDIR /app
#
#RUN apk add --no-cache libc6-compat vips
#
#ENV NODE_ENV=production
#ENV NEXT_TELEMETRY_DISABLED=1
#ENV NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=128"
#ENV NODE_NO_WARNINGS=1
#
## 🚀 API 엔드포인트 환경변수 (런타임에 설정)
#ARG NEXT_PUBLIC_API_BASE_URL
#ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
#
## 깃헙 액션에서 넣어준 산출물만 복사
#COPY .next/standalone ./
#RUN if [ ! -f /app/server.js ] && [ -f /app/.next/standalone/server.js ]; then \
#      cp /app/.next/standalone/server.js /app/server.js; \
#    fi
#COPY .next/static ./.next/static
#COPY public ./public
#
#RUN addgroup --system --gid 1001 nodejs && \
#    adduser --system --uid 1001 nextjs && \
#    chown -R nextjs:nodejs /app
#USER nextjs
#
#EXPOSE 3000
#
#ENV HOST=0.0.0.0
#ENV PORT=3000
#CMD ["node", "server.js"]
