export type Order = { readonly id: string; readonly lines: readonly { readonly sku: string; readonly qty: number }[] };
export function totalQty(o: Order): number { return o.lines.reduce((n, l) => n + l.qty, 0); }
export {};
