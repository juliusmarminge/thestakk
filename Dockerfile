# Build stage
FROM node:lts AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Install and build with layer caching
COPY --link package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --link . .
RUN pnpm run build

# Production stage
FROM node:lts
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 tss

# Copy the build output
COPY --from=builder --chown=tss:nodejs /app/.output /app/.output

# Run app as non-root user
USER tss
EXPOSE $PORT
CMD [ "node", ".output/server/index.mjs" ]