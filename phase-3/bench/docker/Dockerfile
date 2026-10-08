# Same app, two shapes (bundle | unbundled), three runtime bases. Build stage is always node:24-slim.
ARG RUNTIME=node:24-slim
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json app.ts ./
RUN npm ci --no-audit --no-fund
RUN npx tsc -p . && npx esbuild app.ts --bundle --minify --platform=node --format=esm --outfile=bundle/app.mjs \
      --banner:js="import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"
RUN npm ci --omit=dev --no-audit --no-fund

# Variant: bundle -> a single file, no node_modules
FROM ${RUNTIME} AS bundle
WORKDIR /app
COPY --from=build /app/bundle/app.mjs ./app.mjs
ENV NODE_ENV=production
CMD ["app.mjs"]

# Variant: tsc output + production node_modules
FROM ${RUNTIME} AS unbundled
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production
CMD ["dist/app.js"]
