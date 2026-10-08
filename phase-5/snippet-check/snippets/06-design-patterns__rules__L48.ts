type User = { id: string; email: string; active: boolean };
export const buildUser = (o: Partial<User> = {}): User => ({ id: 'u1', email: 'a@b.c', active: true, ...o });
export {};
