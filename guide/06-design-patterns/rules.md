# Design patterns in TypeScript (PAT)

Rule of thumb from the books (B-03, B-04, B-13, B-15): **most GoF patterns exist to work around missing first-class functions and modules. TypeScript has both.** Use the idiomatic form below, and treat the class-heavy original as ceremony. The full mapping table is in `phase-3/deep-dive.md` section 3.3.

### PAT-001 No Singleton classes
**Level:** MUST NOT
**Rubric:** R4 M5 S4 D4 C4
**Rule:** A shared instance is created once in the composition root and passed in. No `getInstance()`, no mutable module-level state that is reachable from everywhere.
```ts lint
export class Db {
  static #instance: Db | undefined;
  static getInstance(): Db { return (Db.#instance ??= new Db()); }
}
```
```ts
export type Db = { query(sql: string): Promise<unknown[]> };
export function createDb(url: string): Db {
  return { async query(sql) { void url; void sql; return []; } };
}
// composition root: const db = createDb(config.DATABASE_URL); const users = createUserService({ db });
```
**Why:** Hidden globals defeat testing and make lifecycles (shutdown, per-test isolation) impossible.
**Sources:** B-03, B-04, B-09, A-101

### PAT-002 Factory functions over classes for services
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C3
**Rule:** A service is `createXService(deps): XService`, where `XService` is a `type` of functions. Dependencies are captured by closure.
```ts
type Clock = { now(): Date };
type Mailer = { send(to: string, body: string): Promise<void> };
export type WelcomeService = { welcome(email: string): Promise<void> };

export function createWelcomeService(deps: { clock: Clock; mailer: Mailer }): WelcomeService {
  return {
    async welcome(email) {
      await deps.mailer.send(email, `Welcome! (${deps.clock.now().toISOString()})`);
    },
  };
}
```
**Sources:** A-101, B-03, B-15

### PAT-003 Builders only for test data
**Level:** AVOID (in production code)
**Rubric:** R4 M4 S3 D4 C3
**Rule:** Production code uses object literals with `satisfies`. Tests use `buildX(overrides)` helpers.
```ts
type User = { id: string; email: string; active: boolean };
export const buildUser = (o: Partial<User> = {}): User => ({ id: 'u1', email: 'a@b.c', active: true, ...o });
```
**Sources:** B-04, B-05

### PAT-004 Strategy = a function or a record of handlers
**Level:** PREFER
**Rubric:** R5 M5 S4 D4 C4
```ts
type Channel = 'email' | 'sms';
type Notify = (to: string, msg: string) => Promise<void>;
export const notifiers: Record<Channel, Notify> = {
  email: async (to, msg) => { void to; void msg; },
  sms: async (to, msg) => { void to; void msg; },
};
```
`Record<Channel, ...>` forces a handler for every member, just as an exhaustive `switch` does.
**Sources:** B-04, B-03, B-11

### PAT-005 Events: return them as values; use emitters only for in-process fan-out
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C3
**Rule:** A domain function returns the events it produced (`{ state, events }`). The application layer publishes them (with the outbox, DATA-006). A raw `EventEmitter` with stringly-typed names is AVOID. If one is needed, type it with a map: `EventEmitter<{ userCreated: [User] }>` (`@types/node` supports generics).
**Sources:** B-03, B-11, A-113

### PAT-006 Cross-cutting behaviour via higher-order functions
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C3
**Rule:** Retry, timeout, caching and metrics wrap functions (`withRetry(fn, opts)`). They are not `@decorators` or inheritance.
**Sources:** B-04, B-14, LANG-004

### PAT-007 Inheritance at most one level deep
**Level:** AVOID
**Rubric:** R4 M4 S3 D4 C4
**Rule:** Use composition. The allowed hierarchies are `AppError` subclasses and framework base classes.
**Sources:** B-04 ("favor composition"), B-13, B-02
