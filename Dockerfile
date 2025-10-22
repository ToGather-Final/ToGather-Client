# ---- Stage 1: Build ----
FROM node:18-alpine AS builder

WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .

# ✅ 빌드 (SSR + S3/CDN 병행)
ARG NEXT_PUBLIC_API_BASE_URL
ARG CDN_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV CDN_URL=${CDN_URL}
RUN pnpm run build

# ---- Stage 2: Runtime ----
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=128"
ENV NODE_NO_WARNINGS=1

# ✅ 빌드 산출물 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000

# ✅ Next.js 런타임
CMD ["node", "next-server.js"]

    
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
