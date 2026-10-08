import { describe, expect, it } from 'vitest';
import { fixedClock, MINUTE } from '#src/lib/time.ts';
import { createInMemoryTodoRepository } from './todo.repository.ts';
import { TodoId } from './todo.schema.ts';
import { createTodoService, TodoNotFoundError } from './todo.service.ts';

const setup = () => {
  const clock = fixedClock('2026-10-06T09:00:00.000Z');
  const service = createTodoService({ todos: createInMemoryTodoRepository(), clock });
  return { clock, service };
};

describe('todo service', () => {
  it('creates, lists and completes todos', async () => {
    const { clock, service } = setup();
    const todo = await service.create({ title: 'write tests' });
    expect(todo).toMatchObject({ title: 'write tests', completed: false, completedAt: null });

    clock.advance(MINUTE);
    const done = await service.complete(todo.id);
    expect(done.completedAt?.toISOString()).toBe('2026-10-06T09:01:00.000Z');

    clock.advance(MINUTE);
    const again = await service.complete(todo.id);
    expect(again.completedAt).toEqual(done.completedAt);

    await service.create({ title: 'second' });
    expect(await service.list({ limit: 10 })).toHaveLength(2);
    expect(await service.list({ completed: true, limit: 10 })).toEqual([done]);
    expect(await service.list({ limit: 1 })).toHaveLength(1);
  });

  it('throws a typed not-found error', async () => {
    const { service } = setup();
    const missing = TodoId.create();
    await expect(service.get(missing)).rejects.toBeInstanceOf(TodoNotFoundError);
    await expect(service.complete(missing)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });
});
