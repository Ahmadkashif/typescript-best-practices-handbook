type Payment = { kind: string; last4?: string; iban?: string; code?: string };
export const p: Payment = { kind: 'card', iban: 'DE00' };
export {};
