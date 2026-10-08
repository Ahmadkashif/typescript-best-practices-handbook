# Dependency rules (DEP)

### DEP-001 Every new runtime dependency is justified in the PR
**Level:** MUST
**Rubric:** R4 M5 S4 D4 C4
**Rule:** A PR that adds a runtime dependency states why the platform (Node 24 built-ins: `fetch`, `node:test`, `parseArgs`, `--env-file`, `crypto.randomUUID`, `structuredClone`, `AbortSignal.timeout`) is not enough. It also states the dependency's maintenance status, weekly downloads and install scripts.
**Sources:** A-082, A-146, B-13

### DEP-002 One lockfile, committed; exact CI installs
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** Use one package manager per repo, recorded in `packageManager`. The lockfile is committed. CI uses `npm ci`. Never mix npm, yarn and pnpm.
**Sources:** A-082, A-076, A-088

### DEP-003 Automated, grouped, delayed updates
**Level:** MUST
**Rubric:** R3 M5 S4 D4 C4
**Rule:** Renovate (or Dependabot) groups minor and patch updates weekly, holds new releases back for a cooldown (`minimumReleaseAge: "3 days"`), and auto-merges devDependency patches only when CI is green.
**Sources:** A-131, A-132

### DEP-004 ESM-only packages; no dual builds for internal libraries
**Level:** MUST
**Rubric:** R4 M5 S4 D4 C4
**Rule:** Internal packages are `"type": "module"` with an `exports` map. `require(esm)` is stable (Node 24.15+/25.4+), so dual CJS/ESM publishing is not needed. Check published types with `@arethetypeswrong/cli`.
**Sources:** A-048, A-049, A-143, A-073, A-018

### DEP-005 Pin the toolchain
**Level:** MUST
**Rubric:** R4 M5 S4 D4 C4
**Rule:** Set `engines.node` and an `.nvmrc`/`.node-version` file, and match the Docker base image tag. Pin the TypeScript version exactly, because compiler upgrades are deliberate changes.
**Sources:** A-088, V-05
