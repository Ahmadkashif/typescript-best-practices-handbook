// Usage: node run.mjs [reps=5]. Prints a markdown table of median wall time and max RSS.
// CPU warmer: a busy loop on CPU 9 keeps the package out of deep C-states / low P-states.
// Without it, short-process timings on this powersave-governed desktop were bimodal (105 ms vs 355 ms).
import { spawn } from 'node:child_process';
const warmer = spawn('taskset', ['-c', '9', 'node', '-e', 'for(;;){}'], { stdio: 'ignore' });
process.on('exit', () => warmer.kill());
import { spawnSync } from 'node:child_process';
import { rmSync, statSync, readdirSync } from 'node:fs';
const REPS = Number(process.argv[2] ?? 5);
const bin = (b) => `node_modules/.bin/${b}`;
const tsc6 = ['node', 'node_modules/typescript6/bin/tsc'];
const measure = (cmd, { clean, cwd } = {}) => {
  const times = [], rss = [];
  for (let i = 0; i < REPS + 1; i++) {   // first run is a discarded warm-up (fs cache)
    if (clean) rmSync(clean, { recursive: true, force: true });
    const t0 = process.hrtime.bigint();
    const r = spawnSync('/usr/bin/time', ['-f', '%M', ...cmd], { cwd, encoding: 'utf8', timeout: 120_000 });
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    if (r.status !== 0) { console.error(cmd.join(' '), r.stdout, r.stderr); throw new Error('failed'); }
    if (i === 0) continue;
    times.push(ms); rss.push(Number(r.stderr.trim().split('\n').at(-1)) / 1024);
  }
  const med = (a) => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
  return { ms: med(times), rss: med(rss) };
};
const size = (p) => { let s = 0; for (const f of readdirSync(p, { recursive: true, withFileTypes: true })) if (f.isFile()) s += statSync(`${f.parentPath}/${f.name}`).size; return s; };
const rows = [];
const add = (group, name, cmd, opts) => { const r = measure(cmd, opts); rows.push({ group, name, ...r }); console.error(group, name, r.ms.toFixed(0), r.rss.toFixed(0)); };

// 1. Typecheck only
add('typecheck', 'tsc 6.0.3 (JS) --noEmit', [...tsc6, '--noEmit', '-p', 'proj']);
add('typecheck', 'tsc 7.0.2 (native) --noEmit', [bin('tsc'), '--noEmit', '-p', 'proj']);
add('typecheck', 'tsc 7.0.2 --noEmit --singleThreaded', [bin('tsc'), '--noEmit', '--singleThreaded', '-p', 'proj']);
// 2. Build (emit)
add('build', 'tsc 6.0.3 emit (typecheck + emit)', [...tsc6, '-p', 'proj', '--outDir', 'out/tsc6'], { clean: 'out/tsc6' });
add('build', 'tsc 7.0.2 emit (typecheck + emit)', [bin('tsc'), '-p', 'proj', '--outDir', 'out/tsc7'], { clean: 'out/tsc7' });
const files = readdirSync('proj/src', { recursive: true }).filter((f) => f.endsWith('.ts')).map((f) => `proj/src/${f}`);
add('build', 'esbuild transpile, unbundled (no typecheck)', [bin('esbuild'), ...files, '--outdir=out/esb-files', '--platform=node', '--format=esm', '--log-level=warning'], { clean: 'out/esb-files' });
add('build', 'esbuild bundle (no typecheck)', [bin('esbuild'), 'proj/src/main.ts', '--bundle', '--outfile=out/esb-bundle/main.js', '--platform=node', '--format=esm', '--log-level=warning'], { clean: 'out/esb-bundle' });
add('build', 'tsdown 0.23 bundle (rolldown, no typecheck)', [bin('tsdown'), '--config', 'tsdown.config.ts'], { clean: 'out/tsdown' });
add('build', 'tsup 8.5 bundle (esbuild, no typecheck)', [bin('tsup'), 'proj/src/main.ts', '--format', 'esm', '--platform', 'node', '--out-dir', 'out/tsup', '--silent'], { clean: 'out/tsup' });
// 3. Run / cold start (whole 400-module app: import everything, run, exit)
add('start', 'node dist (tsc output, 402 files)', ['node', 'out/tsc7/main.js']);
add('start', 'node bundle (esbuild single file)', ['node', 'out/esb-bundle/main.js']);
add('start', 'node src/main.ts (native type stripping)', ['node', 'proj/src/main.ts']);
add('start', 'tsx src/main.ts', [bin('tsx'), 'proj/src/main.ts']);
add('start', 'node --import tsx src/main.ts', ['node', '--import', 'tsx', 'proj/src/main.ts']);
add('start', 'node -e "" (baseline: empty process)', ['node', '-e', '']);

console.log(`| Group | Command | median ms | max RSS MB |\n|---|---|---:|---:|`);
for (const r of rows) console.log(`| ${r.group} | ${r.name} | ${r.ms.toFixed(0)} | ${r.rss.toFixed(0)} |`);
console.log(`\nOutput sizes: tsc7 dist ${(size('out/tsc7') / 1024).toFixed(0)} KB, esbuild bundle ${(size('out/esb-bundle') / 1024).toFixed(0)} KB, tsdown ${(size('out/tsdown') / 1024).toFixed(0)} KB, tsup ${(size('out/tsup') / 1024).toFixed(0)} KB`);
warmer.kill();
