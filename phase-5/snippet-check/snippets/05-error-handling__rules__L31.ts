export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

type RegisterError = { type: 'EmailTaken' } | { type: 'WeakPassword'; reason: string };

export function register(email: string, password: string, taken: ReadonlySet<string>): Result<{ email: string }, RegisterError> {
  if (taken.has(email)) return err({ type: 'EmailTaken' });
  if (password.length < 12) return err({ type: 'WeakPassword', reason: 'min 12 chars' });
  return ok({ email });
}

const r = register('a@b.c', 'short', new Set());
if (!r.ok) {
  switch (r.error.type) {
    case 'EmailTaken': break;
    case 'WeakPassword': console.log(r.error.reason); break;
  }
}
export {};
