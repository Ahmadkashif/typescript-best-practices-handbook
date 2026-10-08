# Type design rules (TYPES)

### TYPES-001 Model variants as discriminated unions and switch exhaustively
**Level:** MUST
**Rubric:** R5 M5 S5 D4 C5
**Rule:** A value that can be in one of several shapes MUST be a union with a literal `kind`/`type` tag. A `switch` over the tag MUST end in `assertNever` so that adding a variant breaks the build.
**Good:**
```ts
export function assertNever(x: never, msg = 'Unexpected variant'): never {
  throw new Error(`${msg}: ${JSON.stringify(x)}`);
}

type Payment =
  | { kind: 'card'; last4: string }
  | { kind: 'bank'; iban: string }
  | { kind: 'voucher'; code: string };

export function describe(p: Payment): string {
  switch (p.kind) {
    case 'card': return `card ****${p.last4}`;
    case 'bank': return `bank ${p.iban.slice(0, 4)}...`;
    case 'voucher': return `voucher ${p.code}`;
    default: return assertNever(p);
  }
}
```
**Bad (optional-field soup, so impossible states typecheck):**
```ts lint
type Payment = { kind: string; last4?: string; iban?: string; code?: string };
export const p: Payment = { kind: 'card', iban: 'DE00' };
```
**Enforcement:** `@typescript-eslint/switch-exhaustiveness-check`, `noImplicitReturns`, and `assertNever` from `#src/lib/assert.ts`.
**Sources:** A-047, A-063, B-11, B-01, B-04 (State/Visitor become unions)

### TYPES-002 Brand identifiers and validated primitives
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C4
**Rule:** IDs and validated scalars (UserId, OrderId, Email, Cents) MUST be branded types created only by a smart constructor or a schema. Raw `string`/`number` MUST NOT cross module boundaries for these.
```ts
declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseUserId(raw: string): UserId | undefined {
  return UUID.test(raw) ? (raw as UserId) : undefined; // the single sanctioned cast
}

declare function loadOrder(id: OrderId): void;
declare const u: UserId;
// loadOrder(u); // error: UserId is not assignable to OrderId
```
```ts fails
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
declare function loadOrder(id: OrderId): void;
declare const u: UserId;
loadOrder(u);
```
**Why:** It is zero-cost at runtime and catches swapped-argument bugs. The cast lives only inside the constructor.
**In the boilerplate:** `src/lib/brand.ts` defines `Brand<T, Name> = T & z.$brand<Name>`, the same type Zod's `.brand()` produces, so there is one brand system. `uuidId('TodoId')` returns `{ schema, parse, create }`. Its single `as unknown as` cast, which works around Zod's deferred conditional type, is the documented exception to LANG-006.
**Enforcement:** review, plus `consistent-type-assertions` (the constructor file carries an eslint-disable with a reason).
**Sources:** A-026, A-033, B-01, B-11

### TYPES-003 Parse, don't validate
**Level:** MUST
**Rubric:** R5 M5 S5 D4 C5
**Rule:** A function that checks input MUST return a narrower type (or a Result), not `boolean`/`void`. Derive the static type from the runtime schema (`z.infer`) so there is one source of truth.
```ts
import { z } from 'zod';
export const CreateUser = z.object({ email: z.email(), name: z.string().min(1).max(100) });
export type CreateUser = z.infer<typeof CreateUser>;

export function parseCreateUser(body: unknown): CreateUser {
  return CreateUser.parse(body);
}
```
**Sources:** A-019, A-121, A-034, A-079, B-11

### TYPES-004 No sentinel values; use `undefined` or a union
**Level:** MUST NOT
**Rubric:** R5 M5 S4 D4 C4
**Rule:** Do not encode "absent" or "error" as `-1`, `''`, `0` or `null` inside a domain type. Use `T | undefined` (absent) or a Result (failed).
**Sources:** A-033, B-01

### TYPES-005 Readonly by default for data
**Level:** PREFER
**Rubric:** R4 M5 S4 D4 C3
**Rule:** Domain data types and function parameters use `readonly` properties and `readonly T[]`. Mutate only local variables.
```ts
export type Order = { readonly id: string; readonly lines: readonly { readonly sku: string; readonly qty: number }[] };
export function totalQty(o: Order): number { return o.lines.reduce((n, l) => n + l.qty, 0); }
```
**Enforcement:** `@typescript-eslint/prefer-readonly` (classes); review for types.
**Sources:** B-01, B-15, B-17

### TYPES-006 Generics only when they relate two or more positions
**Level:** AVOID (over-generic code)
**Rubric:** R5 M4 S3 D4 C4
**Rule:** A type parameter that appears only once is noise. Use `unknown` or a concrete type instead. Advanced type-level code (conditional/mapped/recursive types, `infer`) is allowed only in `src/lib/` with tests (`expectTypeOf`).
```ts lint
export function first<T>(xs: unknown[]): T | undefined { return xs[0] as T | undefined; } // T only in return: a hidden cast
```
```ts
export function first<T>(xs: readonly T[]): T | undefined { return xs[0]; }
```
**Enforcement:** `@typescript-eslint/no-unnecessary-type-parameters`.
**Sources:** B-01 (golden rule of generics), A-031, B-16

### TYPES-007 Money is integer minor units or a decimal, never a float
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C5
**Rule:** Monetary amounts are `bigint`/integer cents branded as `Cents`, or a decimal library value. Never do `0.1 + 0.2` arithmetic on currency.
**Sources:** B-12, A-033, house utils (`#src/lib/money.ts` in boilerplate)

### TYPES-008 `noUncheckedIndexedAccess` is on; write code that respects it
**Level:** MUST
**Rubric:** R4 M5 S4 D3 C3
**Rule:** Indexing an array or record yields `T | undefined`. Handle it with `for...of`, `.at()` plus a check, or destructuring with a guard. Never use `!`.
```ts
export function maxOf(xs: readonly number[]): number | undefined {
  let best: number | undefined;
  for (const x of xs) if (best === undefined || x > best) best = x;
  return best;
}
```
**Sources:** A-050, A-051, A-007
