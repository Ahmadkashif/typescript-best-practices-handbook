# ADR-0011 Container base image

- **Status:** Accepted as built, with an open question (OQ-1).
- **Decision (as built):** A 4-stage Dockerfile, every stage on `node:24.21.0-alpine3.23`. The runtime has `USER node`, an exec-form CMD, a `HEALTHCHECK`, and production dependencies installed with `--ignore-scripts`. Verified with `docker build` and `docker run` plus `/health` 200 (271 MB unpacked).
- **Evidence for:** Alpine is the majority runtime base in the deep read (12 of 20 Dockerfiles), and keeping every stage on one image avoids glibc/musl mixing.
- **Evidence against (bench section 5):**
  - Compressed sizes: distroless `nodejs24-debian13:nonroot` 55.6 MB, alpine 61.9 MB, slim 81.1 MB.
  - Distroless is smaller, non-root by default and has no shell.
  - Alpine's musl is an experimental-tier Node platform (A-133).
- **OQ-1:** Should the runtime stage switch to distroless, with build stages on `node:24-slim`? The bench agent recommends it; the boilerplate agent chose Alpine for consensus and simplicity. The guide does not diverge from the boilerplate (BUILD-004 is PREFER). Proposed resolution: adopt distroless in the next boilerplate iteration, once someone verifies that the `HEALTHCHECK` (which uses `node -e`, so it works without a shell) and close-with-grace behave the same.
