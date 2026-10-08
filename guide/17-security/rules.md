# Security rules (SEC)

### SEC-001 Treat `npm install` as remote code execution
**Level:** MUST
**Rubric:** R3 M5 S5 D4 C5
**Rule:**
- CI and Docker use `npm ci`.
- `.npmrc` sets `ignore-scripts=true`. Packages that need build scripts are allow-listed and rebuilt explicitly (`npm rebuild <pkg>`).
- Use a release-age cooldown for new versions (`min-release-age` in npm 11.10+, or Renovate `minimumReleaseAge`).
**Sources:** A-082, A-131, A-132, A-146

### SEC-002 Secrets come from the environment or a secret manager; never the repo or the image
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** `.env*` is gitignored except `.env.example`. Docker build args never carry secrets; use `--mount=type=secret`. Config redaction covers secrets in logs (OBS-001).
**Sources:** A-120, A-128, A-080

### SEC-003 HTTP hardening defaults
**Level:** MUST
**Rubric:** R4 M4 S5 D4 C5
**Rule:** Every service has:
- security headers (`@fastify/helmet`);
- a body size limit (HTTP-006);
- rate limiting with a shared store when there is more than one instance;
- CORS as an explicit allow-list, never `*` with credentials;
- `trustProxy` set to the real proxy hop count;
- no `x-powered-by`.
**Sources:** A-080, A-129, A-145, A-146

### SEC-004 Parameterized queries only
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C5
**Rule:** Never build SQL by string concatenation. Use query-builder parameters or tagged templates (`sql\`...${v}\``) that bind values.
**Sources:** A-080, A-146

### SEC-005 Containers run as non-root with a minimal surface
**Level:** MUST
**Rubric:** R3 M4 S5 D5 C5
**Rule:**
- Run as a non-root user with production dependencies only.
- No shell or package manager in the runtime image where feasible (distroless).
- Read-only root filesystem, `no-new-privileges`, and all capabilities dropped in the orchestrator.
**Sources:** A-081, A-126, A-128, A-133

### SEC-006 CI supply-chain hygiene
**Level:** MUST
**Rubric:** R3 M5 S5 D4 C4
**Rule:**
- Pin third-party GitHub Actions to full commit SHAs.
- Set `permissions: contents: read` by default.
- Publish npm packages with trusted publishing (OIDC) and provenance.
**Sources:** A-141, A-127

### SEC-007 The Node permission model is defense in depth, not a sandbox
**Level:** PREFER (CLIs/scripts), AVOID relying on it for untrusted code
**Rubric:** R3 M3 S3 D3 C4
**Rule:** You may run CLIs with `--permission --allow-fs-read=...`. Never run untrusted code in-process expecting the permission model to contain it.
**Sources:** A-013, A-099

### SEC-008 Use timing-safe comparisons and vetted crypto
**Level:** MUST
**Rubric:** R3 M4 S4 D4 C5
**Rule:** Compare tokens and HMACs with `crypto.timingSafeEqual`. Hash passwords with `scrypt`/`argon2`, never a bare SHA. Generate ids and tokens with `crypto.randomUUID()`/`randomBytes`, never `Math.random`.
```ts
import { timingSafeEqual, createHmac } from 'node:crypto';
export function verifySignature(body: string, sig: string, secret: string): boolean {
  const expected = Buffer.from(createHmac('sha256', secret).update(body).digest('hex'));
  const given = Buffer.from(sig);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
```
**Sources:** A-080, A-146
