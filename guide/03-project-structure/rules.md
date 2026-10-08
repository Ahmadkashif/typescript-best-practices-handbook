# Project structure rules (STRUCT)

## Reference layout (as built in `boilerplate/`)

```
package.json        "type": "module", engines >=24.12, "imports": { "#src/*": "./src/*", "#test/*": "./test/*" }
tsconfig.json       house config (02-compiler-config), noEmit
tsdown.config.ts    bundles src/main.ts -> dist/main.js
vitest.config.ts    projects: unit (src/**/*.test.ts), integration (test/integration)
eslint.config.js    flat config, type-aware
src/
  main.ts           the only file with import-time side effects: config -> container -> app -> listen + shutdown
  app.ts            buildApp(container): Fastify instance, plugins, error handler, routes (no listen)
  container.ts      composition root
  config/env.ts     Zod env schema -> frozen Config
  http/             cross-cutting HTTP: error-handler.ts, health.ts
  lib/              dependency-free utilities: errors, logger, assert-never, brand, decimal, retry, time
  modules/<feature>/  <feature>.schema.ts, .repository.ts, .service.ts, .routes.ts, *.test.ts
test/
  helpers.ts        createTestApp()
  integration/*.test.ts
```

### STRUCT-001 ESM only
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C4
**Rule:** Set `"type": "module"` in every package. No `.cjs` source, no `require`, no `__dirname` (use `import.meta.dirname`).
**Why:** TS 7 defaults to ESM. `require(esm)` is stable, so CJS consumers are still served. The survey shows ESM share climbing in active repos and TS>=6 adopters.
**Sources:** A-015, A-048, A-049, A-143, phase-2/boilerplates.md, ADR-0002

### STRUCT-002 Aliases via `package.json#imports` only
**Level:** MUST
**Rubric:** R5 M5 S5 D5 C2
**Rule:** Non-sibling imports use `#src/...` with the real `.ts` extension. Sibling imports use `./x.ts`. `../` is banned. tsconfig `paths`, `module-alias` and `tsconfig-paths` are banned.
```ts
// in src/modules/todos/todo.service.ts
// import { NotFoundError } from '#src/lib/errors.ts';   // good: alias
// import { NotFoundError } from '../../lib/errors.ts';  // bad: lint error (no-restricted-imports)
export {};
```
**Why:** Node, TypeScript (`nodenext`), Vitest and tsdown resolve `#imports` natively, so no runtime shim or build rewrite is needed. `baseUrl` is gone in TS 7, and `paths` is compile-time only. The survey shows `paths` as the popular choice (about 1/3 of repos) and `#imports` as rare (2 of the 32 deep-read repos). This rule deliberately overrides popularity with the platform docs: consensus scores C2, every other axis scores 5.
**Enforcement:** `no-restricted-imports` pattern `../*` (boilerplate), TSC-006.
**Sources:** A-014, A-016, A-001, phase-3/boilerplate-deep-dive.md, ADR-0003

### STRUCT-003 Explicit file extensions in every relative or alias import
**Level:** MUST
**Rubric:** R4 M5 S4 D5 C5
**Rule:** Write `import { x } from './x.ts'`. Node ESM resolution and type stripping need the extension.
**Sources:** A-075, A-010

### STRUCT-004 `import type` for types
**Level:** MUST
**Rubric:** R4 M4 S4 D5 C5
**Rule:** Type-only imports use `import type` or inline `type` specifiers, so they are erased with no side effects.
```ts
import type { FastifyInstance } from 'fastify';
export function routeCount(app: FastifyInstance): string { return app.printRoutes(); }
```
**Enforcement:** `verbatimModuleSyntax`, plus the `consistent-type-imports` and `no-import-type-side-effects` lint rules (boilerplate).
**Sources:** A-062, A-010, A-007

### STRUCT-005 Only `main.ts` has import-time side effects
**Level:** MUST
**Rubric:** R4 M5 S4 D4 C4
**Rule:** Modules export functions, types and constants. Importing a module must not connect to anything, read env or start timers. `buildApp()` builds the app but does not listen, so tests can build it freely.
**Sources:** B-03, A-076, phase-3/boilerplate-deep-dive.md

### STRUCT-006 Feature files named by role
**Level:** PREFER
**Rubric:** R5 M4 S4 D3 C3
**Rule:** Use `<feature>.schema.ts` (Zod schemas and inferred types), `<feature>.repository.ts` (port + adapters), `<feature>.service.ts` (business logic), `<feature>.routes.ts` (Fastify plugin), and colocated `*.test.ts`.
**Sources:** A-102, A-076

### STRUCT-007 Monorepos: npm workspaces, one TS version, internal packages via `exports`
**Level:** PREFER
**Rubric:** R4 M5 S5 D4 C4
**Rule:** Use one root lockfile and one TypeScript version. Packages publish ESM with an `exports` map. Use project references once there are 3+ packages (TSC-009). Do not deep-import another package's `src/`.
**Sources:** A-068, A-088, A-089
