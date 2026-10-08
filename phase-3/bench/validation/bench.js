// Usage: node bench.js. Median ops/sec of 7 timed batches after warm-up, per library, valid + invalid input.
import { z } from 'zod';
import * as v from 'valibot';
import { Compile } from 'typebox/compile';
import Value from 'typebox/value';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { zodSchema, valibotSchema, typeboxSchema, valid, invalid } from './schemas.js';

const t0 = performance.now();
const ZS = zodSchema(); const zodBuild = performance.now() - t0;
const t1 = performance.now(); const VS = valibotSchema(); const vBuild = performance.now() - t1;
const t2 = performance.now(); const TS = typeboxSchema(); const TC = Compile(TS); const tbBuild = performance.now() - t2;
const t3 = performance.now(); const ajv = new Ajv({ allErrors: false }); addFormats(ajv); const AJ = ajv.compile(z.toJSONSchema(zodSchema(), { target: 'draft-07' })); const ajvBuild = performance.now() - t3;
const ajvAll = new Ajv({ allErrors: true }); addFormats(ajvAll); const AJA = ajvAll.compile(z.toJSONSchema(zodSchema(), { target: 'draft-07' }));

const cases = {
  'zod 4 safeParse': (x) => ZS.safeParse(x).success,
  'valibot safeParse': (x) => v.safeParse(VS, x).success,
  'typebox Compile().Check': (x) => TC.Check(x),
  'typebox Value.Check (no JIT)': (x) => Value.Check(TS, x),
  'ajv compiled (first error)': (x) => AJ(x),
  'ajv compiled (allErrors)': (x) => AJA(x),
};
// Error-path variants that also materialize the error list (what an API would return).
const errCases = {
  'zod 4 safeParse': (x) => { const r = ZS.safeParse(x); return r.success || r.error.issues.length; },
  'valibot safeParse': (x) => { const r = v.safeParse(VS, x); return r.success || r.issues.length; },
  'typebox Compile().Check': (x) => TC.Check(x) || [...TC.Errors(x)].length,
  'typebox Value.Check (no JIT)': (x) => Value.Check(TS, x) || [...Value.Errors(TS, x)].length,
  'ajv compiled (first error)': (x) => AJ(x) || AJ.errors.length,
  'ajv compiled (allErrors)': (x) => AJA(x) || AJA.errors.length,
};
// sanity
for (const [n, f] of Object.entries(cases)) if (f(valid) !== true || f(invalid) !== false) throw new Error(`sanity failed: ${n} valid=${f(valid)} invalid=${f(invalid)}`);

let sink = 0;
function bench(f, x) {
  const timeBatch = (n) => { const s = process.hrtime.bigint(); for (let i = 0; i < n; i++) sink ^= f(x) ? 1 : 0; return Number(process.hrtime.bigint() - s) / 1e9; };
  let n = 1000; while (timeBatch(n) < 0.05) n *= 2;     // calibrate to ~50ms and warm up JIT
  for (let i = 0; i < 5; i++) timeBatch(n);
  const r = []; for (let i = 0; i < 7; i++) r.push(n / timeBatch(n));
  return r.sort((a, b) => a - b)[3];
}
const fmt = (n) => Math.round(n).toLocaleString('en-US');
console.log('| Library | valid ops/s | invalid ops/s (incl. building error list) |\n|---|---:|---:|');
for (const n of Object.keys(cases)) console.log(`| ${n} | ${fmt(bench(cases[n], valid))} | ${fmt(bench(errCases[n], invalid))} |`);
console.error('sink', sink);
