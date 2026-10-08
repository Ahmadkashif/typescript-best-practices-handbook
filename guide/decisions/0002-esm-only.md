# ADR-0002 Module system: ESM only

- **Status:** Accepted
- **Decision:** Use `"type": "module"` with `module`/`moduleResolution: nodenext`. No CJS output, no dual builds.
- **Evidence:**
  - Start-up is identical (bench section 6: ESM 169 ms vs CJS 167 ms unbundled; 107 vs 105 ms bundled).
  - TS 7 defaults to ESM (V-01).
  - `require(esm)` is stable, so CJS consumers still work (A-048, A-143).
  - ESM share is rising among active repos and TS>=6 adopters (phase-2/boilerplates.md).
- **Rubric:** R4 M5 S5 D5 C4
- **Consequences:**
  - Explicit extensions (STRUCT-003).
  - `import.meta.dirname` replaces `__dirname`.
  - Top-level await is restricted to entrypoints (LANG-013).
