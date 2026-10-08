import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { toError } from '#src/lib/errors.ts';

/** A dependency the service needs before it can take traffic (database, queue, ...). */
export interface ReadinessCheck {
  readonly name: string;
  /** Resolve when healthy, reject otherwise. Must respect `signal`. */
  readonly check: (signal: AbortSignal) => Promise<void>;
}

/** Flipped once on shutdown, so readiness fails before connections close. */
export interface Lifecycle {
  readonly isShuttingDown: () => boolean;
  readonly beginShutdown: () => void;
}

export function createLifecycle(): Lifecycle {
  let shuttingDown = false;
  return {
    isShuttingDown: () => shuttingDown,
    beginShutdown: () => {
      shuttingDown = true;
    },
  };
}

export interface HealthRoutesOptions {
  readonly checks: readonly ReadinessCheck[];
  readonly lifecycle: Lifecycle;
  readonly checkTimeoutMs: number;
}

const CheckResult = z.object({ name: z.string(), ok: z.boolean(), error: z.string().optional() });
const ReadyResponse = z.object({
  status: z.enum(['ok', 'unavailable']),
  checks: z.array(CheckResult),
});

/**
 * `GET /health`: liveness. 200 while the event loop can serve requests; never checks dependencies
 *   (a failing database must not make the orchestrator restart every pod).
 * `GET /ready`: readiness. 503 while shutting down or when any dependency check fails or times out.
 */
export const healthRoutes: FastifyPluginAsyncZod<HealthRoutesOptions> = (app, options) => {
  app.get(
    '/health',
    { logLevel: 'warn', schema: { response: { 200: z.object({ status: z.literal('ok') }) } } },
    () => ({ status: 'ok' as const }),
  );

  app.get(
    '/ready',
    { logLevel: 'warn', schema: { response: { 200: ReadyResponse, 503: ReadyResponse } } },
    async (_request, reply) => {
      if (options.lifecycle.isShuttingDown()) {
        return reply.code(503).send({ status: 'unavailable', checks: [] });
      }
      const checks = await Promise.all(
        options.checks.map(async ({ name, check }) => {
          try {
            await check(AbortSignal.timeout(options.checkTimeoutMs));
            return { name, ok: true };
          } catch (error) {
            return { name, ok: false, error: toError(error).message };
          }
        }),
      );
      const ok = checks.every((c) => c.ok);
      return reply.code(ok ? 200 : 503).send({ status: ok ? 'ok' : 'unavailable', checks });
    },
  );

  return Promise.resolve();
};
