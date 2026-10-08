import { NotFoundError } from '#src/lib/errors.ts';
import type { Clock } from '#src/lib/time.ts';
import type { TodoRepository } from './todo.repository.ts';
import { TodoId, type Todo } from './todo.schema.ts';

export interface TodoServiceDeps {
  readonly todos: TodoRepository;
  readonly clock: Clock;
}

export class TodoNotFoundError extends NotFoundError {
  constructor(id: TodoId) {
    super(`Todo ${id} was not found`, { details: { id } });
  }
}

/** Business logic. Knows nothing about HTTP; receives every dependency explicitly. */
export function createTodoService({ todos, clock }: TodoServiceDeps) {
  async function get(id: TodoId): Promise<Todo> {
    const todo = await todos.findById(id);
    if (!todo) throw new TodoNotFoundError(id);
    return todo;
  }

  return {
    get,

    async create(input: { readonly title: string }): Promise<Todo> {
      const todo: Todo = {
        id: TodoId.create(),
        title: input.title,
        completed: false,
        createdAt: clock.now(),
        completedAt: null,
      };
      await todos.insert(todo);
      return todo;
    },

    list(filter: { readonly completed?: boolean; readonly limit: number }): Promise<Todo[]> {
      return todos.list(filter);
    },

    /** Idempotent: completing an already completed todo keeps the first completion time. */
    async complete(id: TodoId): Promise<Todo> {
      const todo = await get(id);
      if (todo.completed) return todo;
      const updated: Todo = { ...todo, completed: true, completedAt: clock.now() };
      await todos.update(updated);
      return updated;
    },
  };
}

export type TodoService = ReturnType<typeof createTodoService>;
