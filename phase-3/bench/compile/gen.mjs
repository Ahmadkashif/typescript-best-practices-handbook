// Generates a mid-size, erasable-syntax-only TS backend project into ./proj/src
// Usage: node gen.mjs [modules=400]
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
const N = Number(process.argv[2] ?? 400);
rmSync('proj/src', { recursive: true, force: true });
mkdirSync('proj/src/lib', { recursive: true });
writeFileSync('proj/src/lib/core.ts', `
import { randomUUID } from 'node:crypto';
export type Brand<T, B extends string> = T & { readonly __brand: B };
export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };
export type AppError = { kind: 'not_found'; id: string } | { kind: 'invalid'; issues: readonly string[] } | { kind: 'conflict'; reason: string };
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
export const newId = <B extends string>(): Brand<string, B> => randomUUID() as Brand<string, B>;
export type DeepReadonly<T> = T extends (infer U)[] ? ReadonlyArray<DeepReadonly<U>> : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
export type Patch<T> = { [K in keyof T as K extends 'id' ? never : K]?: T[K] };
export interface Entity<B extends string> { readonly id: Brand<string, B>; readonly createdAt: Date; version: number }
export class MemoryRepo<B extends string, T extends Entity<B>> {
  readonly #rows = new Map<string, T>();
  get(id: Brand<string, B>): Result<DeepReadonly<T>> { const r = this.#rows.get(id); return r ? ok(r as DeepReadonly<T>) : err({ kind: 'not_found', id }); }
  insert(row: T): Result<T> { if (this.#rows.has(row.id)) return err({ kind: 'conflict', reason: 'dup' }); this.#rows.set(row.id, row); return ok(row); }
  update(id: Brand<string, B>, patch: Patch<T>): Result<T> { const r = this.#rows.get(id); if (!r) return err({ kind: 'not_found', id }); const n = { ...r, ...patch, version: r.version + 1 } as T; this.#rows.set(id, n); return ok(n); }
  list(pred: (t: T) => boolean = () => true): T[] { return [...this.#rows.values()].filter(pred); }
  get size(): number { return this.#rows.size; }
}
export function assertNever(x: never): never { throw new Error('unreachable: ' + JSON.stringify(x)); }
`);
const names = Array.from({ length: N }, (_, i) => `m${String(i).padStart(4, '0')}`);
for (let i = 0; i < N; i++) {
  const n = names[i], P = n[0].toUpperCase() + n.slice(1);
  const deps = [1, 7, 31].map((k) => i - k).filter((j) => j >= 0).map((j) => names[j]);
  const depImports = deps.map((d) => `import type { ${d[0].toUpperCase() + d.slice(1)}, ${d[0].toUpperCase() + d.slice(1)}Event } from './${d}.ts';\nimport { summarize${d[0].toUpperCase() + d.slice(1)} } from './${d}.ts';`).join('\n');
  const depFields = deps.map((d) => `  ${d}Ref?: ${d[0].toUpperCase() + d.slice(1)}['id'];\n  last${d[0].toUpperCase() + d.slice(1)}Event?: ${d[0].toUpperCase() + d.slice(1)}Event;`).join('\n');
  writeFileSync(`proj/src/${n}.ts`, `import { MemoryRepo, newId, ok, err, assertNever, type Brand, type Entity, type Result, type Patch } from './lib/core.ts';
${depImports}

export type ${P}Id = Brand<string, '${P}'>;
export const ${P}Status = { Draft: 'draft', Active: 'active', Archived: 'archived' } as const;
export type ${P}Status = (typeof ${P}Status)[keyof typeof ${P}Status];
export interface ${P} extends Entity<'${P}'> {
  name: string;
  status: ${P}Status;
  amountCents: number;
  tags: readonly string[];
  meta: Record<string, string | number | boolean>;
${depFields}
}
export type ${P}Event =
  | { type: '${n}.created'; at: Date; id: ${P}Id }
  | { type: '${n}.renamed'; at: Date; id: ${P}Id; from: string; to: string }
  | { type: '${n}.archived'; at: Date; id: ${P}Id; reason?: string };
export type Create${P}Input = Pick<${P}, 'name' | 'amountCents' | 'tags'> & Partial<Pick<${P}, 'meta'>>;

export function parse${P}Input(u: unknown): Result<Create${P}Input> {
  if (typeof u !== 'object' || u === null) return err({ kind: 'invalid', issues: ['not an object'] });
  const o = u as Record<string, unknown>;
  const issues: string[] = [];
  if (typeof o.name !== 'string' || o.name.length === 0) issues.push('name');
  if (typeof o.amountCents !== 'number' || !Number.isInteger(o.amountCents)) issues.push('amountCents');
  if (!Array.isArray(o.tags) || !o.tags.every((t): t is string => typeof t === 'string')) issues.push('tags');
  if (issues.length) return err({ kind: 'invalid', issues });
  return ok({ name: o.name as string, amountCents: o.amountCents as number, tags: o.tags as string[] });
}

export class ${P}Service {
  readonly #repo = new MemoryRepo<'${P}', ${P}>();
  readonly #events: ${P}Event[] = [];
  create(input: Create${P}Input): Result<${P}> {
    const row: ${P} = { id: newId<'${P}'>(), createdAt: new Date(), version: 1, status: ${P}Status.Draft, meta: {}, ...input };
    const r = this.#repo.insert(row);
    if (r.ok) this.#events.push({ type: '${n}.created', at: new Date(), id: row.id });
    return r;
  }
  rename(id: ${P}Id, to: string): Result<${P}> {
    const cur = this.#repo.get(id);
    if (!cur.ok) return cur;
    const patch: Patch<${P}> = { name: to };
    const r = this.#repo.update(id, patch);
    if (r.ok) this.#events.push({ type: '${n}.renamed', at: new Date(), id, from: cur.value.name, to });
    return r;
  }
  totals(): { count: number; cents: number; byStatus: Record<${P}Status, number> } {
    const byStatus: Record<${P}Status, number> = { draft: 0, active: 0, archived: 0 };
    let cents = 0;
    for (const r of this.#repo.list()) { byStatus[r.status]++; cents += r.amountCents; }
    return { count: this.#repo.size, cents, byStatus };
  }
  events(): readonly ${P}Event[] { return this.#events; }
}

export function describe${P}Event(e: ${P}Event): string {
  switch (e.type) {
    case '${n}.created': return \`created \${e.id}\`;
    case '${n}.renamed': return \`renamed \${e.from} -> \${e.to}\`;
    case '${n}.archived': return \`archived \${e.reason ?? ''}\`;
    default: return assertNever(e);
  }
}

export function summarize${P}(x: Pick<${P}, 'name' | 'amountCents'>): string {
  return \`\${x.name}:\${(x.amountCents / 100).toFixed(2)}\`;
}

export function run${P}(): number {
  const svc = new ${P}Service();
  const parsed = parse${P}Input({ name: '${n}', amountCents: ${i * 13 % 997}, tags: ['a', 'b'] });
  if (!parsed.ok) throw new Error('bad');
  const c = svc.create(parsed.value);
  if (c.ok) svc.rename(c.value.id, '${n}-renamed');
  const s = [${deps.map((d) => `summarize${d[0].toUpperCase() + d.slice(1)}({ name: '${d}', amountCents: 1 })`).join(', ')}];
  return svc.totals().cents + svc.events().map(describe${P}Event).join().length + s.length;
}
`);
}
writeFileSync('proj/src/main.ts', names.map((n) => `import { run${n[0].toUpperCase() + n.slice(1)} } from './${n}.ts';`).join('\n') +
  `\nconst t = ${names.map((n) => `run${n[0].toUpperCase() + n.slice(1)}()`).join(' + ')};\nconsole.log('ok', t);\n`);
console.log(`generated ${N} modules`);
