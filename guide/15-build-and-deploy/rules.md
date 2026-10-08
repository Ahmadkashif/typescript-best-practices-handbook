# Build and deploy rules (BUILD)

Describes `boilerplate/` as built and verified (`phase-5/verify.log`: OVERALL PASS).

## Pipeline as built

| Stage | Command | Tool |
|---|---|---|
| Install | `npm ci` (Docker: `--ignore-scripts`) | npm 11, committed lockfile |
| Format | `npm run format:check` | Prettier 3 |
| Lint | `npm run lint` | ESLint 10 + typescript-eslint (strictTypeChecked) on the `@typescript/typescript6` API |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | **TypeScript 7.0.2** (`@typescript/native`), 0.3 s on the boilerplate |
| Test | `npm run test:coverage` | Vitest 5, unit + integration projects, v8 coverage thresholds (80/80/75/80) |
| Build | `npm run build` | tsdown: `src/main.ts` -> `dist/main.js` (one ESM file, sourcemap, dependencies external) |
| Start | `npm start` = `node --enable-source-maps dist/main.js` | Node 24 LTS |
| Image | `docker build .` | 4-stage Dockerfile on `node:24.21.0-alpine3.23` |

### BUILD-001 Typecheck with tsc, emit with a bundler
**Level:** MUST
**Rubric:** R4 M5 S4 D5 C4
**Rule:** `tsc` (TS 7) is the type gate and never emits for apps. tsdown bundles the app into `dist/` with npm dependencies external. Libraries emit with `tsc` (TSC-004).
**Why:** The bundle starts about 1.8x faster than unbundled output, and `#src` aliases plus `.ts` extensions vanish at build time. TS 7 makes typechecking cheap enough to run on every push.
**Sources:** phase-3/bench/results.md section 2, A-009, A-066, phase-3/boilerplate-deep-dive.md

### BUILD-002 Multi-stage Dockerfile: deps -> build -> prod-deps -> runtime
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:**
- The runtime stage contains only `dist/`, production `node_modules` (`npm ci --omit=dev --ignore-scripts`) and `package.json`.
- Use BuildKit cache mounts for `~/.npm`.
- Every stage uses the same base image and libc, so native addons survive.
- The `.dockerignore` excludes `node_modules`, `.git`, `.env*`, `coverage` and `dist`.
**Sources:** A-081, A-083, A-128, phase-3/boilerplate-deep-dive.md (a glibc-to-musl copy bug seen in a popular repo)

### BUILD-003 Run `node` directly as a non-root user; exec-form CMD
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** Use `USER node` and `CMD ["node", "--enable-source-maps", "dist/main.js"]`. Never use `npm start` in a container: npm does not forward signals reliably, and it adds a process. Node as PID 1 is fine because `main.ts` handles SIGTERM and SIGINT. Verified: `docker stop` took 0.13 s, exit 0.
**Sources:** A-081, A-083, A-087, phase-5/verify.log

### BUILD-004 Base image: pinned Node LTS; the variant is chosen by ADR
**Level:** MUST (pinning) / PREFER (variant)
**Rubric:** R3 M4 S4 D5 C3
**Rule:** Pin the full tag (`node:24.21.0-alpine3.23`) and move it with Renovate. The boilerplate ships Alpine, the survey majority (12 of 20 Dockerfiles). Its image is 271 MB unpacked, of which the app layers are 26.7 MB.

Measured compressed runtime sizes (phase-3/bench section 5, same app):

| Base | Compressed | Notes |
|---|---|---|
| distroless `nodejs24-debian13:nonroot` | **55.6 MB** | glibc, non-root by default, no shell |
| alpine | 61.9 MB | musl |
| slim | 81.1 MB | glibc, has a shell |

The bench therefore recommends distroless and AVOID Alpine (musl is an experimental-tier Node platform). That disagrees with the as-built Alpine choice and is recorded as open question OQ-1 in ADR-0011. Teams with native addons or glibc-only binaries MUST use `node:24-slim` for build and a slim or distroless runtime.
**Sources:** A-126, A-133, A-134, phase-3/boilerplate-deep-dive.md, phase-3/bench/results.md, ADR-0011

### BUILD-005 No migrations or other one-off jobs in the container CMD
**Level:** MUST NOT
**Rubric:** R4 M5 S5 D4 C4
**Rule:** Run migrations as a separate deploy step or job before rollout (DATA-002). The app container only serves.
**Sources:** A-114, phase-3/boilerplate-deep-dive.md (anti-pattern seen in a surveyed repo)

### BUILD-006 CI: quality, test matrix, build plus smoke test plus image
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C4
**Rule:** GitHub Actions with three jobs:
1. **quality:** format check, lint, typecheck.
2. **test:** a Node 24 and 26 matrix with coverage.
3. **build:** build, boot the built server and curl `/health`, then `docker build` with the GHA cache.

`setup-node` reads `.nvmrc`. Set `permissions: contents: read`. Pin third-party actions to commit SHAs (SEC-006; the boilerplate currently uses major tags, see open questions).
**Sources:** A-141, phase-3/boilerplate-deep-dive.md (GHA in 25 of 32 repos; job split from jsynowiec)

### BUILD-007 Health endpoints wired to the orchestrator
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** Kubernetes probes:
- liveness: `/health`;
- readiness: `/ready`;
- startup: `/health`, with a generous `failureThreshold`.

Set `terminationGracePeriodSeconds` above `SHUTDOWN_GRACE_MS` (default 10 s). The Docker `HEALTHCHECK` is for Compose and plain Docker only.
**Sources:** A-123, A-087, HTTP-005, HTTP-007

### BUILD-008 Source maps on in production
**Level:** PREFER
**Rubric:** R4 M4 S4 D3 C4
**Rule:** Ship the `.map` next to the bundle and start with `--enable-source-maps`, so stack traces point at TS lines.
**Sources:** catalog (Node `--enable-source-maps`), boilerplate
