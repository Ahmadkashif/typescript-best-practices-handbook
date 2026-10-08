import { z } from 'zod';
export const CreateUser = z.object({ email: z.email(), name: z.string().min(1).max(100) });
export type CreateUser = z.infer<typeof CreateUser>;

export function parseCreateUser(body: unknown): CreateUser {
  return CreateUser.parse(body);
}
export {};
