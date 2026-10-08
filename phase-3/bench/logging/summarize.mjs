import { readFileSync } from 'node:fs';
const rows = readFileSync('raw.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const g = {}; for (const r of rows) ((g[r.kind] ??= {})[r.target] ??= []).push(r);
const med = (a, k) => a.map((x) => x[k]).sort((x, y) => x - y)[a.length >> 1];
console.log('| Logger | file (/dev/null) lines/s | RSS MB | pipe lines/s | RSS MB |\n|---|---:|---:|---:|---:|');
for (const [k, t] of Object.entries(g)) console.log(`| ${k} | ${med(t.file, 'opsPerSec').toLocaleString('en-US')} | ${med(t.file, 'rssMB')} | ${med(t.pipe, 'opsPerSec').toLocaleString('en-US')} | ${med(t.pipe, 'rssMB')} |`);
