import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from '#test/helpers.ts';

let app: FastifyInstance | undefined;
afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe('health endpoints', () => {
  it('GET /health is 200 without touching dependencies', async () => {
    ({ app } = await createTestApp({
      readinessChecks: [{ name: 'db', check: () => Promise.reject(new Error('down')) }],
    }));
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });

  it('GET /ready is 200 when every check passes', async () => {
    ({ app } = await createTestApp({
      readinessChecks: [{ name: 'db', check: () => Promise.resolve() }],
    }));
    const res = await app.inject({ method: 'GET', url: '/ready' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok', checks: [{ name: 'db', ok: true }] });
  });

  it('GET /ready is 503 when a check fails or times out', async () => {
    ({ app } = await createTestApp({
      readinessChecks: [
        { name: 'db', check: () => Promise.reject(new Error('connection refused')) },
        {
          name: 'slow',
          check: (signal) =>
            new Promise((_resolve, reject) => {
              signal.addEventListener('abort', () => {
                reject(new Error('timed out'));
              });
            }),
        },
      ],
    }));
    const res = await app.inject({ method: 'GET', url: '/ready' });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({
      status: 'unavailable',
      checks: [
        { name: 'db', ok: false, error: 'connection refused' },
        { name: 'slow', ok: false, error: 'timed out' },
      ],
    });
  }, 10_000);

  it('GET /ready is 503 once shutdown has begun', async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    testApp.container.lifecycle.beginShutdown();
    const res = await app.inject({ method: 'GET', url: '/ready' });
    expect(res.statusCode).toBe(503);
  });
});
