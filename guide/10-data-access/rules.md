# Data access rules (DATA)

### DATA-001 SQL-transparent, typed query layer
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C4
**Rule:** Use a typed query builder that shows the SQL it runs and needs no native engine (see ADR-0007). Raw strings only via parameterized tagged templates (SEC-004).
**Sources:** A-109, A-110, A-111, A-112, ADR-0007

### DATA-002 Versioned, reviewed SQL migrations; never `push` in shared environments
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:**
- Generate migration files, review them, commit them, and apply them in a dedicated deploy step, never on app boot when there are several replicas.
- Use expand/contract for zero-downtime changes:
  1. Add the column, nullable.
  2. Backfill.
  3. Switch reads.
  4. Drop the old column in a later release.
**Sources:** A-111, A-114, B-12

### DATA-003 One repository port per aggregate; no generic `Repository<T>`
**Level:** PREFER
**Rubric:** R4 M5 S4 D4 C3
**Rule:** Each feature defines its own repository type (boilerplate: `src/modules/todos/todo.repository.ts`, with an in-memory adapter) whose methods return domain types. Rows are mapped in the adapter, and query-builder types do not leak upward. A generic `BaseRepository<T>` with `findAll/save/delete` is ceremony (B-10).
**Sources:** B-10, B-06, B-08

### DATA-004 Transactions are scoped callbacks
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C5
**Rule:** Multi-statement writes use `db.transaction(async (tx) => ...)`, passing `tx` down explicitly. Never run manual `BEGIN`/`COMMIT` across awaits without a callback scope. Keep transactions short, with no network calls inside.
**Sources:** B-10, B-12, A-113

### DATA-005 Small pools sized by formula
**Level:** MUST
**Rubric:** R3 M4 S5 D5 C5
**Rule:** Per-process `max` pool size times the replica count stays below the database's `max_connections` minus headroom. Start at 10 per process. Use a pooler (pgBouncer/RDS Proxy) when autoscaling. Set statement and idle timeouts.
**Sources:** A-105, A-106

### DATA-006 Transactional outbox for events that must follow a write
**Level:** MUST (when publishing events)
**Rubric:** R3 M5 S5 D4 C5
**Rule:** Write the event to an `outbox` table in the same transaction, and have a relay publish it. Consumers are idempotent.
**Sources:** A-113, B-12

### DATA-007 IDs: generated in the app, typed with brands
**Level:** PREFER
**Rubric:** R4 M4 S5 D4 C3
**Rule:** Use UUIDv7 (time-ordered), generated in the application, wrapped in the branded type (TYPES-002). Do not expose sequential integer IDs publicly.
**Sources:** B-12, A-080
