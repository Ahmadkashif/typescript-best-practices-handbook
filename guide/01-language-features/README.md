# 01 Language features

| File | Contents |
|---|---|
| [catalog.md](catalog.md) | 220-row catalog: every TS feature (1.x to 7.0) and the Node features relevant to TS, each marked USE / RESTRICT / BAN |
| [rules.md](rules.md) | LANG-001..LANG-013: rules with examples for the contentious features (enum, namespace, parameter properties, decorators, any, assertions, #private, using, default exports, ts-comments, type vs interface, return types, top-level await) |

The governing idea comes from PRIN-002: write only erasable TypeScript, which Node 24.12+ runs natively and `erasableSyntaxOnly` enforces.
