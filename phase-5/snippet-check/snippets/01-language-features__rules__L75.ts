export function total(items: any): number { return items.reduce((a: number, b: any) => a + b.price, 0); }
export {};
