FROM node:24-bookworm-slim AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Development
FROM base AS dev
ENV CI=true
RUN pnpm install --no-frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "start:dev"]

# Build
FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production
FROM node:24-bookworm-slim AS production
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["pnpm", "start"]
