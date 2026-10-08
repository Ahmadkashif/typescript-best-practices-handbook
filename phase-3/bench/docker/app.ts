// A small but realistic service: fastify + pino + zod-validated env and route. Boots, listens, exits.
import Fastify from 'fastify';
import { pino } from 'pino';
import { z } from 'zod';

const Env = z.object({ PORT: z.coerce.number().int().default(0), LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('silent') });
const env = Env.parse(process.env);
const Order = z.object({ customerId: z.uuid(), items: z.array(z.object({ sku: z.string(), qty: z.number().int().positive() })).min(1) });

const logger = pino({ level: env.LOG_LEVEL });
const app = Fastify({ loggerInstance: logger });
app.get('/health', async () => ({ status: 'ok' }));
app.post('/orders', async (req, reply) => {
  const r = Order.safeParse(req.body);
  if (!r.success) return reply.code(400).send({ issues: r.error.issues });
  return { ok: true, items: r.data.items.length };
});
// No top-level await, so the same source can be emitted as CJS.
async function main(): Promise<void> {
  await app.listen({ port: env.PORT, host: '127.0.0.1' });
  if (process.env.EXIT_AFTER_LISTEN === '1') { process.stdout.write(`ready ${performance.now().toFixed(1)}\n`); await app.close(); }
}
void main();
