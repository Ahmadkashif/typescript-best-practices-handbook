import Fastify, { type FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import type { Container } from '#src/container.ts';
import { registerErrorHandling } from '#src/http/error-handler.ts';
import { healthRoutes } from '#src/http/health.ts';
import { SECOND } from '#src/lib/time.ts';
import { loggerOptions } from '#src/lib/logger.ts';
import { todoRoutes } from '#src/modules/todos/todo.routes.ts';

/**
 * Builds a fully wired Fastify instance without listening.
 * Tests call it and use `app.inject()`; `main.ts` calls it and listens.
 */
export async function buildApp(container: Container): Promise<FastifyInstance> {
  const app = Fastify({
    logger: loggerOptions(container.config),
    requestIdHeader: 'x-request-id',
    // Protect against slow or idle clients holding sockets open.
    connectionTimeout: 30 * SECOND,
    requestTimeout: 30 * SECOND,
    keepAliveTimeout: 5 * SECOND,
    bodyLimit: 1024 * 1024,
    // While closing, answer new requests on kept-alive sockets with 503.
    return503OnClosing: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandling(app);

  app.addHook('onClose', async () => {
    await container.dispose();
  });

  await app.register(healthRoutes, {
    checks: container.readinessChecks,
    lifecycle: container.lifecycle,
    checkTimeoutMs: 2 * SECOND,
  });
  await app.register(todoRoutes, { prefix: '/v1', todoService: container.todoService });

  return app;
}
