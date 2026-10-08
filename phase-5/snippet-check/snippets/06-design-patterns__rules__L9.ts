export class Db {
  static #instance: Db | undefined;
  static getInstance(): Db { return (Db.#instance ??= new Db()); }
}
export {};
