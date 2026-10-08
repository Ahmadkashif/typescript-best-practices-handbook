import { describe, expect, it } from 'vitest';
import {
  addMinor,
  allocateEvenly,
  DecimalError,
  divRoundHalfEven,
  formatDecimal,
  mulMinor,
  parseDecimal,
  safeIntAdd,
  subMinor,
} from './decimal.ts';

describe('decimal', () => {
  it('parses and formats without floating point error', () => {
    const sum = addMinor(parseDecimal('0.1', 2), parseDecimal('0.2', 2));
    expect(formatDecimal(sum, 2)).toBe('0.30');
  });

  it('handles negatives, integers and zero scale', () => {
    expect(parseDecimal('-12.5', 2)).toBe(-1250n);
    expect(formatDecimal(parseDecimal('-0.05', 2), 2)).toBe('-0.05');
    expect(formatDecimal(parseDecimal('7', 0), 0)).toBe('7');
    expect(formatDecimal(subMinor(parseDecimal('1', 2), parseDecimal('2.5', 2)), 2)).toBe('-1.50');
  });

  it('rejects malformed input and excess precision', () => {
    expect(() => parseDecimal('1e3', 2)).toThrow(DecimalError);
    expect(() => parseDecimal('1.234', 2)).toThrow(/more than 2 decimal places/);
    expect(() => parseDecimal('1', 19)).toThrow(/scale/);
  });

  it('stays exact beyond Number.MAX_SAFE_INTEGER', () => {
    const big = parseDecimal('90071992547409.93', 2);
    expect(formatDecimal(addMinor(big, parseDecimal('0.01', 2)), 2)).toBe('90071992547409.94');
  });

  it('rounds half to even', () => {
    expect(divRoundHalfEven(25n, 10n)).toBe(2n);
    expect(divRoundHalfEven(35n, 10n)).toBe(4n);
    expect(divRoundHalfEven(-25n, 10n)).toBe(-2n);
    expect(divRoundHalfEven(26n, 10n)).toBe(3n);
    expect(() => divRoundHalfEven(1n, 0n)).toThrow(DecimalError);
  });

  it('multiplies by a decimal factor with bankers rounding', () => {
    // 19% of 10.05 = 1.9095 -> 1.91
    expect(formatDecimal(mulMinor(parseDecimal('10.05', 2), '0.19'), 2)).toBe('1.91');
    // 0.125 * 1 at scale 2 -> 0.12 (half-even)
    expect(formatDecimal(mulMinor(parseDecimal('1.00', 2), '0.125'), 2)).toBe('0.12');
  });

  it('allocates without losing a cent', () => {
    const parts = allocateEvenly(parseDecimal('100.00', 2), 3);
    expect(parts.map((p) => formatDecimal(p, 2))).toEqual(['33.34', '33.33', '33.33']);
    expect(parts.reduce((a, b) => addMinor(a, b))).toBe(10000n);
    expect(allocateEvenly(parseDecimal('-0.05', 2), 2)).toEqual([-3n, -2n]);
    expect(() => allocateEvenly(parseDecimal('1', 2), 0)).toThrow(DecimalError);
  });

  it('refuses unsafe integer addition', () => {
    expect(safeIntAdd(1, 2)).toBe(3);
    expect(() => safeIntAdd(Number.MAX_SAFE_INTEGER, 1)).toThrow(DecimalError);
    expect(() => safeIntAdd(0.1, 0.2)).toThrow(DecimalError);
  });
});
