import { z } from 'zod';

/**
 * Every environment variable the service reads is declared here, and nowhere
 * else may read `process.env`. The schema runs once at startup and the process
 * refuses to boot on invalid configuration.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(0).max(65_535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
  /** Max time to finish in-flight requests on SIGTERM before forcing exit. */
  SHUTDOWN_GRACE_MS: z.coerce.number().int().positive().default(10_000),
});

export type Config = Readonly<z.infer<typeof EnvSchema>>;

export class ConfigError extends Error {
  override readonly name = 'ConfigError';
}

/** Parses and freezes configuration. Pure: pass `process.env` in `main.ts`, a literal in tests. */
export function loadConfig(env: Readonly<Record<string, string | undefined>>): Config {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const fields = z.flattenError(result.error).fieldErrors;
    throw new ConfigError(`Invalid environment configuration: ${JSON.stringify(fields)}`);
  }
  return Object.freeze(result.data);
}
