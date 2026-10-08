# Compiler configuration rules (TSC)

## The house tsconfig

This is the boilerplate's `tsconfig.json`, copied verbatim. Every flag below is a MUST unless a rule says otherwise. The same flags (plus `esnext.disposable` in `lib`) typecheck every sample in this guide (`phase-5/snippet-check`).

```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    /* Language and environment: Node 24 LTS runs ES2025 natively. */
    "target": "es2025",
    "lib": ["es2025"],
    "types": ["node"],

    /* Modules: native ESM resolved exactly the way Node resolves it. */
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "moduleDetection": "force",
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,

    /* Only syntax Node's type stripping can erase: no enums, namespaces,
       parameter properties or legacy decorators. */
    "erasableSyntaxOnly": true,

    /* tsc only typechecks; tsdown emits. Imports carry their real .ts extension. */
    "noEmit": true,
    "allowImportingTsExtensions": true,

    /* Type safety: strict plus every flag that catches real bugs. */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "forceConsistentCasingInFileNames": true,

    /* Do not typecheck third-party .d.ts files. */
    "skipLibCheck": true
  },
  "include": ["src", "test", "*.config.ts"]
}
```

### TSC-001 `strict` plus the extra safety flags
**Level:** MUST
**Rubric:** R4 M5 S5 D3 C5
**Rule:** Turn on `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals` and `noUnusedParameters`. Never turn one off per file.
**Sources:** A-007, A-008, A-050, A-052, A-053, B-01, phase-3/boilerplate-deep-dive.md

### TSC-002 Module settings mirror Node exactly
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** Set `module` and `moduleResolution` to `nodenext`, plus `moduleDetection: force` and `verbatimModuleSyntax`. Do not use `bundler` resolution for code that Node runs or tests unbundled. `node10`/`classic` are removed in TS 7.
**Sources:** A-016, A-017, A-030, A-001

### TSC-003 Erasable syntax only
**Level:** MUST
**Rubric:** R4 M5 S4 D5 C4
**Rule:** Set `erasableSyntaxOnly` and `isolatedModules`. Together they guarantee that Node type stripping, Vitest and tsdown can each transpile a file on its own.
**Sources:** A-010, A-024, A-025, V-04

### TSC-004 `tsc` typechecks; it does not emit
**Level:** MUST
**Rubric:** R4 M5 S4 D5 C4
**Rule:** Apps set `noEmit` and `allowImportingTsExtensions`, and source imports use real `.ts` extensions. A bundler (tsdown) produces `dist/`. A library that `tsc` emits instead uses `rewriteRelativeImportExtensions` plus `isolatedDeclarations`.
**Sources:** A-005, A-009, A-071, BUILD-001

### TSC-005 Target the runtime you run
**Level:** MUST
**Rubric:** R4 M4 S4 D5 C4
**Rule:** `target`/`lib` match the minimum Node: `es2025` for Node 24. `lib` contains no `dom`. `types: ["node"]` is explicit, because TS 6/7 default it to `[]`.
**Sources:** A-001, A-002, A-060, V-05

### TSC-006 No `baseUrl`, no `paths`
**Level:** MUST NOT
**Rubric:** R4 M5 S5 D5 C3
**Rule:** Aliases come from `package.json#imports` (STRUCT-002). TS 7 removed `baseUrl`, and `paths` does not exist at runtime.
**Sources:** A-001, A-014, A-016

### TSC-007 `skipLibCheck: true`
**Level:** MUST
**Rubric:** R4 M3 S5 D5 C5
**Rule:** Do not typecheck third-party `.d.ts` files. That is where nearly all of the cost and most false positives come from, and it shields you from dependencies that don't use `exactOptionalPropertyTypes`.
**Sources:** A-059, A-008

### TSC-008 Typecheck tests and config files with the same tsconfig
**Level:** MUST
**Rubric:** R4 M5 S4 D3 C4
**Rule:** `include` covers `src`, `test` and `*.config.ts`. Do not keep a laxer `tsconfig.test.json`.
**Sources:** A-007, phase-3/boilerplate-deep-dive.md

### TSC-009 Project references only for multi-package repos
**Level:** RESTRICT
**Rubric:** R3 M4 S5 D4 C4
**Rule:** Use `composite` + `references` once a workspace has 3 or more TS packages. A single app stays one project.
**Sources:** A-068, A-089

### TSC-010 Two TypeScript packages: TS 7 for `tsc`, TS 6 for API consumers
**Level:** MUST (until TS 7.1 ships its API)
**Rubric:** R3 M4 S4 D5 C3
**Rule:** Set `"@typescript/native": "npm:typescript@^7.0.2"` (it provides the `tsc` binary used by `npm run typecheck`) and `"typescript": "npm:@typescript/typescript6@^6.0.2"` (the JS API that typescript-eslint loads). Remove the alias when typescript-eslint supports TS 7.1's API.
**Why:** TS 7 is about 10x faster (measured in phase-3/bench), but TS 7.0 has no JS API, and typescript-eslint peers on `typescript <6.1`. The TS team's own announcement documents this dual install.
**Enforcement:** `npm run typecheck` resolves `tsc` to TS 7. The boilerplate's verify log records `tsc --version`.
**Sources:** V-01, V-02, V-03, A-001, A-042, A-067, ADR-0009
