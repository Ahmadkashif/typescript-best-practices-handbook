# ADR-0010 Build and run

- **Status:** Accepted
- **Decision:**
  - **Dev:** `node --watch --env-file-if-exists=.env src/main.ts` (native type stripping, no tsx).
  - **Build:** tsdown bundles `src/main.ts` into `dist/main.js` (ESM, sourcemap, npm dependencies external).
  - **Prod:** `node --enable-source-maps dist/main.js`.
  - **Typecheck:** `tsc --noEmit` (TS 7) in CI and pre-push.
- **Evidence (bench sections 2 and 6):**
  - The bundle starts 37-50% faster than unbundled output.
  - Type stripping adds 15-63% to start-up, and tsx is worse still.
  - tsdown takes about 230 ms, mostly tool start-up.
  - tsc 7 emit would be fast enough, but it cannot rewrite `#src` aliases.
- **Rubric:** R4 M5 S4 D5 C3
- **Follow-up:** enable the compile cache (PERF-008), worth another 15-25% on boot.
