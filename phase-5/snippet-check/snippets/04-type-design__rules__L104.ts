export function first<T>(xs: unknown[]): T | undefined { return xs[0] as T | undefined; } // T only in return: a hidden cast
export {};
