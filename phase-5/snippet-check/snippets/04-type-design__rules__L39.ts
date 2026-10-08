declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseUserId(raw: string): UserId | undefined {
  return UUID.test(raw) ? (raw as UserId) : undefined; // the single sanctioned cast
}

declare function loadOrder(id: OrderId): void;
declare const u: UserId;
// loadOrder(u); // error: UserId is not assignable to OrderId
export {};
