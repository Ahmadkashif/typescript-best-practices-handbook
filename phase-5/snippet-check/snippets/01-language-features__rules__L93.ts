type Config = { port: number };
export const cfg = JSON.parse('{"port":"oops"}') as Config;
export {};
