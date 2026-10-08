| Server | GET / req/s | p50 / p99 ms | % of node:http | POST /orders (validated) req/s | p50 / p99 ms | % of node:http | non-2xx+errors |
|---|---:|---:|---:|---:|---:|---:|---:|
| node-http | 40,470 | 2 / 4 | 100% | 22,062 | 4 / 8 | 100% | 0 |
| express | 25,026 | 3 / 5 | 62% | 15,546 | 6 / 11 | 70% | 0 |
| hono | 38,404 | 2 / 3 | 95% | 20,834 | 4 / 9 | 94% | 0 |
| fastify | 35,293 | 2 / 4 | 87% | 22,056 | 4 / 8 | 100% | 0 |
| fastify-zod | 34,287 | 2 / 3 | 85% | 20,349 | 4 / 8 | 92% | 0 |
| nest-fastify | 35,786 | 2 / 5 | 88% | 19,477 | 4 / 8 | 88% | 0 |
