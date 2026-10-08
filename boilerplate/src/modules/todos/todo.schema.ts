import { z } from 'zod';
import { uuidId } from '#src/lib/brand.ts';

export const TodoId = uuidId('TodoId');
export type TodoId = z.infer<typeof TodoId.schema>;

/** The domain entity. Timestamps are `Date` inside the service, ISO strings on the wire. */
export interface Todo {
  readonly id: TodoId;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
  readonly completedAt: Date | null;
}

/* ---------- HTTP contract (single source of truth for validation and types) ---------- */

export const TodoResponse = z.object({
  id: z.uuid(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
  completedAt: z.iso.datetime().nullable(),
});
export type TodoResponse = z.infer<typeof TodoResponse>;

export const CreateTodoBody = z.strictObject({
  title: z.string().trim().min(1).max(200),
});
export type CreateTodoBody = z.infer<typeof CreateTodoBody>;

export const TodoParams = z.object({ id: TodoId.schema });

export const ListTodosQuery = z.object({
  completed: z.stringbool().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListTodosQuery = z.infer<typeof ListTodosQuery>;

export const toTodoResponse = (todo: Todo): TodoResponse => ({
  id: todo.id,
  title: todo.title,
  completed: todo.completed,
  createdAt: todo.createdAt.toISOString(),
  completedAt: todo.completedAt?.toISOString() ?? null,
});
