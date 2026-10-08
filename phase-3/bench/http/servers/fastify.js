import Fastify from 'fastify';
import { jsonSchema, PORT, summarize } from './schema.js';
// Idiomatic Fastify: JSON Schema validated by its compiled ajv; response schema -> fast-json-stringify.
const app = Fastify({ logger: false });
app.get('/', { schema: { response: { 200: { type: 'object', properties: { hello: { type: 'string' } } } } } }, async () => ({ hello: 'world' }));
const { $schema, ...body } = jsonSchema;
app.post('/orders', { schema: { body, response: { 200: { type: 'object', properties: { ok: { type: 'boolean' }, items: { type: 'integer' }, total: { type: 'number' } } } } } },
  async (req) => summarize(req.body));
await app.listen({ port: PORT, host: '127.0.0.1' });
