import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from '#test/helpers.ts';

let app: FastifyInstance;

beforeAll(async () => {
  ({ app } = await createTestApp());
  // A route that fails unexpectedly, to prove internals never leak.
  app.get('/boom', () => {
    throw new Error('secret database password in message');
  });
  await app.ready();
});
afterAll(async () => {
  await app.close();
});

describe('todos API', () => {
  it('creates, reads, lists and completes a todo', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/v1/todos',
      payload: { title: '  ship it  ' },
    });
    expect(created.statusCode).toBe(201);
    const todo = created.json<{ id: string; title: string }>();
    expect(todo).toMatchObject({
      title: 'ship it',
      completed: false,
      createdAt: '2026-10-06T12:00:00.000Z',
      completedAt: null,
    });

    const fetched = await app.inject({ method: 'GET', url: `/v1/todos/${todo.id}` });
    expect(fetched.json()).toEqual(created.json());

    const completed = await app.inject({ method: 'POST', url: `/v1/todos/${todo.id}/complete` });
    expect(completed.json()).toMatchObject({
      completed: true,
      completedAt: '2026-10-06T12:00:00.000Z',
    });

    const list = await app.inject({ method: 'GET', url: '/v1/todos?completed=true&limit=5' });
    expect(list.statusCode).toBe(200);
    expect(list.json()).toHaveLength(1);
  });

  it('rejects invalid bodies with a problem+json 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/todos',
      payload: { title: '', extra: true },
    });
    expect(res.statusCode).toBe(400);
    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(res.json()).toMatchObject({
      code: 'VALIDATION_FAILED',
      status: 400,
      instance: '/v1/todos',
    });
  });

  it('rejects malformed JSON as BAD_REQUEST', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/todos',
      headers: { 'content-type': 'application/json' },
      payload: '{not json',
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('validates path params and query strings', async () => {
    expect((await app.inject({ method: 'GET', url: '/v1/todos/not-a-uuid' })).statusCode).toBe(400);
    expect((await app.inject({ method: 'GET', url: '/v1/todos?limit=1000' })).statusCode).toBe(400);
  });

  it('maps domain errors to 404 with a stable code', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/todos/0b6b1c4e-8f7e-4b8a-9b1e-2f8a3c1d5e6f',
    });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'NOT_FOUND', title: 'Not found' });
  });

  it('answers unknown routes with problem+json 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/nope' });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'NOT_FOUND' });
  });

  it('hides internals of unexpected errors', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/boom',
      headers: { 'x-request-id': 'r-1' },
    });
    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain('secret');
    expect(res.json()).toMatchObject({ code: 'INTERNAL', requestId: 'r-1' });
  });
});
