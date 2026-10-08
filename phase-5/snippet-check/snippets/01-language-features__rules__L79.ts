type Item = { readonly price: number };
export function total(items: readonly Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
export {};
