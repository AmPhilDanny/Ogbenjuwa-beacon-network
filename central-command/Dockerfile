# ─── Central Command API Server ────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production

FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
COPY admin/ ./admin/
RUN bun install
RUN cd admin && bun x vite build

FROM oven/bun:1 AS production
WORKDIR /app
RUN apt-get update -qq && apt-get install -y -qq curl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY server/ ./server/
COPY --from=build /app/admin/dist ./admin/dist
COPY package.json ./
EXPOSE 4001
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4001/api/v1/health || exit 1
CMD ["bun", "run", "server/index.ts"]
