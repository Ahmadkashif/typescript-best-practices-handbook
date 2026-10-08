export type Db = { query(sql: string): Promise<unknown[]> };
export function createDb(url: string): Db {
  return { async query(sql) { void url; void sql; return []; } };
}
// composition root: const db = createDb(config.DATABASE_URL); const users = createUserService({ db });
export {};
