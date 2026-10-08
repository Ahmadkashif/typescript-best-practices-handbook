export function maxOf(xs: readonly number[]): number | undefined {
  let best: number | undefined;
  for (const x of xs) if (best === undefined || x > best) best = x;
  return best;
}
export {};
