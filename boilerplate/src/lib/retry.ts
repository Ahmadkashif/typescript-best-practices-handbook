import { setTimeout as sleep } from 'node:timers/promises';

export interface RetryOptions {
  /** Retries after the first attempt. `3` means up to 4 calls in total. */
  readonly retries: number;
  /** Delay before the first retry; doubles on each attempt. */
  readonly baseDelayMs: number;
  /** Upper bound for a single delay. */
  readonly maxDelayMs: number;
  /** Return false for errors that will never succeed (validation, 4xx). Default: retry everything. */
  readonly shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Cancels waiting and further attempts. */
  readonly signal?: AbortSignal;
  /** Injectable for deterministic tests. Default: `Math.random`. */
  readonly random?: () => number;
  /** Called before each retry, e.g. to log. */
  readonly onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

/** Exponential backoff with "full jitter": a random delay in [0, min(max, base * 2^attempt)]. */
export function backoffDelay(
  attempt: number,
  options: Pick<RetryOptions, 'baseDelayMs' | 'maxDelayMs' | 'random'>,
): number {
  const ceiling = Math.min(options.maxDelayMs, options.baseDelayMs * 2 ** attempt);
  return Math.floor((options.random ?? Math.random)() * ceiling);
}

/**
 * Calls `fn` until it resolves, retrying failures with exponential backoff and jitter.
 * Only use it for idempotent operations.
 */
export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    options.signal?.throwIfAborted();
    try {
      return await fn(attempt);
    } catch (error) {
      const retryable = options.shouldRetry?.(error, attempt) ?? true;
      if (attempt >= options.retries || !retryable) throw error;
      const delayMs = backoffDelay(attempt, options);
      options.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs, undefined, options.signal ? { signal: options.signal } : {});
    }
  }
}
