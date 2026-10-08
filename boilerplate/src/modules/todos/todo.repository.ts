import type { Todo, TodoId } from './todo.schema.ts';

/**
 * Persistence port. The service depends on this interface only; swap the
 * in-memory adapter for a database adapter in `src/container.ts`.
 */
export interface TodoRepository {
  insert(todo: Todo): Promise<void>;
  update(todo: Todo): Promise<void>;
  findById(id: TodoId): Promise<Todo | undefined>;
  list(filter: { readonly completed?: boolean; readonly limit: number }): Promise<Todo[]>;
}

export function createInMemoryTodoRepository(): TodoRepository {
  const rows = new Map<TodoId, Todo>();
  return {
    insert: (todo) => {
      rows.set(todo.id, todo);
      return Promise.resolve();
    },
    update: (todo) => {
      rows.set(todo.id, todo);
      return Promise.resolve();
    },
    findById: (id) => Promise.resolve(rows.get(id)),
    list: ({ completed, limit }) =>
      Promise.resolve(
        [...rows.values()]
          .filter((todo) => completed === undefined || todo.completed === completed)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .slice(0, limit),
      ),
  };
}
