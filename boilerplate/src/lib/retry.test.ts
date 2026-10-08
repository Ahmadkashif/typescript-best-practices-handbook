import { describe, expect, it, vi } from 'vitest';
import { backoffDelay, retry } from './retry.ts';

const fast = { baseDelayMs: 1, maxDelayMs: 4, random: () => 0 } as const;

describe('backoffDelay', () => {
  it('grows exponentially and is capped', () => {
    const opts = { baseDelayMs: 100, maxDelayMs: 1000, random: () => 0.999999 };
    expect(backoffDelay(0, opts)).toBe(99);
    expect(backoffDelay(1, opts)).toBe(199);
    expect(backoffDelay(5, opts)).toBe(999);
  });
});

describe('retry', () => {
  it('returns the first success', async () => {
    const fn = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('ok');
    const onRetry = vi.fn();
    await expect(retry(fn, { ...fast, retries: 3, onRetry })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('gives up after the configured retries and rethrows the last error', async () => {
    const fn = vi.fn(() => Promise.reject(new Error('still down')));
    await expect(retry(fn, { ...fast, retries: 2 })).rejects.toThrow('still down');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry errors that shouldRetry rejects', async () => {
    const fn = vi.fn(() => Promise.reject(new Error('bad input')));
    await expect(retry(fn, { ...fast, retries: 5, shouldRetry: () => false })).rejects.toThrow(
      'bad input',
    );
    expect(fn).toHaveBeenCalledOnce();
  });

  it('stops when the signal is aborted', async () => {
    const controller = new AbortController();
    controller.abort(new Error('cancelled'));
    const fn = vi.fn(() => Promise.resolve(1));
    await expect(retry(fn, { ...fast, retries: 1, signal: controller.signal })).rejects.toThrow(
      'cancelled',
    );
    expect(fn).not.toHaveBeenCalled();
  });
});
