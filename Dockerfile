FROM node:lts AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Build
FROM base as build

COPY --link package.json pnpm-lock.yaml ./
RUN pnpm install

COPY --link . .

RUN pnpm run build

# Run
FROM base

ENV PORT=3000
ENV NODE_ENV=production

COPY --from=build /app/.output /app/.output

CMD [ "node", ".output/server/index.mjs" ]