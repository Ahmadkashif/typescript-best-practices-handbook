# ADR-0007 Data access

- **Status:** Accepted
- **Decision:** Each feature defines a repository port, and the boilerplate ships an in-memory adapter, so it boots with zero infrastructure. The first real database adapter uses **Drizzle ORM** (Kysely for SQL-first teams). Migrations are generated SQL files, applied in a deploy step.
- **Prisma:** AVOID for now. `prisma@latest` is an 8.0 release candidate (V-06), and it adds a codegen step.
- **TypeORM:** AVOID (decorators).
- **Evidence:**
  - Survey among active repos: Prisma 30%, TypeORM 23%, Drizzle 13% and rising. All Drizzle repos date from 2025-26.
  - Articles: A-107 to A-112.
  - ORM overhead was not benchmarked (open question).
- **Rubric:** Drizzle R4 M4 S5 D5 C3 · Kysely R4 M4 S5 D5 C2 · Prisma R5 M4 S4 D3 C4
