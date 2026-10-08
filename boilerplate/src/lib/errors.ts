/**
 * Central error model.
 *
 * - Expected failures (bad input, missing entity, conflicts) are thrown as an
 *   `AppError` subclass with a stable machine-readable `code` and an HTTP status.
 * - Anything else is a bug or an infrastructure failure: it is logged with its
 *   stack and answered with a generic 500, never with internal details.
 * - The HTTP layer converts errors to RFC 9457 `application/problem+json` in
 *   exactly one place: `src/http/error-handler.ts`.
 */

export const ERROR_CODES = [
  'BAD_REQUEST',
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'CONFLICT',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'SERVICE_UNAVAILABLE',
  'INTERNAL',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface AppErrorOptions {
  readonly cause?: unknown;
  /** Safe, client-visible details (e.g. field errors). Never put secrets or PII here. */
  readonly details?: Readonly<Record<string, unknown>>;
}

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly status: number;
  readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = new.target.name;
    this.details = options.details;
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_FAILED';
  readonly status = 400;
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly status = 404;
}

export class ConflictError extends AppError {
  readonly code = 'CONFLICT';
  readonly status = 409;
}

export class UnauthenticatedError extends AppError {
  readonly code = 'UNAUTHENTICATED';
  readonly status = 401;
}

export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';
  readonly status = 403;
}

export class ServiceUnavailableError extends AppError {
  readonly code = 'SERVICE_UNAVAILABLE';
  readonly status = 503;
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;

/** Normalises anything that was thrown (strings, objects, undefined) into an `Error`. */
export function toError(thrown: unknown): Error {
  if (thrown instanceof Error) return thrown;
  return new Error(typeof thrown === 'string' ? thrown : JSON.stringify(thrown), {
    cause: thrown,
  });
}
