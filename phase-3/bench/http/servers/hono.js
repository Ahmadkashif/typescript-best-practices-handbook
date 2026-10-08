import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Order, PORT, summarize } from './schema.js';
const app = new Hono();
app.get('/', (c) => c.json({ hello: 'world' }));
app.post('/orders', async (c) => {
  const r = Order.safeParse(await c.req.json());
  if (!r.success) return c.json(r.error.issues, 400);
  return c.json(summarize(r.data));
});
serve({ fetch: app.fetch, port: PORT });
