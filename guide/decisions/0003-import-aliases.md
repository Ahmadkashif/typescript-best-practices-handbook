# ADR-0003 Import aliases: `package.json#imports`

- **Status:** Accepted
- **Decision:** Set `"imports": { "#src/*": "./src/*", "#test/*": "./test/*" }`. Specifiers carry `.ts`. `../` imports are banned by lint. No tsconfig `paths`/`baseUrl`, `module-alias` or `tsconfig-paths`.
- **Evidence:**
  - Node, TS `nodenext`, Vitest and tsdown all resolve `#imports` natively (A-014, A-016).
  - TS 7 removed `baseUrl` (A-001).
  - `paths` is compile-time only, so it needs a runtime shim or a bundler rewrite.
- **Conflict:** popularity. In the survey, `paths` is the majority alias method and `#imports` is used by 1 of 270 repos (2 of the 32 deep-read). The evidence beats inertia: R5 M5 S5 D5 vs C2.
- **Consequences:** Editors need TS 5.4+ for `#` completions; every current editor qualifies.
