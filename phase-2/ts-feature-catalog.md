# Phase 2A: TypeScript + Node Feature Catalog

Sources: TS handbook release notes 1.x-5.9 (typescriptlang.org/docs/handbook/release-notes/*), "Announcing TypeScript 6.0" and "Announcing TypeScript 7.0" (devblogs.microsoft.com/typescript), Node.js v26.10.0 docs (nodejs.org/api/typescript.html and related pages). Verified 2026-10-06. Release notes were re-checked live for 5.7, 5.8, 5.9, 6.0 and 7.0. Earlier versions come from the handbook release-notes index.

Legend. **Erasable** = Node's type stripping can delete the construct without a code transform (it is compatible with `erasableSyntaxOnly`). **Verdict**: USE = default-on, RESTRICT = allowed only under the stated condition, BAN = lint/tsconfig must reject it. Every verdict is only a proposal here. Phase 3 scores it against the rubric.

## A. Type-system features

| # | Feature | Introduced | Category | Erasable | Verdict | Reason |
|---|---|---|---|---|---|---|
| 1 | Primitive type annotations (`string`, `number`, `boolean`, `bigint`, `symbol`) | 1.0 / bigint 3.2 | type-system | Y | USE | Core |
| 2 | `interface` | 1.0 | type-system | Y | USE | Use for object shapes that may be extended. Fine either way, but pick one consistently (`consistent-type-definitions`) |
| 3 | `type` aliases | 1.0 | type-system | Y | USE | Required for unions, mapped and conditional types |
| 4 | Union types | 1.4 | type-system | Y | USE | The foundation of domain modelling |
| 5 | Intersection types | 1.6 | type-system | Y | USE | Composition and brands |
| 6 | Type guards (`typeof`/`instanceof` narrowing) | 1.4 | type-system | Y | USE | Control-flow safety |
| 7 | User-defined type predicates (`x is T`) | 1.6 | type-system | Y | RESTRICT | Only in parsers and guards that have unit tests. They are unchecked assertions |
| 8 | Inferred type predicates | 5.5 | type-system | Y | USE | `filter(x => x !== undefined)` narrows for free |
| 9 | Assertion functions (`asserts x is T`) | 3.7 | type-system | Y | USE | `assert`/`invariant` helpers. Needs an explicit annotation on the call target |
| 10 | Discriminated (tagged) unions | 2.0 | type-system | Y | USE | Model state and results. Pair with exhaustive `switch` |
| 11 | `never` type and exhaustiveness checks | 2.0 | type-system | Y | USE | `assertNever` default branch |
| 12 | Control-flow analysis (CFA) | 2.0 | type-system | Y | USE | Core |
| 13 | CFA for aliased conditions and discriminants | 4.4 | type-system | Y | USE | Keeps destructured narrowing working |
| 14 | Narrowing in closures after last assignment | 5.4 | type-system | Y | USE | Free improvement |
| 15 | `strictNullChecks` (`null`/`undefined` as distinct types) | 2.0 | compiler flag | n/a | USE | Mandatory |
| 16 | `unknown` | 3.0 | type-system | Y | USE | Prefer it to `any` at every boundary |
| 17 | `any` | 1.0 | type-system | Y | BAN | Use `unknown`. Lint `no-explicit-any` plus `no-unsafe-*` |
| 18 | `object` type | 2.2 | type-system | Y | USE | Rarely needed |
| 19 | `{}`/`Object` as a type | 1.0 | type-system | Y | BAN | Means "any non-nullish value". Lint `no-empty-object-type`/`no-wrapper-object-types` |
| 20 | Literal types (string/number/boolean) | 1.8/2.0 | type-system | Y | USE | Core |
| 21 | Template literal types | 4.1 | type-system | Y | RESTRICT | Fine for keys and IDs. Avoid type-level parsers (compile cost) |
| 22 | Key remapping in mapped types (`as`) | 4.1 | type-system | Y | RESTRICT | Library/util code only |
| 23 | Mapped types | 2.1 | type-system | Y | USE | Through standard utilities. Custom ones only in `lib/` |
| 24 | Mapped type modifiers (`-readonly`, `-?`) | 2.8 | type-system | Y | RESTRICT | Library code only |
| 25 | Conditional types | 2.8 | type-system | Y | RESTRICT | Utility/library code only. Not allowed in domain code |
| 26 | `infer` | 2.8 | type-system | Y | RESTRICT | Same as conditional types |
| 27 | `infer ... extends` constraints | 4.7 | type-system | Y | RESTRICT | Same |
| 28 | Distributive conditional types | 2.8 | type-system | Y | RESTRICT | Same. Wrap in `[T]` when non-distributive behaviour is wanted |
| 29 | Recursive type aliases | 3.7 | type-system | Y | RESTRICT | JSON types etc. Watch instantiation depth |
| 30 | Recursive conditional types | 4.1 | type-system | Y | RESTRICT | Library only. Slow type checking |
| 31 | Tail-recursion elimination on conditional types | 4.5 | type-system | Y | RESTRICT | Same |
| 32 | Built-in utility types (`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `InstanceType`, `Awaited`) | 2.1-4.5 | type-system | Y | USE | Standard vocabulary |
| 33 | `Awaited<T>` | 4.5 | type-system | Y | USE | Correct promise unwrapping |
| 34 | Intrinsic string types (`Uppercase`, etc.) | 4.1 | type-system | Y | USE | Cheap |
| 35 | `NoInfer<T>` | 5.4 | type-system | Y | USE | Stops wrong inference sites in generic APIs |
| 36 | Generics | 1.0 | type-system | Y | USE | Bind each type parameter at least twice. Otherwise use a concrete type (lint `no-unnecessary-type-parameters`) |
| 37 | Generic parameter defaults | 2.3 | type-system | Y | USE | |
| 38 | `const` type parameters | 5.0 | type-system | Y | USE | Infer literals without `as const` at call sites |
| 39 | Variance annotations (`in`/`out`) | 4.7 | type-system | Y | RESTRICT | Only to fix measured check-time problems in library types |
| 40 | Higher-order function type inference | 3.4 | type-system | Y | USE | |
| 41 | Variadic tuple types | 4.0 | type-system | Y | RESTRICT | Library only (pipe/compose typings) |
| 42 | Labeled tuple elements | 4.0 | type-system | Y | USE | Self-documenting tuples. Prefer objects for >2 fields |
| 43 | Optional/rest tuple elements | 3.0 | type-system | Y | USE | |
| 44 | `readonly` arrays/tuples (`readonly T[]`) | 3.4 | type-system | Y | USE | Default for function parameters |
| 45 | `as const` (const assertions) | 3.4 | type-system | Y | USE | Replaces enums. Literal config tables |
| 46 | `satisfies` operator | 4.9 | type-system | Y | USE | Validate a shape without widening. Prefer it to annotations on config objects |
| 47 | Type assertions `as T` | 1.0 | type-system | Y | RESTRICT | Only after runtime validation, or in tests. Lint `consistent-type-assertions` (no object literal assertions) |
| 48 | Non-null assertion `!` | 2.0 | type-system | Y | BAN | Use narrowing or `invariant`. Lint `no-non-null-assertion` |
| 49 | Definite assignment assertion `let x!: T` | 2.7 | type-system | Y | BAN | It hides real bugs |
| 50 | Double assertion `x as unknown as T` | 1.0 | type-system | Y | BAN | Allowed only in `lib/` adapters, with a comment |
| 51 | `keyof` | 2.1 | type-system | Y | USE | |
| 52 | Indexed access types `T[K]` | 2.1 | type-system | Y | USE | |
| 53 | `typeof` type queries | 1.0 | type-system | Y | USE | Derive types from values (`as const` tables, schemas) |
| 54 | `unique symbol` | 2.7 | type-system | Y | RESTRICT | Brand keys in `lib/brand.ts` only |
| 55 | Branded/nominal types (intersection with a brand) | pattern | type-system | Y | USE | IDs, money, validated strings |
| 56 | Index signatures | 1.0 | type-system | Y | RESTRICT | Prefer `Map` or `Record<K, V>` with a finite K |
| 57 | Template string pattern index signatures | 4.4 | type-system | Y | RESTRICT | Library only |
| 58 | Symbol and template index signatures | 4.4 | type-system | Y | RESTRICT | Same |
| 59 | Optional properties `?` | 1.0 | type-system | Y | USE | Combine with `exactOptionalPropertyTypes` |
| 60 | `readonly` properties | 2.0 | type-system | Y | USE | Default for domain objects |
| 61 | Function overloads | 1.0 | type-system | Y | RESTRICT | Only when a union-typed parameter or a generic cannot express the API. Never in app code |
| 62 | `this` parameter typing | 2.0 | type-system | Y | RESTRICT | Rare in modern code |
| 63 | `this` types (polymorphic `this`) | 1.7 | type-system | Y | RESTRICT | Fluent builders in libraries |
| 64 | Declaration merging (interfaces) | 1.0 | type-system | Y | RESTRICT | Only for module augmentation (e.g. `FastifyRequest`). Never merge app interfaces accidentally |
| 65 | Module augmentation (`declare module 'x'`) | 1.8 | type-system | Y | RESTRICT | Single `src/types/*.d.ts` per library being augmented |
| 66 | Global augmentation (`declare global`) | 1.8 | type-system | Y | BAN | Except typed `process.env` via schema, which is preferred anyway |
| 67 | Ambient declarations (`declare const/function`) | 1.0 | type-system | Y | RESTRICT | Only in `.d.ts` files for untyped deps |
| 68 | Triple-slash directives (`/// <reference>`) | 1.0 | syntax | Y | BAN | Use imports and `types` in tsconfig. `no-default-lib` removed in 6.0 |
| 69 | Abstract classes and abstract members | 1.6 | syntax | Y | RESTRICT | Erasable. Prefer interfaces plus functions. Allowed for framework base classes |
| 70 | Abstract constructor types | 4.2 | type-system | Y | RESTRICT | Library only |
| 71 | `override` keyword (+`noImplicitOverride`) | 4.3 | syntax | Y | USE | If you use inheritance, it MUST be explicit |
| 72 | Accessibility modifiers `private`/`protected`/`public` | 1.0 | syntax | Y | RESTRICT | Type-only privacy. Prefer JS `#private` for real encapsulation. `public` is noise |
| 73 | Parameter properties (`constructor(private x: X)`) | 1.0 | syntax-runtime | **N** | BAN | Not erasable, so it fails under Node type stripping and `erasableSyntaxOnly` |
| 74 | `enum` (numeric/string) | 1.0/2.4 | syntax-runtime | **N** | BAN | Not erasable, numeric enums are unsound, and there are reverse mappings. Use an `as const` object plus a union |
| 75 | `const enum` | 1.4 | syntax-runtime | **N** | BAN | Breaks `isolatedModules`. Not erasable |
| 76 | `declare enum` | 1.0 | syntax | Y | BAN | Same hazards. Only acceptable in third-party `.d.ts` files |
| 77 | `namespace` with values | 1.5 | syntax-runtime | **N** | BAN | Use ES modules |
| 78 | Type-only `namespace` / `declare namespace` | 1.5 | syntax | Y | RESTRICT | Only in `.d.ts` augmentation, e.g. `declare namespace NodeJS` |
| 79 | `module Foo {}` legacy keyword | 1.0 | syntax | N | BAN | Error in 6.0/7.0 |
| 80 | `import x = require()` / `import X = N.Y` aliases | 1.0 | syntax-runtime | **N** | BAN | Not erasable. Use ESM imports |
| 81 | `export =` | 1.0 | module | N | BAN | CJS-only. Write ESM |
| 82 | Legacy `experimentalDecorators` | 1.5 | syntax-runtime | **N** | BAN | Non-standard. Not erasable. Only via a framework that requires it (Nest), which this house does not use |
| 83 | `emitDecoratorMetadata` / reflect-metadata | 1.5 | compiler flag | N | BAN | Reflection-based DI is incompatible with esbuild/type stripping |
| 84 | TC39 standard decorators | 5.0 | syntax-runtime | **N** | RESTRICT | Valid JS, but V8 does not ship them natively yet and Node type stripping does not transform them. Avoid until native |
| 85 | Decorator metadata (`Symbol.metadata`) | 5.2 | syntax-runtime | N | BAN | Same reason |
| 86 | `accessor` keyword (auto-accessors) | 4.9 | syntax-runtime | N | BAN | Decorator companion. Not natively supported |
| 87 | `#private` fields (ES) | 3.8 | syntax-runtime | Y (it is JS) | USE | Real runtime privacy |
| 88 | `#x in obj` brand checks | 4.5 | syntax-runtime | Y | USE | |
| 89 | Class static blocks | 4.4 | syntax-runtime | Y | AVOID | Usually hidden module-level side effects |
| 90 | `useDefineForClassFields` semantics | 3.7 | compiler flag | n/a | USE | Default for ES2022+ targets. Matches JS |
| 91 | `using` / `await using` (explicit resource management) | 5.2 | syntax-runtime | Y (it is JS) | USE | Native in V8 since Node 24. Use it for locks, transactions and temp resources. Requires `esnext.disposable` lib or target es2025+ |
| 92 | `Symbol.dispose` / `DisposableStack` / `AsyncDisposableStack` | 5.2 | lib | Y | USE | Same |
| 93 | Optional chaining `?.` / nullish coalescing `??` | 3.7 | syntax-runtime | Y | USE | Prefer `??` to `||` (lint `prefer-nullish-coalescing`) |
| 94 | Logical assignment `??=` etc. | 4.0 | syntax-runtime | Y | USE | |
| 95 | Top-level await | 3.8 | syntax-runtime | Y | RESTRICT | ESM entrypoint only. Not in library modules: it blocks the importers and breaks `require(esm)` |
| 96 | `import type` / `export type` | 3.8 | module | Y | USE | Mandatory via `verbatimModuleSyntax` |
| 97 | Inline `type` modifiers on import names | 4.5 | module | Y | USE | Same |
| 98 | `export * as ns` | 3.8 | module | Y | AVOID | Hurts tree-shaking and readability |
| 99 | Barrel files (`index.ts` re-exports) | pattern | module | Y | RESTRICT | One public `index.ts` per feature module only. No deep barrels |
| 100 | Default exports | 1.5 | module | Y | BAN | Use named exports (lint `import/no-default-export`). Exception: config files that tools require |
| 101 | Dynamic `import()` | 2.4 | module | Y | RESTRICT | Lazy optional deps and plugin loading only |
| 102 | Import attributes `with { type: 'json' }` | 5.3 | module | Y | USE | JSON imports in ESM. `asserts` was removed in 6.0/7.0 |
| 103 | `import defer` | 5.9 | module | Y | AVOID | Stage 3 and not in Node yet. Revisit later |
| 104 | `resolution-mode` in import types | 5.3 | module | Y | RESTRICT | Library dual-format typings only |
| 105 | `satisfies` with `as const` (`as const satisfies T`) | 4.9 | type-system | Y | USE | Literal tables checked against a contract |
| 106 | `@ts-ignore` | 2.6 | comment | Y | BAN | Use `@ts-expect-error` with a description (lint `ban-ts-comment`) |
| 107 | `@ts-expect-error` | 3.9 | comment | Y | RESTRICT | Requires a description. Tests only |
| 108 | `@ts-nocheck` | 3.7 | comment | Y | BAN | |
| 109 | JSDoc types in JS (`checkJs`) | 2.3 | compiler flag | n/a | RESTRICT | Only for JS config files |
| 110 | Getters/setters with unrelated types | 5.1 | type-system | Y | AVOID | Surprising |
| 111 | Unrelated return types for `undefined`-returning functions | 5.1 | type-system | Y | USE | |
| 112 | Checks for never-initialized variables | 5.7 | type-system | Y | USE | Free |
| 113 | Granular return-expression branch checks | 5.8 | type-system | Y | USE | Free |
| 114 | Regex syntax checking | 5.5 | type-system | Y | USE | Free |
| 115 | `${string}` IDs, e.g. `` `user_${string}` `` | 4.1 | type-system | Y | RESTRICT | Fine for prefixed IDs. Brands are usually better |
| 116 | Template literal Unicode code point preservation | 7.0 | type-system | Y | USE | Free |
| 117 | Stable type ordering (`stableTypeOrdering`) | 6.0 flag, always on in 7.0 | compiler | n/a | USE | Deterministic output |

## B. Compiler configuration (tsconfig)

| # | Flag | Introduced | Category | Verdict | Reason |
|---|---|---|---|---|---|
| 118 | `strict` (umbrella) | 2.3 | compiler flag | USE (MUST) | Default `true` in 6.0/7.0. Set it explicitly anyway |
| 119 | `noImplicitAny` | 1.0 | compiler flag | USE | Part of `strict` |
| 120 | `strictNullChecks` | 2.0 | compiler flag | USE | Part of `strict` |
| 121 | `strictFunctionTypes` | 2.6 | compiler flag | USE | Part of `strict` |
| 122 | `strictBindCallApply` | 3.2 | compiler flag | USE | Part of `strict` |
| 123 | `strictPropertyInitialization` | 2.7 | compiler flag | USE | Part of `strict` |
| 124 | `strictBuiltinIteratorReturn` | 5.6 | compiler flag | USE | Part of `strict` |
| 125 | `noImplicitThis` | 2.0 | compiler flag | USE | Part of `strict` |
| 126 | `useUnknownInCatchVariables` | 4.4 | compiler flag | USE | Part of `strict`. `catch (e)` is `unknown` |
| 127 | `alwaysStrict` | 2.1 | compiler flag | USE | Cannot be false in 6.0/7.0 |
| 128 | `noUncheckedIndexedAccess` | 4.1 | compiler flag | USE (MUST) | Indexing returns `T \| undefined` |
| 129 | `exactOptionalPropertyTypes` | 4.4 | compiler flag | USE | `?:` stops accepting an explicit `undefined`. Some library friction is accepted |
| 130 | `noImplicitOverride` | 4.3 | compiler flag | USE | |
| 131 | `noImplicitReturns` | 1.8 | compiler flag | USE | |
| 132 | `noFallthroughCasesInSwitch` | 1.8 | compiler flag | USE | |
| 133 | `noPropertyAccessFromIndexSignature` | 4.2 | compiler flag | USE | Use `obj['x']` for dynamic keys, which makes the risk visible |
| 134 | `noUnusedLocals` / `noUnusedParameters` | 2.0 | compiler flag | RESTRICT | Leave to lint (`no-unused-vars`) so editors don't block on them. Either way is OK |
| 135 | `allowUnreachableCode: false` | 1.8 | compiler flag | USE | |
| 136 | `allowUnusedLabels: false` | 1.8 | compiler flag | USE | |
| 137 | `noUncheckedSideEffectImports` | 5.6 | compiler flag | USE | Default true in 6.0/7.0 |
| 138 | `verbatimModuleSyntax` | 5.0 | compiler flag | USE (MUST) | Needed for type stripping and isolated transpilers |
| 139 | `isolatedModules` | 1.5 | compiler flag | USE | Implied by `verbatimModuleSyntax` |
| 140 | `erasableSyntaxOnly` | 5.8 | compiler flag | USE (MUST) | Guarantees Node type stripping and every transpiler work |
| 141 | `rewriteRelativeImportExtensions` | 5.7 | compiler flag | USE | Write `.ts` imports and emit `.js` |
| 142 | `allowImportingTsExtensions` | 5.0 | compiler flag | RESTRICT | Only with `noEmit` or `rewriteRelativeImportExtensions` |
| 143 | `isolatedDeclarations` | 5.5 | compiler flag | RESTRICT | MUST for published libraries (fast parallel `.d.ts`). Optional for apps |
| 144 | `module: nodenext` / `node20` / `node18` | 4.7 / 5.9 / 5.8 | compiler flag | USE (`nodenext`) | Matches Node's real resolution. `bundler` is only for code that is always bundled |
| 145 | `moduleResolution: bundler` | 5.0 | compiler flag | RESTRICT | Only when a bundler is the only consumer. `nodenext` is the house default |
| 146 | `moduleResolution: node10/node` | 1.x | compiler flag | BAN | Removed in 7.0 |
| 147 | `moduleResolution: classic` | 1.x | compiler flag | BAN | Removed in 6.0/7.0 |
| 148 | `module: amd/umd/system/none` | 1.x | compiler flag | BAN | Removed in 7.0 |
| 149 | `target: es5` / `downlevelIteration` | 1.x / 2.3 | compiler flag | BAN | Removed in 7.0 |
| 150 | `target: es2024/es2025/esnext` | 5.7 / 6.0 | compiler flag | USE (`es2024`+, matching the Node LTS) | No downleveling on the server |
| 151 | `outFile` | 1.x | compiler flag | BAN | Removed in 6.0 |
| 152 | `baseUrl` | 2.0 | compiler flag | BAN | Removed in 7.0. Use `package.json#imports` |
| 153 | `paths` | 2.0 | compiler flag | AVOID | Node ignores it at runtime. If kept, it must mirror `#imports` exactly |
| 154 | Subpath imports `#/*` and `#src/*` resolution | 4.7 (`#x`), 6.0 (`#/`) | module | USE | Native Node, TS and bundler aliasing |
| 155 | `esModuleInterop` / `allowSyntheticDefaultImports` | 2.7 / 1.8 | compiler flag | USE | Cannot be false in 6.0/7.0 |
| 156 | `resolveJsonModule` | 2.9 | compiler flag | USE | With import attributes |
| 157 | `skipLibCheck` | 2.0 | compiler flag | USE | Industry default, faster. Accepted trade-off |
| 158 | `types: ["node"]` | 2.0 | compiler flag | USE (MUST) | Default `[]` in 6.0/7.0, so list it explicitly |
| 159 | `lib` | 2.0 | compiler flag | RESTRICT | Match the target. No `dom` in backend code |
| 160 | `libReplacement` | 5.8 | compiler flag | USE (false) | Default false in 6.0 |
| 161 | `rootDir` / `outDir` explicit | 1.x | compiler flag | USE (MUST) | `rootDir` default changed to `./` in 6.0/7.0 |
| 162 | `declaration` / `declarationMap` | 1.x / 2.9 | compiler flag | RESTRICT | Libraries only |
| 163 | `sourceMap` + `node --enable-source-maps` | 1.x | compiler flag | USE | Readable stack traces in production |
| 164 | `incremental` / `tsBuildInfoFile` | 3.4 | compiler flag | USE | |
| 165 | Project references / `composite` / `tsc -b` | 3.0 | compiler flag | RESTRICT | Monorepos with more than about 3 packages |
| 166 | `importHelpers` / tslib | 2.1 | compiler flag | AVOID | Not needed at ES2024 targets |
| 167 | `noEmit` (typecheck only) | 1.x | compiler flag | USE | When a bundler or type stripping emits |
| 168 | `noEmitOnError` | 1.x | compiler flag | USE | |
| 169 | `forceConsistentCasingInFileNames` | 1.8 | compiler flag | USE | Default true |
| 170 | `allowJs` / `checkJs` | 1.8 / 2.3 | compiler flag | AVOID | TS-only repos |
| 171 | `ignoreDeprecations: "6.0"` | 5.0 mechanism | compiler flag | BAN | Fix the deprecations. Don't silence them |
| 172 | `--checkers` / `--builders` / `--singleThreaded` | 7.0 | CLI | RESTRICT | Tune only in CI on memory-constrained runners |
| 173 | `tsc --init` (minimal) | 5.9 | CLI | USE | Starting point only |
| 174 | `--ignoreConfig` | 6.0 | CLI | AVOID | |
| 175 | `tsc --watch` (rebuilt on Parcel's watcher in Go) | 7.0 | CLI | USE | For a dev typecheck loop |
| 176 | `--module preserve` | 5.4 | compiler flag | RESTRICT | Bundled code only |
| 177 | V8 compile cache support (`module.enableCompileCache`) | 5.7 / Node 22.1 | Node/compiler | USE | Faster startup for CLIs |
| 178 | TS 7 JS API (`typescript/unstable/*`) | 7.0 | API | BAN (for now) | Unstable. Tools must use `@typescript/typescript6` until 7.1 |

## C. Node.js features relevant to TS backends

| # | Feature | Node version | Category | Verdict | Reason |
|---|---|---|---|---|---|
| 179 | Type stripping (run `.ts` directly) | 22.6 flagged, 23.6 unflagged, stable in 24.12/25.2 | Node | USE (dev, scripts, tests). RESTRICT (prod) | Prod should run compiled JS for startup and source maps. Stripping is fine for scripts and dev |
| 180 | `--experimental-transform-types` | 22.7, removed in 26.0 | Node | BAN | Removed |
| 181 | `node:test` + `node --test` runner | 18 / stable 20 | Node | RESTRICT | Fine for libraries. Vitest preferred for apps (DX, mocking, coverage) |
| 182 | `node:assert/strict` | 9+ | Node | USE | Runtime invariants |
| 183 | `--env-file` / `--env-file-if-exists` | 20.6 / 22.9 | Node | USE (dev) | Replaces dotenv for local dev. Prod gets real env |
| 184 | `process.loadEnvFile()` / `util.parseEnv` | 21.7 | Node | RESTRICT | Scripts only |
| 185 | `--watch` / `--watch-path` | 18.11, stable 22 | Node | USE | Dev loop with type stripping. Replaces nodemon |
| 186 | `--run` (package.json scripts) | 22 | Node | AVOID | npm scripts are fine. Minor speed gain |
| 187 | Permission model (`--permission`, `--allow-fs-read` ...) | 20 flagged, stable 23.5 | Node | RESTRICT | Defense in depth for CLIs and untrusted plugins. Not a sandbox |
| 188 | `util.parseArgs` | 18.3 | Node | USE | CLIs without dependencies |
| 189 | `util.styleText` | 21.7 | Node | USE | CLI colours without chalk |
| 190 | `AbortController` / `AbortSignal.timeout` / `AbortSignal.any` | 15 / 17.3 / 20.3 | Node | USE (MUST for I/O) | Every outbound call gets a deadline |
| 191 | Global `fetch` (undici) | 18, stable 21 | Node | USE | Always with `signal: AbortSignal.timeout(ms)` |
| 192 | `structuredClone` | 17 | Node | USE | Deep copy |
| 193 | `Error` `cause` | 16.9 | Node/ES2022 | USE (MUST when wrapping) | Keeps the causal chain |
| 194 | `AggregateError` | 15 | Node/ES2021 | USE | |
| 195 | `AsyncLocalStorage` | 13.10, stable 16 | Node | USE | Request context (request ID, tenant) for logs |
| 196 | Explicit resource management in V8 | Node 24 (V8 13.6) | Node | USE | Native `using` |
| 197 | `require(esm)` | 20.19/22.12 unflagged | Node | USE | Lets CJS consumers load ESM-only packages, so ESM-only publishing is safe |
| 198 | Import attributes (JSON modules) | 18.20/20.10 | Node | USE | |
| 199 | `import.meta.dirname` / `import.meta.filename` | 20.11 | Node | USE | Replaces `__dirname` in ESM |
| 200 | `import.meta.resolve` | 20.6 | Node | RESTRICT | |
| 201 | `node:` protocol imports | 14.18/16 | Node | USE (MUST) | Lint `unicorn/prefer-node-protocol` |
| 202 | `fs/promises`, `timers/promises`, `stream/promises` | 10-15 | Node | USE | No callback APIs |
| 203 | `events.once` / `on` with AbortSignal | 11.13/12.16 | Node | USE | |
| 204 | `worker_threads` | 12 | Node | RESTRICT | CPU-bound work only (consider Piscina) |
| 205 | `node:sqlite` | 22.5 | Node | RESTRICT | Tests and tools. Check its stability index before prod |
| 206 | `--enable-source-maps` / `process.setSourceMapsEnabled` | 12.12 | Node | USE | Required with compiled TS |
| 207 | Single executable applications (SEA) | 19.7 | Node | RESTRICT | CLIs only |
| 208 | `module.enableCompileCache` / `NODE_COMPILE_CACHE` | 22.1 | Node | USE | Cheaper cold starts |
| 209 | `diagnostics_channel` / `TracingChannel` | 15.1 / 19.9 | Node | USE (indirect) | Used by OpenTelemetry/undici instrumentation |
| 210 | `node:perf_hooks` `monitorEventLoopDelay` | 11.10 | Node | USE | Event-loop lag metric |
| 211 | `Promise.withResolvers` | 22 (ES2024) | ES | USE | |
| 212 | `Object.groupBy` / `Map.groupBy` | 21 (ES2024) | ES | USE | Replaces lodash groupBy |
| 213 | `Array.prototype.toSorted/toReversed/with` | 20 (ES2023) | ES | USE | Immutable array ops |
| 214 | Iterator helpers (`Iterator.prototype.map/filter/take`) | 22 (ES2025) | ES | USE | Lazy pipelines |
| 215 | Set methods (`union`, `intersection`, ...) | 22 (ES2025) | ES | USE | |
| 216 | `RegExp.escape` | 24 (ES2025) | ES | USE | |
| 217 | `Map.getOrInsert` / `getOrInsertComputed`, `Iterator.concat` | TS 6.0 types. Native in Node 26 (V8 14.6) | ES | RESTRICT | Use only when the engines floor is >=26. Not available on 24 LTS |
| 218 | `Temporal` | TS 6.0 types (esnext). **On by default in Node 26.0** (2026-05-05) | ES | RESTRICT | USE once the floor is Node 26 (LTS from 2026-10-28). On the Node 24 floor use `Date` in UTC plus helpers |
| 219 | `Float16Array`, `Math.sumPrecise` | 24-26 | ES | RESTRICT | Feature-detect |
| 220 | Corepack | 16.9, removed from the distribution in 25 | Node | AVOID | Pin the package manager via `packageManager` and install it explicitly |

## D. Removed or changed in TS 6.0 / 7.0 (migration checklist)

Deprecated in 6.0 and **hard errors in 7.0**:
- `target: es5`, `downlevelIteration`
- `moduleResolution: node`/`node10`, `classic`
- `module: amd|umd|systemjs|none`, `outFile`
- `baseUrl`
- `esModuleInterop: false`, `allowSyntheticDefaultImports: false`, `alwaysStrict: false`
- `module Foo {}` namespace keyword, `import ... asserts {}`, `/// <reference no-default-lib>`
- Command-line files when a tsconfig exists (needs `--ignoreConfig`)

New defaults in 6.0 and 7.0: `strict: true`, `module: esnext`, `target`: the current-year ES (es2025), `noUncheckedSideEffectImports: true`, `libReplacement: false`, `rootDir: "."`, `types: []`. `stableTypeOrdering` is always on in 7.0.

7.0 has **no programmatic API**. Tools such as typescript-eslint need `typescript` aliased to `npm:@typescript/typescript6@^6.0.2`, with `npm:typescript@^7.0.2` installed alongside (e.g. as `@typescript/native`) for `tsc`. The API is expected in 7.1.

## Counts

- Type-system and syntax features: 117
- Compiler flags and CLI: 61
- Node/ES runtime features: 42
- **Total rows: 220**. BAN: 33. RESTRICT: about 66. AVOID: 9. The rest are USE.
