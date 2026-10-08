# Language feature rules (LANG)

The full per-feature verdict table is in [catalog.md](catalog.md). This file holds the rules that need an explanation and examples.

### LANG-001 No `enum`, `const enum` or `declare enum`
**Level:** MUST NOT
**Rubric:** R4 M4 S4 D5 C4
**Rule:** Model closed sets with an `as const` object plus a derived union type, or with a plain string-literal union.
**Why:** Enums are not erasable, so Node's type stripping rejects them. Numeric enums accept any number, and `const enum` breaks under `isolatedModules`. A union is fully structural and costs nothing at runtime.
**Bad:**
```ts fails
enum Status { Active, Disabled }
export const s: Status = Status.Active;
```
**Good:**
```ts
export const Status = { Active: 'active', Disabled: 'disabled' } as const;
export type Status = (typeof Status)[keyof typeof Status];

export function label(s: Status): string {
  switch (s) {
    case Status.Active: return 'Active';
    case Status.Disabled: return 'Disabled';
  }
}
```
**Enforcement:** `erasableSyntaxOnly` (compiler error TS1294), plus the boilerplate's `no-restricted-syntax` rule for `TSEnumDeclaration`.
**Sources:** A-010, A-023, A-024, A-070, B-01, B-16

### LANG-002 No namespaces with values, no `module Foo {}`, no `import x = require()`
**Level:** MUST NOT
**Rubric:** R4 M5 S4 D5 C5
**Rule:** Use ES modules. A `declare namespace` that only holds types is allowed in `.d.ts` augmentation files.
**Bad:**
```ts fails
namespace Money { export const zero = 0; }
export const z = Money.zero;
```
**Enforcement:** `erasableSyntaxOnly`. TS 7 removed the `module` keyword form outright.
**Sources:** A-001, A-010, A-025

### LANG-003 No constructor parameter properties
**Level:** MUST NOT
**Rubric:** R4 M4 S3 D5 C4
**Rule:** Declare fields explicitly and assign them in the constructor, or better, use a factory function.
**Bad:**
```ts fails
export class Repo { constructor(private readonly url: string) {} }
```
**Good:**
```ts
export class Repo {
  readonly #url: string;
  constructor(url: string) { this.#url = url; }
  get host(): string { return new URL(this.#url).host; }
}
```
**Enforcement:** `erasableSyntaxOnly`.
**Sources:** A-010, A-025, A-024

### LANG-004 No decorators (legacy or TC39) in house code
**Level:** MUST NOT
**Rubric:** R3 M3 S3 D4 C3
**Rule:** Use explicit higher-order functions (`withRetry(fn)`) or plain registration code instead of `@decorators`. Never enable `experimentalDecorators` or `emitDecoratorMetadata`.
**Why:** Node's type stripping rejects decorators. Legacy decorators plus `reflect-metadata` hide control flow and need a full transpile. TC39 decorators are not yet native in V8.
**Enforcement:** tsconfig review (both flags absent); type stripping fails at runtime.
**Sources:** A-010, A-046, B-03
*Exception:* a project that adopts NestJS by ADR accepts decorators inside Nest-facing adapter files only.

### LANG-005 `any` is banned; use `unknown` and narrow
**Level:** MUST NOT
**Rubric:** R4 M5 S5 D3 C5
**Rule:** Do not write `any`, explicitly or implicitly. Use `unknown` for untrusted values and parse them (VAL-001). The only allowed `any` is inside a generic constraint (`T extends (...args: any[]) => unknown`), with an inline comment.
**Bad (compiles, caught by lint):**
```ts lint
export function total(items: any): number { return items.reduce((a: number, b: any) => a + b.price, 0); }
```
**Good:**
```ts
type Item = { readonly price: number };
export function total(items: readonly Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```
**Enforcement:** `noImplicitAny` (via `strict`), `@typescript-eslint/no-explicit-any`, and the `no-unsafe-*` family from `recommended-type-checked`.
**Sources:** A-031, A-020, A-022, B-01

### LANG-006 No type assertions to silence the compiler
**Level:** MUST NOT
**Rubric:** R4 M5 S4 D3 C5
**Rule:** `as T`, `as unknown as T` and the non-null `!` MUST NOT be used to override what the checker knows. Use `satisfies` to check a literal, a parser to obtain a type, and narrowing for nullability. `as const` is allowed.
**Bad:**
```ts lint
type Config = { port: number };
export const cfg = JSON.parse('{"port":"oops"}') as Config;
```
**Good:**
```ts
type Routes = Record<string, { method: 'GET' | 'POST' }>;
export const routes = {
  health: { method: 'GET' },
  createUser: { method: 'POST' },
} satisfies Routes; // keeps literal keys; checks the shape
```
**Enforcement:** `@typescript-eslint/no-non-null-assertion` and `no-unnecessary-type-assertion` (both in `strictTypeChecked`, used by the boilerplate; non-null is allowed in tests). Recommended addition: `consistent-type-assertions` with `assertionStyle: 'never'` in `src/`.
**Sources:** A-027, A-031, B-01, B-16

### LANG-007 Use `#private` fields, not the `private` keyword
**Level:** PREFER
**Rubric:** R4 M4 S3 D4 C3
**Rule:** When you need a class, keep its state hard-private with `#field`. `private` only exists at compile time.
**Sources:** catalog row "private vs #private", B-02, B-03

### LANG-008 Use `using` / `await using` for scoped resources
**Level:** PREFER
**Rubric:** R4 M5 S4 D4 C3
**Rule:** Anything with `close()`/`release()` (DB clients from a pool, temp dirs, file handles, locks) SHOULD expose `[Symbol.asyncDispose]` and be acquired with `await using`, so it is released on every path.
```ts
export async function withTempResource(): Promise<number> {
  await using res = {
    value: 42,
    async [Symbol.asyncDispose]() { /* release */ },
  };
  return res.value;
}
```
**Why:** Node 24 (V8 13.6) supports explicit resource management natively, and TS has supported it since 5.2.
**Enforcement:** review. The boilerplate tsconfig sets `lib: ["es2025"]`. Add `"esnext.disposable"` to `lib` the first time you use `using` (the snippet-check config does).
**Sources:** A-006, A-065

### LANG-009 Default exports are banned outside tool config files
**Level:** MUST NOT
**Rubric:** R4 M4 S4 D3 C4
**Rule:** Use named exports only. The exceptions are `*.config.ts` files whose tool requires a default export.
**Why:** Named exports keep one name per symbol across the codebase, which makes grep and refactors reliable.
**Enforcement:** review. Recommended addition: a `no-restricted-syntax` entry for `ExportDefaultDeclaration`, with `*.config.ts`/`eslint.config.js` excluded.
**Sources:** B-01, A-028 (style), boilerplate survey (`phase-2/boilerplates.md`)

### LANG-010 No `@ts-ignore` / `@ts-nocheck`; `@ts-expect-error` needs a reason
**Level:** MUST NOT
**Rubric:** R4 M5 S4 D3 C5
**Enforcement:** `@typescript-eslint/ban-ts-comment` with `'ts-expect-error': 'allow-with-description'`.
**Sources:** A-022, A-020

### LANG-011 `type` by default, `interface` for extendable object contracts
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C3
**Rule:** Use `type` for unions, data shapes and function types. Use `interface` only when declaration merging or `extends` hierarchies are intended (ports, augmentations).
**Sources:** A-028, A-059, B-01

### LANG-012 Explicit return types on exported functions
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C3
**Rule:** Exported functions declare their return type. Local functions may rely on inference.
**Why:** It keeps the API stable, speeds up the checker (TS perf wiki), and is required for `isolatedDeclarations` in published libraries.
**Enforcement:** `@typescript-eslint/explicit-module-boundary-types` (warn); `isolatedDeclarations` in library packages.
**Sources:** A-029, A-059, A-071

### LANG-013 Top-level `await` only in entrypoints
**Level:** RESTRICT (PREFER)
**Rubric:** R4 M4 S3 D4 C3
**Rule:** `await` at module top level is allowed only in `src/main.ts`-style entrypoints and scripts. A library module that awaits during import blocks every importer, and with `require(esm)` it cannot be required at all.
**Sources:** A-048, A-015
