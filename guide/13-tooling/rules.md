# Tooling rules (TOOL)

### TOOL-001 ESLint 10 flat config with type-aware typescript-eslint
**Level:** MUST
**Rubric:** R4 M5 S4 D3 C4
**Rule:** Start from `eslint.config.js` with `js.configs.recommended`, `tseslint.configs.strictTypeChecked` and `stylisticTypeChecked`, using `projectService` and `--max-warnings=0`. Add the house rules from the boilerplate:
- `switch-exhaustiveness-check`, `consistent-type-imports`/`exports`;
- `no-floating-promises`, `no-misused-promises`, `require-await`, `prefer-readonly`;
- `no-console`, `eqeqeq`, `no-param-reassign`;
- `no-restricted-syntax` banning enums and namespaces;
- `no-restricted-imports` banning `../`;
- `reportUnusedDisableDirectives: 'error'`.

**Why:** Only type-aware rules catch floating promises and unsafe `any` flows. Biome v2 and oxlint are faster but cover a subset (Biome's floating-promise detection reaches about 75%). ESLint is the consensus linter.
**Sources:** A-020, A-021, A-022, A-040, A-041, phase-3/boilerplate-deep-dive.md, ADR-0009

### TOOL-002 Prettier formats; ESLint does not format
**Level:** MUST
**Rubric:** R5 M4 S4 D3 C4
**Rule:** Use Prettier 3 (`singleQuote: true`, `printWidth: 100`, everything else default), with `eslint-config-prettier` last in the ESLint config. CI runs `format:check`. No style debates in review.
**Sources:** phase-3/boilerplate-deep-dive.md (Prettier 19 of 32, singleQuote 17 of 20), A-022

### TOOL-003 Git hooks are fast and mirror CI
**Level:** MUST
**Rubric:** R4 M4 S4 D3 C4
**Rule:** Use husky 9. `pre-commit` runs lint-staged (Prettier + ESLint on staged files). `pre-push` runs typecheck plus unit tests. CI stays the authority, because hooks can be skipped.
**Sources:** phase-3/boilerplate-deep-dive.md (husky 16 of 32)

### TOOL-004 Scripts are the interface
**Level:** MUST
**Rubric:** R5 M5 S4 D4 C4
**Rule:** Every repo exposes the same npm scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `format`, `format:check`, `test`, `test:unit`, `test:integration`, `test:coverage`, `check`. CI and humans call scripts, never raw tool commands.
**Sources:** boilerplate `package.json`, A-076

### TOOL-005 No TS runner dependencies for development
**Level:** PREFER
**Rubric:** R4 M5 S4 D4 C3
**Rule:** Use `node --watch --env-file-if-exists=.env src/main.ts` (native type stripping). Do not add `ts-node`, `ts-node-dev` or `nodemon`. `tsx` is acceptable only for scripts that need non-erasable syntax, which this guide bans anyway.
**Sources:** A-009, A-010, A-012, V-04, phase-3/bench/results.md

### TOOL-006 Revisit the lint stack when TS 7.1 ships
**Level:** PREFER (tracked)
**Rubric:** R3 M4 S4 D4 C3
**Rule:** When TS 7.1's API is out and typescript-eslint supports it, drop the `@typescript/typescript6` alias (TSC-010). Re-benchmark Biome/oxlint type-aware rules against `strictTypeChecked` before considering a switch.
**Sources:** A-042, A-067, V-02
