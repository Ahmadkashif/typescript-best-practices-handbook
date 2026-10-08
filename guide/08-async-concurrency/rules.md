# Async and concurrency rules (ASYNC)

### ASYNC-001 No floating promises
**Level:** MUST NOT
**Rubric:** R4 M5 S5 D4 C5
**Rule:** Every promise is `await`ed, returned, or explicitly handed to a supervised runner. Fire-and-forget is written as `void task().catch(log)`, and only in code that has a reason to do it.
```ts lint
declare function sendEmail(): Promise<void>;
export function handler(): void { sendEmail(); } // rejection lost; lint error
```
**Enforcement:** `@typescript-eslint/no-floating-promises`, `no-misused-promises`, `require-await`.
**Sources:** A-021, A-040, A-020

### ASYNC-002 Never block the event loop
**Level:** MUST NOT
**Rubric:** R4 M4 S5 D5 C5
**Rule:** Request paths MUST NOT use `*Sync` fs/crypto/zlib APIs, unbounded `JSON.parse`/`JSON.stringify` of large payloads, or regexes vulnerable to ReDoS. CPU work above ~10 ms goes to a worker pool (ASYNC-005).
**Enforcement:** review, body size limits (HTTP-006) and event-loop delay metrics (OBS-004). Recommended addition: `n/no-sync` in `src/`, allowed in scripts and at boot.
**Sources:** A-078, A-130, A-094, A-076

### ASYNC-003 Bounded concurrency for fan-out
**Level:** MUST
**Rubric:** R4 M4 S5 D5 C4
**Rule:** Do not `Promise.all` over unbounded user-controlled arrays. Use a concurrency limit (e.g. `p-limit`, or the house `mapLimit`).
```ts
export async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      const item = items[i];
      if (item === undefined) continue;
      out[i] = await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
```
**Sources:** B-14 (bulkheads), A-105, B-03

### ASYNC-004 Every outbound I/O has a timeout and is cancellable
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** HTTP calls, DB queries and queue operations take an `AbortSignal`. The default is `AbortSignal.timeout(ms)`, combined with the request's signal through `AbortSignal.any`.
```ts
export async function getJson(url: string, parent?: AbortSignal): Promise<unknown> {
  const signal = parent ? AbortSignal.any([parent, AbortSignal.timeout(5_000)]) : AbortSignal.timeout(5_000);
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}
```
**Sources:** B-14, A-100, A-076

### ASYNC-005 CPU-bound work in a pooled worker, never one worker per request
**Level:** MUST
**Rubric:** R3 M4 S5 D5 C4
**Rule:** Use `piscina` (or an equivalent bounded pool) with a queue limit. Spawning `new Worker()` per request is banned.
**Sources:** A-136, A-078

### ASYNC-006 Retries are bounded, jittered and only for idempotent operations
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C5
**Rule:** Use the house `retry(fn, { attempts, baseMs, maxMs, signal })` with full-jitter exponential backoff. Retry only idempotent calls, or calls carrying an idempotency key. Never retry 4xx validation errors.
**Sources:** B-14, B-12, A-113

### ASYNC-007 Streams via `pipeline` from `node:stream/promises`
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** Never `.pipe()` without error handling. `pipeline` propagates errors, handles backpressure and destroys the streams.
```ts
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
export async function gzipFile(src: string, dst: string): Promise<void> {
  await pipeline(createReadStream(src), createGzip(), createWriteStream(dst));
}
```
**Sources:** A-125, B-03

### ASYNC-008 Request context via `AsyncLocalStorage`, not parameter threading of loggers
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C3
**Rule:** Bind the request id and logger in an `AsyncLocalStorage` store at the HTTP boundary. Measured overhead is about 7% in Node 24 (A-135, A-065).
**Sources:** A-065, A-135
