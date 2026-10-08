// Usage: node cold.js <zod|valibot|typebox|ajv>. Fresh-process cost: import + build schema + first validation.
const lib = process.argv[2];
const t0 = performance.now();
const { valid } = await import('./schemas.js');   // note: schemas.js imports zod, valibot and typebox modules (not built)
const tImp0 = performance.now();
let check;
if (lib === 'zod') { const { zodSchema } = await import('./schemas.js'); const s = zodSchema(); check = (x) => s.safeParse(x).success; }
if (lib === 'valibot') { const v = await import('valibot'); const { valibotSchema } = await import('./schemas.js'); const s = valibotSchema(); check = (x) => v.safeParse(s, x).success; }
if (lib === 'typebox') { const { Compile } = await import('typebox/compile'); const { typeboxSchema } = await import('./schemas.js'); const c = Compile(typeboxSchema()); check = (x) => c.Check(x); }
if (lib === 'ajv') { const { default: Ajv } = await import('ajv'); const { default: addFormats } = await import('ajv-formats'); const { z } = await import('zod'); const { zodSchema } = await import('./schemas.js'); const js = z.toJSONSchema(zodSchema(), { target: 'draft-07' }); const a = new Ajv(); addFormats(a); const f = a.compile(js); check = f; }
if (!check(valid)) throw new Error('bad');
const t1 = performance.now();
let n = 0; const t2 = performance.now(); for (let i = 0; i < 100; i++) n += check(valid) ? 1 : 0; const t3 = performance.now();
console.log(JSON.stringify({ lib, buildAndFirstParseMs: +(t1 - tImp0).toFixed(2), next100Ms: +(t3 - t2).toFixed(2) }));
