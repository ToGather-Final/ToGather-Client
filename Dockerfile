FROM node:18-alpine AS builder

WORKDIR /app

# 빌드 인자로 받은 API URL을 환경변수로 설정
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# 🚀 Sharp 빌드를 위한 필수 라이브러리 설치
RUN apk add --no-cache \
    libc6-compat \
    vips-dev \
    build-base \
    gcc \
    g++ \
    make \
    python3

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN pnpm run build

FROM node:18-alpine AS runner
WORKDIR /app

# 🚀 Sharp 런타임 의존성 설치 (빌드 도구는 불필요)
RUN apk add --no-cache \
    libc6-compat \
    vips

ENV NODE_ENV=production

# 필요한 파일들만 복사 (standalone 모드)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 🚀 Builder에서 빌드된 Sharp 복사 (재설치 불필요!)
COPY --from=builder /app/node_modules/.pnpm/sharp@*/node_modules/sharp ./node_modules/sharp

# 포트 노출
EXPOSE 3000

# 서버 실행
CMD ["node", "server.js"]