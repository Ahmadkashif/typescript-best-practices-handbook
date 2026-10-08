export async function getJson(url: string, parent?: AbortSignal): Promise<unknown> {
  const signal = parent ? AbortSignal.any([parent, AbortSignal.timeout(5_000)]) : AbortSignal.timeout(5_000);
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}
export {};
