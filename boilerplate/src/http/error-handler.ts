import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod';
import { isAppError, type ErrorCode } from '#src/lib/errors.ts';

/** RFC 9457 problem details, extended with a stable `code` and the request id. */
export interface Problem {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly code: ErrorCode;
  readonly instance: string;
  readonly requestId: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

const TITLES: Readonly<Record<ErrorCode, string>> = {
  BAD_REQUEST: 'Bad request',
  VALIDATION_FAILED: 'Validation failed',
  NOT_FOUND: 'Not found',
  CONFLICT: 'Conflict',
  UNAUTHENTICATED: 'Unauthenticated',
  FORBIDDEN: 'Forbidden',
  SERVICE_UNAVAILABLE: 'Service unavailable',
  INTERNAL: 'Internal server error',
};

function sendProblem(
  request: FastifyRequest,
  reply: FastifyReply,
  problem: Omit<Problem, 'type' | 'title' | 'instance' | 'requestId'>,
): FastifyReply {
  const body: Problem = {
    type: 'about:blank',
    title: TITLES[problem.code],
    instance: request.url,
    requestId: request.id,
    ...problem,
  };
  return reply.code(body.status).type('application/problem+json').send(body);
}

/** Fastify's own client errors (bad JSON, body too large, unsupported media type, ...). */
function isFastifyClientError(error: FastifyError): boolean {
  return typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500;
}

/** The one place where errors become HTTP responses. */
export function registerErrorHandling(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return sendProblem(request, reply, {
        status: 400,
        code: 'VALIDATION_FAILED',
        detail: 'The request is invalid.',
        details: {
          issues: error.validation.map((issue) => ({
            location: error.validationContext ?? 'request',
            path: issue.instancePath,
            message: issue.message ?? 'invalid',
          })),
        },
      });
    }

    if (isAppError(error)) {
      if (error.status >= 500) request.log.error({ err: error }, error.message);
      return sendProblem(request, reply, {
        status: error.status,
        code: error.code,
        detail: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      });
    }

    if (!isResponseSerializationError(error) && isFastifyClientError(error)) {
      const status = error.statusCode ?? 400;
      return sendProblem(request, reply, {
        status,
        code: status === 404 ? 'NOT_FOUND' : 'BAD_REQUEST',
        detail: error.message,
      });
    }

    // Unknown error = bug or infrastructure failure. Log everything, reveal nothing.
    request.log.error({ err: error }, 'unhandled error');
    return sendProblem(request, reply, {
      status: 500,
      code: 'INTERNAL',
      detail: 'An unexpected error occurred.',
    });
  });

  app.setNotFoundHandler((request, reply) =>
    sendProblem(request, reply, {
      status: 404,
      code: 'NOT_FOUND',
      detail: `Route ${request.method} ${request.url} does not exist.`,
    }),
  );
}
