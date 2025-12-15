# Multi-stage Dockerfile for FX app
FROM node:20-alpine AS build
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app
COPY package.json ./
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node","dist/server/node-build.mjs"]
