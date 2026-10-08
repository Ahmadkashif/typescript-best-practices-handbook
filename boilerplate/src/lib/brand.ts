import { randomUUID } from 'node:crypto';
import { z } from 'zod';

/**
 * A nominal ("branded") type: structurally a `T`, but not assignable from a
 * plain `T` or from a different brand. Use it for IDs and validated values.
 *
 * It is the same type Zod's `.brand<Name>()` produces, so a value parsed by a
 * branded Zod schema and a value typed `Brand<string, Name>` are interchangeable.
 */
export type Brand<T, Name extends string> = T & z.$brand<Name>;

/**
 * Builds the schema, parser and generator for a UUID-based ID brand.
 *
 * @example
 *   export const UserId = uuidId('UserId');
 *   export type UserId = z.infer<typeof UserId.schema>; // string & z.$brand<'UserId'>
 */
export function uuidId<const Name extends string>(name: Name) {
  // Inside this generic function Zod cannot resolve the brand yet, so we state the
  // output type once here; callers see the fully resolved `Brand<string, Name>`.
  const schema = z.uuid().brand<Name>() as unknown as z.ZodType<Brand<string, Name>, string>;
  return {
    name,
    schema,
    /** Validates untrusted input. Throws a ZodError when it is not a UUID. */
    parse: (value: unknown): Brand<string, Name> => schema.parse(value),
    /** Creates a new random (v4) ID. */
    create: (): Brand<string, Name> => schema.parse(randomUUID()),
  };
}
