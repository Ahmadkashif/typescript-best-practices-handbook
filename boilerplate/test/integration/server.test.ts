import { describe, expect, it } from 'vitest';
import { createTestApp } from '#test/helpers.ts';

describe('real HTTP server', () => {
  it('listens on a socket, serves /health and closes cleanly', async () => {
    const { app } = await createTestApp();
    const address = await app.listen({ host: '127.0.0.1', port: 0 });
    try {
      const res = await fetch(`${address}/health`);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: 'ok' });
    } finally {
      await app.close();
    }
    expect(app.server.listening).toBe(false);
  });
});
