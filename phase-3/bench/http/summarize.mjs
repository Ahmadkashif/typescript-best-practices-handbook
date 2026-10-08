// Median of runs per server/route from raw/summary.tsv -> markdown table.
import { readFileSync } from 'node:fs';
const rows = readFileSync('raw/summary.tsv', 'utf8').trim().split('\n').map((l) => l.split('\t'));
const g = {};
for (const [s, route, , rps, p50, p99, non2xx, errors] of rows) ((g[s] ??= {})[route] ??= []).push({ rps: +rps, p50: +p50, p99: +p99, bad: +non2xx + +errors });
const med = (a, k) => a.map((x) => x[k]).sort((x, y) => x - y)[a.length >> 1];
const base = { get: med(g['node-http'].get, 'rps'), post: med(g['node-http'].post, 'rps') };
console.log('| Server | GET / req/s | p50 / p99 ms | % of node:http | POST /orders (validated) req/s | p50 / p99 ms | % of node:http | non-2xx+errors |\n|---|---:|---:|---:|---:|---:|---:|---:|');
for (const [s, r] of Object.entries(g)) {
  const c = (k) => `${med(r[k], 'rps').toLocaleString('en-US')} | ${med(r[k], 'p50')} / ${med(r[k], 'p99')} | ${Math.round((100 * med(r[k], 'rps')) / base[k])}%`;
  console.log(`| ${s} | ${c('get')} | ${c('post')} | ${[...r.get, ...r.post].reduce((a, x) => a + x.bad, 0)} |`);
}
