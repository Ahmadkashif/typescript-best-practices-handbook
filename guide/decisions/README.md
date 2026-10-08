# Decision records

| ADR | Decision |
|---|---|
| [0001](0001-http-framework.md) | Fastify 5 (Hono by ADR; Express and Nest AVOID) |
| [0002](0002-esm-only.md) | ESM only, nodenext |
| [0003](0003-import-aliases.md) | `package.json#imports` (`#src/*`), no `paths` |
| [0004](0004-validation.md) | Zod 4 everywhere |
| [0005](0005-error-model.md) | `AppError` + RFC 9457, Result for domain outcomes, crash on bugs |
| [0006](0006-dependency-injection.md) | Pure DI, `src/container.ts` |
| [0007](0007-data-access.md) | Repository port per feature; Drizzle (or Kysely) for the first DB |
| [0008](0008-test-runner.md) | Vitest 5, unit + integration projects |
| [0009](0009-lint-format-toolchain.md) | ESLint type-aware + Prettier + husky; TS 7 tsc + TS 6 API alias |
| [0010](0010-build-and-run.md) | Dev with type stripping, prod with a tsdown bundle |
| [0011](0011-container-base-image.md) | Alpine as built; distroless is open question OQ-1 |
