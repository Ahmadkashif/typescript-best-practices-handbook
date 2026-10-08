import { describe, expect, it } from 'vitest';
import { assertNever } from './assert-never.ts';

type Shape = { kind: 'circle'; r: number } | { kind: 'square'; side: number };

const area = (shape: Shape): number => {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.r ** 2;
    case 'square':
      return shape.side ** 2;
    default:
      return assertNever(shape);
  }
};

describe('assertNever', () => {
  it('lets exhaustive switches compile and run', () => {
    expect(area({ kind: 'square', side: 2 })).toBe(4);
  });

  it('throws if reached at runtime with unexpected data', () => {
    expect(() => area(JSON.parse('{"kind":"triangle"}') as Shape)).toThrow(/Unexpected value/);
  });
});
