// Usage: node run.mjs [rounds=30]. Variants are interleaved round-robin so background noise hits all equally.
// Wall time = spawn -> exit (boot, listen, close). "ready" = process-internal performance.now() at listen.
// CPU warmer: a busy loop on CPU 9 keeps the package out of deep C-states / low P-states.
// Without it, short-process timings on this powersave-governed desktop were bimodal (105 ms vs 355 ms).
import { spawn } from 'node:child_process';
const warmer = spawn('taskset', ['-c', '9', 'node', '-e', 'for(;;){}'], { stdio: 'ignore' });
process.on('exit', () => warmer.kill());
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
const ROUNDS = Number(process.argv[2] ?? 30);
const V = [
  ['ESM unbundled (tsc output)', ['node', 'dist/app.js']],
  ['CJS unbundled', ['node', 'out/cjs/app.cjs']],
  ['ESM bundle (esbuild)', ['node', 'out/bundle.mjs']],
  ['ESM bundle minified', ['node', 'out/bundle.min.mjs']],
  ['CJS bundle (esbuild)', ['node', 'out/bundle.cjs']],
  ['TS source, native type stripping', ['node', 'src/app.ts']],
  ['TS source, node --import tsx', ['node', '--import', 'tsx', 'src/app.ts']],
  ['TS source, tsx CLI', ['node_modules/.bin/tsx', 'src/app.ts']],
];
const variants = V.flatMap(([n, a]) => [{ n, a, cache: false }, { n, a, cache: true }]);
rmSync('.cache', { recursive: true, force: true });
const res = new Map(variants.map((v) => [v, { wall: [], ready: [], rss: [] }]));
for (let round = 0; round < ROUNDS + 2; round++) {
  for (const v of variants) {
    const env = { ...process.env, EXIT_AFTER_LISTEN: '1', ...(v.cache ? { NODE_COMPILE_CACHE: `.cache/${variants.indexOf(v)}` } : {}) };
    const s = process.hrtime.bigint();
    const r = spawnSync('/usr/bin/time', ['-f', '%M', ...v.a], { encoding: 'utf8', timeout: 20000, env });
    const ms = Number(process.hrtime.bigint() - s) / 1e6;
    if (r.status !== 0 || !r.stdout.includes('ready')) throw new Error(v.a.join(' ') + r.stderr);
    if (round < 2) continue; // warm fs cache + populate compile cache
    const o = res.get(v); o.wall.push(ms); o.ready.push(Number(/ready ([\d.]+)/.exec(r.stdout)[1])); o.rss.push(Number(r.stderr.trim().split('\n').at(-1)) / 1024);
  }
}
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))]; };
console.log(`| Variant | compile cache | wall median ms (p25-p75) | in-process ready ms | max RSS MB |\n|---|---|---:|---:|---:|`);
for (const v of variants) { const o = res.get(v); console.log(`| ${v.n} | ${v.cache ? 'on' : 'off'} | ${q(o.wall, .5).toFixed(0)} (${q(o.wall, .25).toFixed(0)}-${q(o.wall, .75).toFixed(0)}) | ${q(o.ready, .5).toFixed(0)} | ${q(o.rss, .5).toFixed(0)} |`); }
rmSync('.cache', { recursive: true, force: true });
warmer.kill();
