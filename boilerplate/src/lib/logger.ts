import type { FastifyServerOptions } from 'fastify';
import type { Config } from '#src/config/env.ts';

/**
 * pino options for Fastify's built-in logger.
 * JSON lines in production (one object per line, ready for any log shipper);
 * pino-pretty only when explicitly asked for (local development).
 */
export function loggerOptions(
  config: Pick<Config, 'LOG_LEVEL' | 'LOG_FORMAT'>,
): NonNullable<FastifyServerOptions['logger']> {
  return {
    level: config.LOG_LEVEL,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      censor: '[REDACTED]',
    },
    ...(config.LOG_FORMAT === 'pretty'
      ? { transport: { target: 'pino-pretty', options: { translateTime: 'SYS:HH:MM:ss.l' } } }
      : {}),
  };
}
