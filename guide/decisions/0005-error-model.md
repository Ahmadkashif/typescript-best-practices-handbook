# ADR-0005 Error model

- **Status:** Accepted
- **Decision:** One `AppError` hierarchy, with a stable `code`, an HTTP `status` and `expose`, mapped once by the Fastify error handler to RFC 9457 `application/problem+json`. Unknown errors become 500 with no internals. Programmer errors and fatal errors trigger graceful shutdown with a non-zero exit (`close-with-grace`).
- **Expected domain failures:** an in-house `Result<T, E>` is PREFER (ERR-002), for use cases with several business outcomes. The boilerplate's CRUD module needs none, so it ships only `AppError` subclasses. No `neverthrow` or Effect without a new ADR.
- **Evidence:**
  - Every deep-read repo that defines an error model uses a coded base class plus a central handler (practica, Sairyss, KhaledSaeed18).
  - Results are favoured by A-036, A-055 and B-11; exceptions by A-039 and A-074.
  - Effect is a paradigm shift (A-037, A-069).
- **Rubric:** R4 M5 S5 D4 C4
