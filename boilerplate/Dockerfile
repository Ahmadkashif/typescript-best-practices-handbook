# syntax=docker/dockerfile:1

# One Node version for every stage, so native addons built in one stage
# run in the next (same libc: musl/alpine everywhere).
ARG NODE_IMAGE=node:24.21.0-alpine3.23

# ---------- 1. deps: all dependencies, cached on package-lock.json ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

# ---------- 2. build: bundle src/ into dist/ ----------
FROM deps AS build
COPY tsconfig.json tsdown.config.ts ./
COPY src ./src
RUN npm run build

# ---------- 3. prod-deps: runtime dependencies only ----------
FROM ${NODE_IMAGE} AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# ---------- 4. runtime: dist + prod node_modules, non-root ----------
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
# Docker/Compose health probe. Kubernetes ignores this and uses its own probes on /health and /ready.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
# Exec form: node is PID 1 and receives SIGTERM directly; main.ts handles it.
CMD ["node", "--enable-source-maps", "dist/main.js"]
