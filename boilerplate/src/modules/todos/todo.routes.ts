import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { TodoService } from './todo.service.ts';
import {
  CreateTodoBody,
  ListTodosQuery,
  TodoParams,
  TodoResponse,
  toTodoResponse,
} from './todo.schema.ts';

export interface TodoRoutesOptions {
  readonly todoService: TodoService;
}

/** HTTP adapter: validates input, calls the service, maps the result. No business logic here. */
export const todoRoutes: FastifyPluginAsyncZod<TodoRoutesOptions> = (app, { todoService }) => {
  app.post(
    '/todos',
    { schema: { body: CreateTodoBody, response: { 201: TodoResponse } } },
    async (request, reply) => {
      const todo = await todoService.create(request.body);
      return reply.code(201).send(toTodoResponse(todo));
    },
  );

  app.get(
    '/todos',
    { schema: { querystring: ListTodosQuery, response: { 200: z.array(TodoResponse) } } },
    async (request) => {
      const { completed, limit } = request.query;
      const todos = await todoService.list(
        completed === undefined ? { limit } : { completed, limit },
      );
      return todos.map(toTodoResponse);
    },
  );

  app.get(
    '/todos/:id',
    { schema: { params: TodoParams, response: { 200: TodoResponse } } },
    async (request) => toTodoResponse(await todoService.get(request.params.id)),
  );

  app.post(
    '/todos/:id/complete',
    { schema: { params: TodoParams, response: { 200: TodoResponse } } },
    async (request) => toTodoResponse(await todoService.complete(request.params.id)),
  );

  return Promise.resolve();
};
