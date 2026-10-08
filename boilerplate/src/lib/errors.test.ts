import { describe, expect, it } from 'vitest';
import { ConflictError, isAppError, NotFoundError, toError } from './errors.ts';

describe('errors', () => {
  it('carries code, status, details and cause', () => {
    const cause = new Error('unique violation');
    const error = new ConflictError('email taken', { cause, details: { field: 'email' } });
    expect(error).toMatchObject({ name: 'ConflictError', code: 'CONFLICT', status: 409 });
    expect(error.details).toEqual({ field: 'email' });
    expect(error.cause).toBe(cause);
    expect(isAppError(error)).toBe(true);
    expect(isAppError(new Error('x'))).toBe(false);
    expect(new NotFoundError('gone').cause).toBeUndefined();
  });

  it('normalises thrown non-errors', () => {
    expect(toError('text').message).toBe('text');
    expect(toError({ a: 1 }).message).toBe('{"a":1}');
    const original = new TypeError('t');
    expect(toError(original)).toBe(original);
  });
});
