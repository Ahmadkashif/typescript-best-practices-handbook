/**
 * Exact decimal arithmetic on integer minor units (e.g. cents) stored as `bigint`.
 *
 * Never do money or other exact-decimal math with `number`:
 * `0.1 + 0.2 !== 0.3`, and integers above 2^53 - 1 silently lose precision.
 * Parse decimal strings at the boundary, compute in minor units, format on the way out.
 */
import type { Brand } from './brand.ts';

/** An amount expressed in integer minor units at a fixed scale (number of decimals). */
export type Minor = Brand<bigint, 'Minor'>;

const DECIMAL = /^(-)?(\d+)(?:\.(\d+))?$/;

export class DecimalError extends Error {
  override readonly name = 'DecimalError';
}

function pow10(scale: number): bigint {
  if (!Number.isInteger(scale) || scale < 0 || scale > 18) {
    throw new DecimalError(`scale must be an integer in [0, 18], got ${String(scale)}`);
  }
  return 10n ** BigInt(scale);
}

/** Parses `"12.34"` at scale 2 into `1234n`. Rejects more decimals than `scale` allows. */
export function parseDecimal(input: string, scale: number): Minor {
  const match = DECIMAL.exec(input.trim());
  if (!match) throw new DecimalError(`not a decimal number: "${input}"`);
  const [, sign, whole = '0', fraction = ''] = match;
  if (fraction.length > scale) {
    throw new DecimalError(`"${input}" has more than ${String(scale)} decimal places`);
  }
  const units = BigInt(whole) * pow10(scale) + BigInt(fraction.padEnd(scale, '0') || '0');
  return (sign ? -units : units) as Minor;
}

/** Formats `1234n` at scale 2 as `"12.34"`. */
export function formatDecimal(value: Minor, scale: number): string {
  const factor = pow10(scale);
  const raw: bigint = value;
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const whole = abs / factor;
  const fraction = (abs % factor).toString().padStart(scale, '0');
  return `${negative ? '-' : ''}${whole.toString()}${scale > 0 ? `.${fraction}` : ''}`;
}

export const addMinor = (a: Minor, b: Minor): Minor => (a + b) as Minor;
export const subMinor = (a: Minor, b: Minor): Minor => (a - b) as Minor;

/** Divides with round-half-even ("banker's rounding"), the IEEE 754 default for decimals. */
export function divRoundHalfEven(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new DecimalError('division by zero');
  const negative = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator;
  const d = denominator < 0n ? -denominator : denominator;
  let q = n / d;
  const twiceRemainder = (n % d) * 2n;
  if (twiceRemainder > d || (twiceRemainder === d && q % 2n === 1n)) q += 1n;
  return negative ? -q : q;
}

/**
 * Multiplies a minor-unit amount by a decimal factor given as a string
 * (e.g. a tax rate `"0.19"`), rounding half-even back to the amount's scale.
 */
export function mulMinor(value: Minor, factor: string): Minor {
  const match = DECIMAL.exec(factor.trim());
  if (!match) throw new DecimalError(`not a decimal number: "${factor}"`);
  const fractionDigits = match[3]?.length ?? 0;
  const scaledFactor = parseDecimal(factor, fractionDigits);
  return divRoundHalfEven(value * scaledFactor, pow10(fractionDigits)) as Minor;
}

/**
 * Splits an amount into `parts` shares that differ by at most one minor unit
 * and always sum back to the original (no lost cents).
 */
export function allocateEvenly(value: Minor, parts: number): Minor[] {
  if (!Number.isSafeInteger(parts) || parts <= 0) {
    throw new DecimalError(`parts must be a positive integer, got ${String(parts)}`);
  }
  const n = BigInt(parts);
  const base = value / n;
  let remainder = value % n;
  const step = remainder < 0n ? -1n : 1n;
  return Array.from({ length: parts }, () => {
    if (remainder === 0n) return base as Minor;
    remainder -= step;
    return (base + step) as Minor;
  });
}

/** Adds two `number`s and throws instead of silently losing integer precision. */
export function safeIntAdd(a: number, b: number): number {
  const sum = a + b;
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || !Number.isSafeInteger(sum)) {
    throw new DecimalError(`unsafe integer arithmetic: ${String(a)} + ${String(b)}`);
  }
  return sum;
}
