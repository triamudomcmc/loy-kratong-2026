# syntax=docker/dockerfile:1.7
# Production image: Next.js standalone server + Prisma migrations + Chromium for /api/capture share images.

ARG NODE_VERSION=24-bookworm-slim

# ---- deps: install node_modules (postinstall runs `prisma generate`, so the schema must be present) ----
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN corepack enable && yarn install --frozen-lockfile --network-timeout 600000

# ---- build: compile the standalone server ----
FROM node:${NODE_VERSION} AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && yarn prisma generate && yarn build

# ---- migrate: just the Prisma CLI, used by the entrypoint to run `prisma migrate deploy` ----
FROM node:${NODE_VERSION} AS migrate
WORKDIR /migrate
COPY package.json ./package.ref.json
RUN PRISMA_VERSION="$(node -p "require('./package.ref.json').devDependencies.prisma.replace(/^[^0-9]*/, '')")" \
  && npm init -y >/dev/null \
  && npm install --omit=dev --no-audit --no-fund "prisma@${PRISMA_VERSION}" \
  && rm package.ref.json

# ---- runner ----
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    CHROME_PATH=/usr/bin/chromium

# Chromium (+ Thai and emoji fonts) for the puppeteer screenshot behind /api/capture
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium fonts-thai-tlwg fonts-noto-color-emoji openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Next standalone output (server.js + traced node_modules incl. wordcut dictionaries)
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

# Prisma CLI + schema/migrations for `migrate deploy` at start-up
COPY --from=migrate --chown=node:node /migrate /migrate
COPY --from=build --chown=node:node /app/prisma /migrate/prisma
COPY --from=build --chown=node:node /app/prisma.config.ts /migrate/prisma.config.ts

COPY --chown=node:node docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
