import type { FastifyInstance } from 'fastify';
export function routeCount(app: FastifyInstance): string { return app.printRoutes(); }
export {};
