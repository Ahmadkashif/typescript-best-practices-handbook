# TypeScript + Node.js Best Practices Handbook

This is a strict, opinionated house standard for writing backend TypeScript on Node.js. Every rule comes from research and is checked against a scoring rubric covering readability, maintainability, scalability, deployability and performance.

It is based on 150 articles, 18 books, a 220-row TypeScript feature catalog, a survey of 270 open-source boilerplates (32 read in depth) and six benchmark suites, all current as of October 2026 (TypeScript 7, Node 24 LTS).

## Contents

| Path | What |
|---|---|
| [`guide/`](guide/README.md) | 143 rules (MUST / MUST NOT / PREFER / AVOID) in 19 sections, plus 11 decision records |
| [`guide/dos-and-donts.md`](guide/dos-and-donts.md) | A one-page cheat sheet |
| [`boilerplate/`](boilerplate/README.md) | A starter server built on Node 24, TS 7, Fastify 5, Zod 4, pino, Vitest and Docker. It installs, typechecks, lints, tests, builds and boots out of the box |
| [`findings.md`](findings.md) | Executive summary: the top 30 rules, the decisions, benchmark highlights and open questions |
| [`plan.md`](plan.md) | The research plan |
| [`sources.md`](sources.md) | Every article, book, repository and doc cited |
| `phase-1/` … `phase-5/` | Working files: scope, raw corpora, deep dives, benchmarks, synthesis and verification logs |

## Quick start (boilerplate)

```sh
cd boilerplate
npm ci
npm run typecheck && npm run lint && npm test
npm run build && node dist/main.js
```

Requires Node ≥ 24.12.
