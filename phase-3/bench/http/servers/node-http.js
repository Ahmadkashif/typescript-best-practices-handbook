import { createServer } from 'node:http';
import { Order, PORT, summarize } from './schema.js';
const hello = JSON.stringify({ hello: 'world' });
createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'content-type': 'application/json' }); res.end(hello); return;
  }
  if (req.method === 'POST' && req.url === '/orders') {
    const chunks = []; req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      let body; try { body = JSON.parse(Buffer.concat(chunks)); } catch { res.writeHead(400); res.end(); return; }
      const r = Order.safeParse(body);
      if (!r.success) { res.writeHead(400, { 'content-type': 'application/json' }); res.end(JSON.stringify(r.error.issues)); return; }
      res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(summarize(r.data)));
    });
    return;
  }
  res.writeHead(404); res.end();
}).listen(PORT);
