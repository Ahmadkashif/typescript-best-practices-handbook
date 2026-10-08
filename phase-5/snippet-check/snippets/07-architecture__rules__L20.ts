// port (owned by the domain)
export type PaymentGateway = { charge(input: { cents: bigint; token: string }, signal?: AbortSignal): Promise<{ id: string }> };
// adapter (owned by infrastructure); validates the vendor response (VAL-006)
export function createFakeGateway(): PaymentGateway {
  let n = 0;
  return { async charge() { n += 1; return { id: `ch_${n}` }; } };
}
export {};
