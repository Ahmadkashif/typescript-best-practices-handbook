import { describe, expect, it } from 'vitest';
import { addMs, fixedClock, isExpired, MINUTE, SECOND, toIsoUtc } from './time.ts';

describe('time', () => {
  it('fixedClock only moves when advanced', () => {
    const clock = fixedClock('2026-10-06T00:00:00.000Z');
    const deadline = addMs(clock.now(), 5 * MINUTE);
    expect(isExpired(deadline, clock)).toBe(false);
    clock.advance(5 * MINUTE - SECOND);
    expect(isExpired(deadline, clock)).toBe(false);
    clock.advance(SECOND);
    expect(isExpired(deadline, clock)).toBe(true);
    expect(toIsoUtc(clock.now())).toBe('2026-10-06T00:05:00.000Z');
  });
});
