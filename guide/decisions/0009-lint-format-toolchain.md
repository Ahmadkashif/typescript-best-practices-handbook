# ADR-0009 Lint, format and TypeScript toolchain

- **Status:** Accepted. Revisit when TS 7.1 ships its API.
- **Decision:**
  - ESLint 10 flat config + typescript-eslint `strictTypeChecked` + `stylisticTypeChecked`, with `--max-warnings=0`.
  - Prettier 3 for formatting.
  - husky 9 + lint-staged for git hooks.
  - Two TypeScript packages: `@typescript/native` = `typescript@^7.0.2`, which supplies the `tsc` binary (typecheck), and `typescript` = `@typescript/typescript6@^6.0.2`, which supplies the API typescript-eslint loads.
- **Evidence:**
  - typescript-eslint peers on `typescript <6.1` (V-03), and TS 7.0 has no API (V-02). This dual install is the TS team's own recipe.
  - TS 7 typechecks 7.6x faster (bench section 2).
  - ESLint is used in 18 of 32 deep-read repos, Prettier in 19 of 32, husky in 16 of 32.
  - Biome and oxlint are rising but have smaller type-aware coverage (A-040).
- **Verified:** the boilerplate's `npm ci` resolves tsc 7.0.2 and tsc6 6.0.3, and lint and typecheck both pass (phase-5/verify.log).
- **Rubric:** R4 M5 S4 D4 C4
