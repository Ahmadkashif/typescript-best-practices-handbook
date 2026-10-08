type Routes = Record<string, { method: 'GET' | 'POST' }>;
export const routes = {
  health: { method: 'GET' },
  createUser: { method: 'POST' },
} satisfies Routes; // keeps literal keys; checks the shape
export {};
