export function assertNever(x: never, msg = 'Unexpected variant'): never {
  throw new Error(`${msg}: ${JSON.stringify(x)}`);
}

type Payment =
  | { kind: 'card'; last4: string }
  | { kind: 'bank'; iban: string }
  | { kind: 'voucher'; code: string };

export function describe(p: Payment): string {
  switch (p.kind) {
    case 'card': return `card ****${p.last4}`;
    case 'bank': return `bank ${p.iban.slice(0, 4)}...`;
    case 'voucher': return `voucher ${p.code}`;
    default: return assertNever(p);
  }
}
export {};
