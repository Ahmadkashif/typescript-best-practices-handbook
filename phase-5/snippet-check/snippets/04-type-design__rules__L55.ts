type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
declare function loadOrder(id: OrderId): void;
declare const u: UserId;
loadOrder(u);
export {};
