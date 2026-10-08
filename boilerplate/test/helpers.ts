import type { FastifyInstance } from 'fastify';
import { buildApp } from '#src/app.ts';
import { loadConfig } from '#src/config/env.ts';
import { createContainer, type Container, type ContainerOverrides } from '#src/container.ts';
import { fixedClock } from '#src/lib/time.ts';

export interface TestApp {
  readonly app: FastifyInstance;
  readonly container: Container;
}

/** A real app with real wiring, silent logs and a frozen clock. */
export async function createTestApp(overrides: ContainerOverrides = {}): Promise<TestApp> {
  const config = loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    PORT: '0',
    HOST: '127.0.0.1',
  });
  const container = createContainer(config, {
    clock: fixedClock('2026-10-06T12:00:00.000Z'),
    ...overrides,
  });
  const app = await buildApp(container);
  return { app, container };
}
