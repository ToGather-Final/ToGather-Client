FROM node:18-alpine AS builder

WORKDIR /app

# 빌드 인자로 받은 API URL을 환경변수로 설정
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# Next.js 빌드 (pnpm 사용으로 통일)
RUN pnpm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 필요한 파일들만 복사 (standalone 모드)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 포트 노출
EXPOSE 3000

# 서버 실행
CMD ["node", "server.js"]