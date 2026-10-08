# ts-backend-boilerplate

A strict, production-ready TypeScript HTTP service for Node.js 24 LTS.
Stack: **Fastify 5**, **Zod 4**, **pino**, **Vitest 5**, **ESLint 10 + typescript-eslint**, **Prettier**, **tsdown**, **TypeScript 7 (tsgo)**.

Why each piece was chosen: `../phase-3/boilerplate-deep-dive.md` ("Proposed stack"), based on a deep read of 32 open-source TS server boilerplates.

## Requirements

- Node.js `>=24.12` (`.nvmrc` pins 24). Node runs `.ts` files natively (type stripping), so development needs no `tsx`/`ts-node`.
- npm 11 (ships with Node 24).
- Docker 24+ with BuildKit (optional, for the image).

## Commands

| Command                                  | What it does                                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm ci`                                 | Clean install from `package-lock.json` (also installs the git hooks).                                       |
| `npm run dev`                            | Runs `src/main.ts` directly on Node with `--watch`, loading `.env` if it exists.                            |
| `npm run typecheck`                      | `tsc --noEmit` with TypeScript 7 (the native compiler).                                                     |
| `npm run lint` / `lint:fix`              | ESLint, type-aware (`strictTypeChecked`), zero warnings allowed.                                            |
| `npm run format` / `format:check`        | Prettier.                                                                                                   |
| `npm test`                               | All Vitest projects (unit + integration).                                                                   |
| `npm run test:unit` / `test:integration` | One project only.                                                                                           |
| `npm run test:coverage`                  | Tests with v8 coverage and thresholds (80% lines).                                                          |
| `npm run check`                          | format check + lint + typecheck + tests (what CI runs).                                                     |
| `npm run build`                          | tsdown bundles `src/` into `dist/main.js` (deps stay external).                                             |
| `npm start`                              | Runs the built server: `node --enable-source-maps dist/main.js`.                                            |
| `docker build -t app .`                  | Multi-stage image, non-root: about 27 MB of app layers (`dist/` + prod `node_modules`) on `node:24-alpine`. |

Quick start:

```sh
cp .env.example .env
npm ci
npm run dev
curl localhost:3000/health          # {"status":"ok"}
curl -X POST localhost:3000/v1/todos -H 'content-type: application/json' -d '{"title":"hello"}'
```

## Layout

```
src/
  main.ts                 entrypoint: config -> container -> app -> listen; graceful shutdown
  app.ts                  buildApp(container): Fastify instance, no listening (tests use it)
  container.ts            composition root: the only place that picks implementations
  config/env.ts           Zod-validated environment; the only reader of process.env
  http/error-handler.ts   the one place errors become RFC 9457 problem+json responses
  http/health.ts          GET /health (liveness) and GET /ready (readiness + shutdown flag)
  lib/                    framework-free utilities
    errors.ts             AppError hierarchy with stable codes
    logger.ts             pino options (JSON in prod, pretty on request, header redaction)
    assert-never.ts       exhaustiveness guard
    brand.ts              Brand<T, Name> + uuidId() branded ID factory
    decimal.ts            exact decimal math on bigint minor units, half-even rounding
    retry.ts              retry with exponential backoff, full jitter, AbortSignal
    time.ts               Clock interface, fixed clock for tests, duration constants
  modules/todos/          example feature: schema -> service -> repository port -> routes
test/
  helpers.ts              createTestApp(): real wiring, silent logs, frozen clock
  integration/            HTTP tests via app.inject() + one real-socket test
```

Unit tests sit next to the code (`*.test.ts`); integration tests live in `test/integration/`.

## Conventions this template enforces

- **ESM only, Node resolution.** `"type": "module"`, `module: nodenext`. Imports carry their real `.ts` extension.
- **Aliases via `package.json#imports`**: `#src/*` and `#test/*`. Node, TypeScript, Vitest and tsdown resolve them natively. ESLint bans `../` imports, so use the alias for anything that is not a sibling.
- **Erasable TypeScript only** (`erasableSyntaxOnly`): no `enum`, `namespace`, parameter properties or legacy decorators. Use `as const` objects and unions.
- **Strict compiler flags**: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`, and the rest in `tsconfig.json`.
- **Config**: add every variable to the schema in `src/config/env.ts`; the process exits at boot if it is invalid. Production never reads `.env` files.
- **Errors**: throw an `AppError` subclass (`NotFoundError`, `ConflictError`, ...) for expected failures. Anything else becomes a logged 500 with no details sent to the client.
- **Dependencies**: create them in `src/container.ts` and pass them as arguments. No DI container, no module-level singletons.
- **Time**: read the clock only through the injected `Clock`.
- **Money/exact decimals**: never with `number`; use `src/lib/decimal.ts`.

## Adding a feature module

1. `src/modules/<name>/<name>.schema.ts`: Zod schemas for the HTTP contract plus the domain type.
2. `<name>.repository.ts`: a port interface plus an adapter.
3. `<name>.service.ts`: `create<Name>Service(deps)` with the business logic and typed errors.
4. `<name>.routes.ts`: a `FastifyPluginAsyncZod` that validates, calls the service and maps the result.
5. Wire it in `src/container.ts` and register the routes in `src/app.ts`.
6. Add a colocated unit test for the service and an `inject()` test in `test/integration/`.

## Adding a database

Create the client in `container.ts`, close it in `dispose()`, and add a readiness check:

```ts
readinessChecks: [{ name: 'postgres', check: (signal) => pingDatabase(pool, signal) }],
```

The recommended data layer is Drizzle ORM (or Kysely), behind the feature's repository interface.

## Operations

- **Health**: `GET /health` returns 200 while the process can serve and never checks dependencies. `GET /ready` returns 503 when a readiness check fails or times out (2 s), or once shutdown has started. Point the Kubernetes liveness probe at `/health` and the readiness probe at `/ready`.
- **Shutdown**: on `SIGTERM`/`SIGINT` (or an uncaught exception), readiness flips to 503, Fastify stops accepting connections, in-flight requests finish, `onClose` hooks release resources, and the process exits. It is force-killed after `SHUTDOWN_GRACE_MS` (default 10 s). Keep this below the orchestrator's termination grace period (Kubernetes default: 30 s).
- **Logs**: one JSON object per line on stdout. `authorization`, `cookie` and `set-cookie` headers are redacted. Set `LOG_FORMAT=pretty` only locally (pino-pretty is a dev dependency).
- **Request IDs**: taken from `x-request-id` when present and returned in every problem response as `requestId`.

## Environment variables

| Name                | Default      | Notes                                                                  |
| ------------------- | ------------ | ---------------------------------------------------------------------- |
| `NODE_ENV`          | `production` | `development` / `test` / `production`                                  |
| `HOST`              | `0.0.0.0`    | Use `127.0.0.1` locally if you do not want to listen on all interfaces |
| `PORT`              | `3000`       |                                                                        |
| `LOG_LEVEL`         | `info`       | pino level, or `silent`                                                |
| `LOG_FORMAT`        | `json`       | `pretty` needs dev dependencies                                        |
| `SHUTDOWN_GRACE_MS` | `10000`      | Hard deadline for graceful shutdown                                    |

## TypeScript 7 and ESLint

TypeScript 7.0 (the native Go compiler) has no JavaScript API yet, and typescript-eslint 8 requires TypeScript `<6.1`. So `package.json` installs both:

- `"@typescript/native": "npm:typescript@^7.0.2"` provides the `tsc` binary used by `npm run typecheck`.
- `"typescript": "npm:@typescript/typescript6@^6.0.2"` gives typescript-eslint the 6.0 API it loads.

Drop the alias once typescript-eslint supports the TS 7 API (expected with TS 7.1).

## Docker

```sh
docker build -t ts-backend-boilerplate .
docker run --rm -p 3000:3000 ts-backend-boilerplate
```

Four stages: `deps` (all deps, cached) -> `build` (tsdown) -> `prod-deps` (`npm ci --omit=dev`) -> `runtime` (`dist/` + prod `node_modules`, `USER node`, exec-form `CMD` so Node gets `SIGTERM`). `--ignore-scripts` keeps dependency install scripts and husky out of the image.

## CI

`.github/workflows/ci.yml` runs: format check, lint and typecheck; tests with coverage on Node 24 and 26; then build, a smoke test of the built server (`/health`, `/ready`) and a Docker build. Move this folder's `.github/` to the repository root if the service lives in a subdirectory.
