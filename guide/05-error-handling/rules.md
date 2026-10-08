# Error handling rules (ERR)

The model: **expected failures are values, boundary failures are typed errors, bugs crash** (ADR-0005).

| Kind | Example | Mechanism |
|---|---|---|
| Expected domain outcome | "email already taken", "insufficient funds" | `Result<T, E>` returned (ERR-002, PREFER). The boilerplate's CRUD example throws `AppError` subclasses instead, because it has no multi-outcome domain logic |
| Operational/boundary error | validation failure, not found, upstream timeout | `AppError` subclass thrown, mapped to HTTP problem+json (ERR-003, HTTP-004) |
| Programmer error | `undefined is not a function`, broken invariant | Not caught locally. Process logs it and exits, orchestrator restarts (ERR-006) |

### ERR-001 Throw only `Error` instances; wrap with `cause`
**Level:** MUST
**Rubric:** R4 M5 S4 D4 C5
**Rule:** Never `throw 'string'` or a plain object. When re-throwing, wrap the original error as `cause`.
```ts
export async function loadProfile(fetchProfile: () => Promise<string>): Promise<string> {
  try {
    return await fetchProfile();
  } catch (error) {
    throw new Error('Failed to load profile', { cause: error });
  }
}
```
**Enforcement:** `@typescript-eslint/only-throw-error`, `prefer-promise-reject-errors`, `useUnknownInCatchVariables` (from `strict`).
**Sources:** A-038, A-074, A-076

### ERR-002 Expected domain failures are returned as a `Result`
**Level:** PREFER
**Rubric:** R4 M5 S4 D5 C3
**Rule:** Domain/use-case functions whose failure is part of the business contract return `Result<T, E>`, where `E` is a union of string-tagged errors. Use the 15-line in-house type. Do not add `neverthrow` or `Effect` without an ADR.
```ts
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

type RegisterError = { type: 'EmailTaken' } | { type: 'WeakPassword'; reason: string };

export function register(email: string, password: string, taken: ReadonlySet<string>): Result<{ email: string }, RegisterError> {
  if (taken.has(email)) return err({ type: 'EmailTaken' });
  if (password.length < 12) return err({ type: 'WeakPassword', reason: 'min 12 chars' });
  return ok({ email });
}

const r = register('a@b.c', 'short', new Set());
if (!r.ok) {
  switch (r.error.type) {
    case 'EmailTaken': break;
    case 'WeakPassword': console.log(r.error.reason); break;
  }
}
```
**Why:** The checker makes callers handle every expected failure, and the signature documents it. Returning values is also cheaper than throwing on hot paths (A-054, a micro-benchmark).
**Sources:** A-036, A-054, A-055, A-056, B-11

### ERR-003 One `AppError` hierarchy with stable codes
**Level:** MUST
**Rubric:** R5 M5 S5 D4 C4
**Rule:** Boundary/operational errors extend a single `AppError` base with a machine-readable `code`, an HTTP `status` and an `expose` flag. Only the HTTP error handler translates them into responses.
```ts
export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly expose: boolean;
  constructor(code: string, message: string, opts: { status: number; expose?: boolean; cause?: unknown }) {
    super(message, { cause: opts.cause });
    this.name = new.target.name;
    this.code = code;
    this.status = opts.status;
    this.expose = opts.expose ?? opts.status < 500;
  }
}
export class NotFoundError extends AppError {
  constructor(what: string) { super('NOT_FOUND', `${what} not found`, { status: 404 }); }
}
```
**Sources:** A-039, A-076, A-147, B-14

### ERR-004 Never swallow errors
**Level:** MUST NOT
**Rubric:** R4 M5 S4 D4 C5
**Rule:** An empty `catch`, or one that only logs and then continues as if nothing happened, is banned. Handle, wrap and re-throw, or convert to a `Result`.
```ts lint
export async function bad(job: () => Promise<void>): Promise<void> {
  try { await job(); } catch { /* ignore */ }
}
```
**Enforcement:** `no-empty` (allowEmptyCatch: false), review.
**Sources:** A-076, A-039

### ERR-005 Narrow `unknown` in `catch` before use
**Level:** MUST
**Rubric:** R4 M5 S4 D3 C5
```ts
export function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
```
**Enforcement:** `useUnknownInCatchVariables` (in `strict`).
**Sources:** A-007, B-01

### ERR-006 Crash on programmer errors and unhandled rejections
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** `uncaughtException` and `unhandledRejection` log at `fatal` and then begin graceful shutdown with a non-zero exit. Never keep running in an unknown state. Node's default `--unhandled-rejections=throw` is kept.
**Sources:** A-039, A-076, A-139, B-14

### ERR-007 Never leak internals to clients
**Level:** MUST NOT
**Rubric:** R4 M4 S4 D4 C5
**Rule:** Responses MUST NOT include stack traces, SQL, or `cause` chains. Errors with `expose: false` become a generic 500 problem+json carrying the request id.
**Sources:** A-080, A-146, A-147
