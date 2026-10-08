export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly expose: boolean;
  constructor(code: string, message: string, opts: { status: number; expose?: boolean; cause?: unknown }) {
    super(message, { cause: opts.cause });
    this.name = new.target.name;
    this.code = code;
    this.status = opts.status;
    this.expose = opts.expose ?? opts.status < 500;
  }
}
export class NotFoundError extends AppError {
  constructor(what: string) { super('NOT_FOUND', `${what} not found`, { status: 404 }); }
}
export {};
