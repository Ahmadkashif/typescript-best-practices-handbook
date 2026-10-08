/** Durations in milliseconds. Write `5 * MINUTE`, never a bare `300000`. */
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/**
 * The only way application code reads the current time.
 * Inject it, so tests can use a fixed or manually advanced clock.
 */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

/** A clock for tests: frozen at `start`, moved only by `advance`. */
export function fixedClock(start: Date | string): Clock & { advance(ms: number): void } {
  let current = new Date(start).getTime();
  return {
    now: () => new Date(current),
    advance: (ms: number) => {
      current += ms;
    },
  };
}

export const addMs = (date: Date, ms: number): Date => new Date(date.getTime() + ms);

/** ISO-8601 in UTC with milliseconds, e.g. `2026-10-06T12:00:00.000Z`. Use it for every timestamp you store or send. */
export const toIsoUtc = (date: Date): string => date.toISOString();

/** True when `deadline` has passed according to `clock`. */
export const isExpired = (deadline: Date, clock: Clock = systemClock): boolean =>
  clock.now().getTime() >= deadline.getTime();
