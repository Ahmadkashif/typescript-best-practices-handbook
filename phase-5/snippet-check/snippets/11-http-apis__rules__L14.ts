import Fastify from 'fastify';
import { z } from 'zod';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

const app = Fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get('/users/:id', {
  schema: {
    params: z.object({ id: z.uuid() }),
    response: { 200: z.object({ id: z.uuid(), email: z.email() }) },
  },
}, async (req) => ({ id: req.params.id, email: 'a@example.com' }));
export {};
