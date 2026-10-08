import Fastify from 'fastify';
import { Order, PORT, summarize } from './schema.js';
// Fastify with zod doing validation (what fastify-type-provider-zod effectively does), no schemas.
const app = Fastify({ logger: false });
app.get('/', async () => ({ hello: 'world' }));
app.post('/orders', async (req, reply) => {
  const r = Order.safeParse(req.body);
  if (!r.success) return reply.code(400).send(r.error.issues);
  return summarize(r.data);
});
await app.listen({ port: PORT, host: '127.0.0.1' });
