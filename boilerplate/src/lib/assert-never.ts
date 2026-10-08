/**
 * Exhaustiveness guard for discriminated unions.
 * Put it in the `default` branch of a `switch` over a union: if a new member
 * is added and not handled, the call stops compiling.
 */
export function assertNever(value: never, message = 'Unexpected value'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}
