import express from 'express';
import { Order, PORT, summarize } from './schema.js';
const app = express();
app.disable('x-powered-by'); app.disable('etag');
app.use(express.json());
app.get('/', (_req, res) => { res.json({ hello: 'world' }); });
app.post('/orders', (req, res) => {
  const r = Order.safeParse(req.body);
  if (!r.success) { res.status(400).json(r.error.issues); return; }
  res.json(summarize(r.data));
});
app.listen(PORT);
