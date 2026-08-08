# Intel Apply — production image for Koyeb
# Build context must be the repository root (web/ + vendor/)

FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /repo

FROM base AS deps
COPY vendor ./vendor
COPY web/package.json web/pnpm-lock.yaml ./web/
WORKDIR /repo/web
# Do not copy pnpm-workspace.yaml — it breaks single-package install in Docker
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /repo /repo
COPY web ./web
WORKDIR /repo/web
# Production uses PostgreSQL
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/intel_apply?schema=public"
ENV AUTH_SECRET="build-time-placeholder"
RUN pnpm exec prisma generate
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /repo/web

COPY --from=builder /repo/vendor /repo/vendor
COPY --from=builder /repo/web/package.json /repo/web/pnpm-lock.yaml ./
COPY --from=builder /repo/web/node_modules ./node_modules
COPY --from=builder /repo/web/.next ./.next
COPY --from=builder /repo/web/public ./public
COPY --from=builder /repo/web/prisma ./prisma
COPY --from=builder /repo/web/next.config.ts ./next.config.ts
COPY web/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
  && mkdir -p public/uploads \
  && chown -R node:node /repo

USER node
EXPOSE 3000
CMD ["./docker-entrypoint.sh"]
