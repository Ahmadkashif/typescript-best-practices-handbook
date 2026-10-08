export class Repo {
  readonly #url: string;
  constructor(url: string) { this.#url = url; }
  get host(): string { return new URL(this.#url).host; }
}
export {};
