// Usage: node bench.js <logger> [n=200000] > /dev/null   (logs go to stdout; timing goes to stderr)
// Lines are emitted in batches of 50 per setImmediate tick (like requests interleaved with I/O), so async
// destinations get a chance to drain. Time is measured until every line has been flushed.
import pino from 'pino';
import winston from 'winston';
const [kind, nArg] = process.argv.slice(2); const N = Number(nArg ?? 200000); const BATCH = 50;
const ctx = { reqId: 'b6f1a2', userId: 42, route: '/orders', durationMs: 12.7 };
let log, done = async () => {};
const pinoFlush = (l) => () => new Promise((r) => l.flush(() => r()));
if (kind === 'pino') { const l = pino({ base: undefined }); log = (i) => l.info({ ...ctx, i }, 'request completed'); done = pinoFlush(l); }
if (kind === 'pino-sync') { const l = pino({ base: undefined }, pino.destination({ dest: 1, sync: true })); log = (i) => l.info({ ...ctx, i }, 'request completed'); }
if (kind === 'pino-child') { const l = pino({ base: undefined }).child(ctx); log = (i) => l.info({ i }, 'request completed'); done = pinoFlush(l); }
if (kind === 'winston') { const l = winston.createLogger({ format: winston.format.combine(winston.format.timestamp(), winston.format.json()), transports: [new winston.transports.Console()] }); log = (i) => l.info('request completed', { ...ctx, i }); done = () => new Promise((r) => { l.on('finish', r); l.end(); }); }
if (kind === 'console-json') { log = (i) => console.log(JSON.stringify({ level: 30, time: Date.now(), ...ctx, i, msg: 'request completed' })); }
if (kind === 'stdout-write-json') { log = (i) => process.stdout.write(JSON.stringify({ level: 30, time: Date.now(), ...ctx, i, msg: 'request completed' }) + '\n'); done = () => new Promise((r) => process.stdout.write('', r)); }
const tick = () => new Promise((r) => setImmediate(r));
async function emit(n) { for (let i = 0; i < n; i += BATCH) { for (let j = i; j < Math.min(n, i + BATCH); j++) log(j); await tick(); } }
await emit(5000); // warm-up
const t0 = process.hrtime.bigint();
await emit(N); await done();
const s = Number(process.hrtime.bigint() - t0) / 1e9;
process.stderr.write(JSON.stringify({ kind, opsPerSec: Math.round(N / s), ms: +(s * 1000).toFixed(0), rssMB: Math.round(process.memoryUsage().rss / 2 ** 20) }) + '\n');
