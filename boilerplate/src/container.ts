import type { Config } from '#src/config/env.ts';
import { createLifecycle, type Lifecycle, type ReadinessCheck } from '#src/http/health.ts';
import { systemClock, type Clock } from '#src/lib/time.ts';
import { createInMemoryTodoRepository } from '#src/modules/todos/todo.repository.ts';
import { createTodoService, type TodoService } from '#src/modules/todos/todo.service.ts';

/**
 * Composition root: the only place that knows which implementation backs each
 * port. Everything else receives its dependencies as arguments.
 */
export interface Container {
  readonly config: Config;
  readonly clock: Clock;
  readonly lifecycle: Lifecycle;
  readonly readinessChecks: readonly ReadinessCheck[];
  readonly todoService: TodoService;
  /** Releases resources (pools, clients) on shutdown. Called from Fastify's onClose. */
  readonly dispose: () => Promise<void>;
}

export interface ContainerOverrides {
  readonly clock?: Clock;
  readonly readinessChecks?: readonly ReadinessCheck[];
}

export function createContainer(config: Config, overrides: ContainerOverrides = {}): Container {
  const clock = overrides.clock ?? systemClock;
  const todos = createInMemoryTodoRepository();

  return {
    config,
    clock,
    lifecycle: createLifecycle(),
    // Add one check per hard dependency, e.g. { name: 'postgres', check: (signal) => pool.query('select 1', { signal }) }.
    readinessChecks: overrides.readinessChecks ?? [],
    todoService: createTodoService({ todos, clock }),
    dispose: () => Promise.resolve(),
  };
}
