# Phase 2C: Books (design patterns, architecture, TypeScript)

Method: publisher pages, official TOCs, author sites/talks and published reviews only. No book text was obtained from unofficial copies. Editions were checked on 2026-10-06 where marked (verified).

---

## B-01 Effective TypeScript, 2nd ed.
- **Author:** Dan Vanderkam · **Year:** 2024 · **Publisher:** O'Reilly · https://effectivetypescript.com/ (verified: 2e, 2024, 83 items, 10 chapters)
- **TOC:** Getting to Know TS · Type System · Type Inference · Type Design · Unsoundness and `any` · Generics and Type-Level Programming · Recipes · Type Declarations and @types · Writing and Running Your Code · Modernization and Migration.
- **Applies to TS/Node:** directly. It is the closest thing to a canonical rulebook for the language.
- **Takeaways:**
  - Prefer types that always represent valid states. Use unions of interfaces rather than interfaces of unions.
  - Push null values to the perimeter of your types. Avoid optional properties that are coupled to each other.
  - Prefer `unknown` to `any`, and keep any `any` narrowly scoped and hidden behind well-typed functions.
  - Prefer ECMAScript features to TypeScript-only features (enums, parameter properties, namespaces, decorators). This lines up exactly with `erasableSyntaxOnly`.
  - Generics are functions over types. Avoid unnecessary type parameters (the "golden rule of generics"). Use brands for nominal typing.
  - Use `satisfies`. Make illegal states unrepresentable. Exhaustiveness checks with `never`.
- **Pays off:** discriminated unions, brands, `unknown` at boundaries, `as const` unions. **Ceremony:** deep type-level programming in app code.

## B-02 Programming TypeScript
- **Author:** Boris Cherny · **Year:** 2019 · **Publisher:** O'Reilly · https://www.oreilly.com/library/view/programming-typescript/9781492037644/
- **Applies:** the type-system fundamentals. Error-handling chapter (return null, throw, return exceptions, Option type). Async chapter.
- **Takeaways:**
  - Four error-handling strategies are compared: return `null`, throw, return the error as a union, Option/Result. Return unions for expected failures and throw for bugs.
  - Use companion-object pattern (a type and a value with the same name) for value objects.
  - Nominal types via brands. "Type-driven development": sketch signatures first.
  - Typesafe event emitters and async via `Promise` typing.
- **Caveat:** predates 4.x/5.x features (satisfies, const generics). The chapters on namespaces and enums are dated.
- **Pays off:** Result-as-union for domain errors. **Ceremony:** a full Option monad when `T | undefined` will do.

## B-03 Node.js Design Patterns, 4th ed.
- **Authors:** Luciano Mammino, Mario Casciaro · **Year:** Sept 2025 · **Publisher:** Packt · https://www.packtpub.com/en-us/product/nodejs-design-patterns-fourth-edition-9781803238944 (verified: 4e, 732 pp, adds TypeScript guidance, ESM and a new testing chapter). Companion site: https://www.nodejsdesignpatterns.com/
- **Applies:** the most directly applicable architecture book for Node.
- **Takeaways:**
  - Module system: ESM-first. The module itself is the singleton (module caching), so a Singleton class is unnecessary.
  - Callbacks, then Promises, then async/await. Limited parallel execution (concurrency limits) and queues to avoid unbounded fan-out.
  - Streams and backpressure (`pipeline` from `stream/promises`). Never buffer unbounded data.
  - Creational patterns in JS form: factory *functions*, revealing constructor, builder only for complex objects. DI via constructor or factory injection. Service locators and DI containers come with a cost.
  - Structural/behavioural: proxy, decorator (wrapping objects, not TS decorators), adapter, strategy, state, template, iterator/async iterator, middleware, command.
  - Scalability: cluster/containers, load balancing, decomposition into services, messaging patterns (pub/sub, task queues, request/reply).
- **Pays off:** factory functions plus closure DI, strategy as plain function maps, middleware pipelines, async iterators, bounded concurrency. **Ceremony:** class-based Singleton, abstract factories.

## B-04 Design Patterns: Elements of Reusable Object-Oriented Software (GoF)
- **Authors:** Gamma, Helm, Johnson, Vlissides · **Year:** 1994 · **Publisher:** Addison-Wesley · https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610
- **Applies:** as vocabulary. Many patterns collapse into language features once you have first-class functions and structural types (see Norvig, "Design Patterns in Dynamic Languages", 1996: 16 of 23 patterns become invisible or simpler).
- **Takeaways:**
  - "Program to an interface, not an implementation." "Favor object composition over class inheritance." Both are still core.
  - Strategy, Command, Observer, Template Method and Visitor turn into functions, closures, event emitters and discriminated-union `switch` statements in TS.
  - Adapter, Facade, Decorator (wrapping) and Proxy remain useful at integration boundaries.
  - Singleton has become an anti-pattern for testability. Use a module-scoped instance created in the composition root.
- **Pays off:** Adapter (ports and adapters), Facade, Strategy as a function, Observer as EventEmitter, Builder for test data. **Ceremony:** Singleton class, Abstract Factory, Visitor class hierarchies (use a union plus `switch`), Prototype, Flyweight.

## B-05 Refactoring, 2nd ed.
- **Author:** Martin Fowler · **Year:** 2018 · **Publisher:** Addison-Wesley · https://martinfowler.com/books/refactoring.html (examples are in JavaScript)
- **Takeaways:**
  - Small behaviour-preserving steps protected by tests.
  - The code-smell catalogue applies directly: long function, data clumps, primitive obsession (which brands fix), feature envy, shotgun surgery, speculative generality.
  - "Replace conditional with polymorphism" is mostly a "replace with discriminated union plus exhaustive switch" in TS.
  - Combine functions into a transform or into a class: both are presented as equal choices. Functions are the default in JS.
- **Pays off:** extract function, introduce parameter object, replace primitive with object (brand), split phase (parse, then process).

## B-06 Domain-Driven Design: Tackling Complexity in the Heart of Software
- **Author:** Eric Evans · **Year:** 2003 · **Publisher:** Addison-Wesley · https://www.domainlanguage.com/ddd/
- **Takeaways:**
  - Ubiquitous language, bounded contexts and context maps. The strategic patterns matter more than the tactical ones.
  - Entities, value objects, aggregates (consistency boundary), repositories, domain services, domain events.
  - An anti-corruption layer for third-party and legacy integrations.
- **Pays off in TS:** value objects as readonly types plus smart constructors (brands), bounded contexts as feature modules, ACL adapters. **Ceremony:** a full tactical DDD in CRUD services, repositories that only proxy the ORM, aggregate classes with getters and setters.

## B-07 Implementing Domain-Driven Design
- **Author:** Vaughn Vernon · **Year:** 2013 · **Publisher:** Addison-Wesley · https://www.informit.com/store/implementing-domain-driven-design-9780321834577
- **Takeaways:** aggregate design rules: keep aggregates small, reference other aggregates by ID, one aggregate per transaction, eventual consistency between aggregates. Domain events. Hexagonal architecture as the host.
- **Pays off:** "reference by branded ID", small aggregates, the outbox for events. **Ceremony:** the event-sourcing default.

## B-08 Learning Domain-Driven Design
- **Author:** Vlad Khononov · **Year:** 2021 · **Publisher:** O'Reilly · https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/
- **Takeaways:**
  - Classify subdomains into core, supporting and generic, and choose the implementation pattern per subdomain: transaction script, active record, domain model, event-sourced domain model.
  - Layered vs ports and adapters vs CQRS chosen per module, not globally. This is the anti-ceremony heuristic.
  - Heuristics for bounded-context sizing and integration patterns.
- **Pays off:** "simple CRUD module = transaction script; core module = domain model". The house adopts this explicitly.

## B-09 Clean Architecture
- **Author:** Robert C. Martin · **Year:** 2017 · **Publisher:** Pearson · https://www.informit.com/store/clean-architecture-a-craftsmans-guide-to-software-structure-9780134494166
- **Takeaways:**
  - The dependency rule: source dependencies point inward, toward policy. Frameworks, DB and web are details.
  - Screaming architecture: the folder structure should show the domain (feature folders), not the framework.
  - SOLID, with DIP as the useful core. Component cohesion and coupling principles.
- **Critiques (reviews and talks):** the four-ring use-case/interactor ceremony is heavy for small services. Many TS "clean architecture" boilerplates duplicate DTO/entity/mapper layers for no gain.
- **Pays off:** the dependency rule plus feature folders, a domain without framework imports. **Ceremony:** one class per use case plus interfaces for every class, and presenter/view-model layers in JSON APIs.

## B-10 Patterns of Enterprise Application Architecture
- **Author:** Martin Fowler · **Year:** 2002 · **Publisher:** Addison-Wesley · https://martinfowler.com/books/eaa.html
- **Takeaways:** Transaction Script vs Domain Model vs Table Module. Data Mapper vs Active Record. Unit of Work, Identity Map, Repository, Service Layer, DTO, Gateway, Optimistic Offline Lock.
- **Pays off in TS:** Service Layer (application services), Gateway (typed outbound clients), Data Mapper via a query builder, optimistic locking with a version column. **Ceremony:** a hand-rolled Unit of Work and Identity Map (the ORM or transaction already provides them).

## B-11 Domain Modeling Made Functional
- **Author:** Scott Wlaschin · **Year:** 2018 · **Publisher:** Pragmatic Bookshelf · https://pragprog.com/titles/swdddf/domain-modeling-made-functional/
- **Takeaways:**
  - Model the domain with algebraic types: sum types (unions) and product types (records). Make illegal states unrepresentable.
  - Workflows as pipelines of functions. Railway-oriented programming (Result) for expected errors.
  - Constrained simple types via smart constructors (brands in TS). Parse at the boundary, then trust inside ("parse, don't validate").
  - Persistence and I/O at the edges ("functional core, imperative shell").
- **Pays off in TS:** almost all of it maps 1:1 onto discriminated unions, brands and Result unions. **Ceremony:** full monadic composition libraries in a team unfamiliar with them. Keep Result small (a union plus 2-3 helpers).

## B-12 Designing Data-Intensive Applications, 2nd ed.
- **Authors:** Martin Kleppmann (2e with Chris Riccomini) · **Year:** 1e 2017, 2e 2025/26 · **Publisher:** O'Reilly · https://dataintensive.net/
- **Takeaways:** idempotency and exactly-once illusions, retries with backoff, timeouts everywhere, transactions and isolation levels, schema evolution, outbox and CDC for events, backpressure.
- **Pays off:** idempotency keys on POST, outbox pattern, explicit isolation levels, versioned schemas.

## B-13 A Philosophy of Software Design, 2nd ed.
- **Author:** John Ousterhout · **Year:** 2021 · **Publisher:** Yaknyam Press · https://web.stanford.edu/~ouster/cgi-bin/book.php
- **Takeaways:** deep modules (simple interface, rich implementation) beat shallow ones. Information hiding. Define errors out of existence. Pull complexity downward. Comments describe what is not obvious. Avoid "classitis".
- **Pays off:** few, deep feature modules with a small `index.ts` API. Wrapper/pass-through layers are a red flag. This is the direct counter-argument to layered boilerplate ceremony.

## B-14 Release It!, 2nd ed.
- **Author:** Michael T. Nygard · **Year:** 2018 · **Publisher:** Pragmatic Bookshelf · https://pragprog.com/titles/mnee2/release-it-second-edition/
- **Takeaways:** stability patterns: timeouts, circuit breaker, bulkheads, steady state, fail fast, let it crash, handshaking, test harness, decoupling middleware. Anti-patterns: integration points, cascading failures, unbounded result sets, slow responses, blocked threads (event-loop blocking in Node).
- **Pays off:** `AbortSignal.timeout` on every call, bounded queries (pagination limits), health/readiness checks, graceful shutdown, fail fast on invalid config.

## B-15 Grokking Simplicity
- **Author:** Eric Normand · **Year:** 2021 · **Publisher:** Manning · https://www.manning.com/books/grokking-simplicity
- **Takeaways:** separate actions, calculations and data. Push actions to the edges. Stratified design. Immutability via copy-on-write. Timeline diagrams for concurrency.
- **Pays off:** pure domain functions that are easy to unit-test, and I/O in a thin shell. This matches the "functional core, imperative shell" rule.

## B-16 Total TypeScript: Essentials
- **Author:** Matt Pocock · **Year:** 2024 · **Publisher:** No Starch Press (free online edition at totaltypescript.com/books/total-typescript-essentials) · https://www.totaltypescript.com/books/total-typescript-essentials
- **Takeaways:** prefer `type`/`interface` consistency. Prefer unions to enums. `satisfies`. `as const`. The TSConfig cheat sheet (`verbatimModuleSyntax`, `noUncheckedIndexedAccess`, `module: NodeNext`). Annotate function returns at module boundaries. Avoid `any`, and use `unknown`.
- **Pays off:** the tsconfig baseline and the enum ban. It matches B-01.

## B-17 Functional-Light JavaScript
- **Author:** Kyle Simpson · **Year:** 2017 · **Publisher:** self/Leanpub, free on GitHub · https://github.com/getify/Functional-Light-JS
- **Takeaways:** pragmatic FP: pure functions, immutability, composition, and no category-theory jargon. Point-free style is optional.
- **Pays off:** small composable functions. **Ceremony:** point-free pipelines that hurt readability.

## B-18 Building Microservices, 2nd ed.
- **Author:** Sam Newman · **Year:** 2021 · **Publisher:** O'Reilly · https://samnewman.io/books/building_microservices_2nd_edition/
- **Takeaways:** start with a modular monolith. Information hiding per service. Independent deployability. Contract testing. Avoid distributed monoliths.
- **Pays off:** the modular monolith with enforced module boundaries as the default. Extract a service only for a measured need.

---

## Cross-book synthesis: patterns that pay off vs. ceremony in TypeScript

| Pattern | Verdict in TS/Node | Idiomatic form | Books |
|---|---|---|---|
| Singleton | Ceremony | A module-scoped instance created in the composition root | B-03, B-04 |
| Factory | Pays off as a function | `createUserService(deps)` returning an object literal | B-03, B-04 |
| Abstract Factory | Ceremony | A record of factories / DI object | B-04 |
| Builder | Pays off only for test data or complex query construction | `buildUser({ ...overrides })` | B-03, B-04 |
| Strategy | Pays off | A function parameter or a `Record<Kind, Handler>` | B-03, B-04 |
| State / Visitor | Pays off as a union | Discriminated union plus exhaustive `switch` and `assertNever` | B-01, B-05, B-11 |
| Observer | Pays off | Typed EventEmitter, or a domain-event array returned from functions | B-03, B-04 |
| Adapter / Gateway / ACL | Pays off strongly | A port type plus an adapter implementation per vendor | B-04, B-06, B-10 |
| Facade | Pays off | The feature module's `index.ts` | B-04, B-13 |
| Decorator (wrapping) | Pays off | Higher-order function: `withRetry(fn)`, `withTimeout(fn)` | B-03, B-04 |
| TS/legacy `@Decorators` | Ceremony / banned | Explicit wrapping and registration | B-01 |
| Repository | Pays off only for aggregates with invariants | A typed function module over a query builder. Not a generic `Repository<T>` | B-06, B-08, B-10 |
| Unit of Work | Ceremony | DB transaction callback `db.transaction(async tx => ...)` | B-10 |
| Dependency Injection | Pays off | Pure DI via constructor/factory params in one composition root. No container | B-03, B-09 |
| DI container with reflection | Ceremony | (none) | B-03 |
| Value Object | Pays off | Branded type plus smart constructor (parse function) | B-06, B-11 |
| Result / Either | Pays off for expected domain errors | `{ ok: true, value } \| { ok: false, error }` | B-02, B-11 |
| Railway / monad libs | Ceremony for most teams | Small Result helpers | B-11 |
| Layered + use-case classes per action | Ceremony for CRUD | A transaction script for supporting subdomains | B-08, B-09, B-13 |
| Ports and Adapters | Pays off at I/O boundaries | Domain imports no infra. Adapters are wired in the composition root | B-07, B-09 |
| Circuit breaker / timeout / bulkhead | Pays off | `AbortSignal.timeout`, bounded concurrency, breaker on flaky deps | B-12, B-14 |
| Outbox | Pays off when publishing events | Write the outbox row inside the same transaction | B-07, B-12 |
| CQRS / event sourcing | Ceremony unless it is a core-domain need | Plain read queries | B-07, B-08 |
| Modular monolith | Pays off (default) | Feature modules with enforced import boundaries | B-08, B-13, B-18 |
