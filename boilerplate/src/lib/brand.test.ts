import { describe, expect, expectTypeOf, it } from 'vitest';
import { uuidId, type Brand } from './brand.ts';

const OrderId = uuidId('OrderId');
type OrderId = Brand<string, 'OrderId'>;
const CustomerId = uuidId('CustomerId');

describe('uuidId', () => {
  it('creates and parses branded UUIDs', () => {
    const id = OrderId.create();
    expect(OrderId.parse(id)).toBe(id);
    expectTypeOf(id).toEqualTypeOf<OrderId>();
  });

  it('rejects non-UUIDs', () => {
    expect(() => OrderId.parse('not-a-uuid')).toThrow();
  });

  it('keeps different brands apart at compile time', () => {
    expectTypeOf(CustomerId.create()).not.toEqualTypeOf<OrderId>();
    // @ts-expect-error: a plain string is not an OrderId
    const bad: OrderId = 'a5f9cf1e-3c7b-4c56-9c43-6a2c3f4e5d6f';
    expect(bad).toBeTypeOf('string');
  });
});
