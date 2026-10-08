# Validation, config and I/O rules (VAL)

### VAL-001 Every untrusted input is parsed by a schema at the boundary
**Level:** MUST
**Rubric:** R5 M5 S5 D4 C5
**Rule:** HTTP body/query/params/headers, env, queue messages, webhook payloads, files and JSON columns are parsed with a schema before any other code sees them. Inside, use the inferred type.
**Sources:** A-019, A-121, A-080, A-034

### VAL-002 Zod 4 is the single validation library
**Level:** MUST
**Rubric:** R5 M5 S4 D4 C4
**Rule:** Use `zod` (v4) for every schema. Do not mix in class-validator, joi or yup. Tools that accept Standard Schema accept zod directly.
**Why:** Zod has the largest ecosystem and is typed end to end. Zod 4 closed most of the performance gap (A-079). Among TS>=6 adopters in the survey, zod is the most used validator. class-validator needs decorators (banned).
**Sources:** A-079, A-116, A-117, phase-2/boilerplates.md, ADR-0004

### VAL-003 Env is parsed once at boot into a frozen, typed config
**Level:** MUST
**Rubric:** R5 M5 S5 D5 C5
**Rule:** `src/config/env.ts` parses `process.env` with zod and exports a typed object. Nothing else reads `process.env`. An invalid config exits with code 1 and lists the bad keys (never their values).
```ts
import { z } from 'zod';
const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.url().optional(),
});
export type Config = Readonly<z.infer<typeof Env>>;
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = Env.safeParse(env);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid environment: ${keys}`);
  }
  return Object.freeze(parsed.data);
}
```
**Enforcement:** review (boilerplate: only `src/config/env.ts` and `main.ts` touch `process.env`). Recommended addition: `n/no-process-env` from `eslint-plugin-n` everywhere except `src/config/env.ts`.
**Sources:** A-058, A-119, A-120

### VAL-004 Use `--env-file` for local `.env`; no `dotenv` in production code
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C4
**Rule:** Local dev runs `node --env-file-if-exists=.env ...`. Deployed environments inject real env vars. `.env` is gitignored, and `.env.example` is committed.
**Sources:** A-012, A-120

### VAL-005 `NODE_ENV=production` in every deployed environment
**Level:** MUST
**Rubric:** R4 M4 S4 D5 C4
**Rule:** Staging and prod both run with `NODE_ENV=production`. Behaviour differences come from explicit config keys (feature flags, URLs), never from branching on the environment name.
**Sources:** A-119, A-120

### VAL-006 Validate outbound data you don't control
**Level:** PREFER
**Rubric:** R4 M5 S4 D3 C4
**Rule:** Parse responses from third-party APIs with a schema in the adapter (ARCH-003). Typing them with a cast is LANG-006.
**Sources:** A-121, B-06 (anti-corruption layer)
