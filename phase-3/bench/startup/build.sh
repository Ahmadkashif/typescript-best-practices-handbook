#!/usr/bin/env bash
# Produces every startup variant from src/app.ts.
set -e; cd "$(dirname "$0")"; rm -rf dist out
npx tsc -p .                                                                              # dist/app.js  ESM, unbundled
E=node_modules/.bin/esbuild
$E src/app.ts --outfile=out/cjs/app.cjs --platform=node --format=cjs --log-level=warning    # CJS, unbundled (require from node_modules)
$E src/app.ts --bundle --outfile=out/bundle.mjs --platform=node --format=esm --log-level=warning \
  --banner:js="import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"
$E src/app.ts --bundle --minify --outfile=out/bundle.min.mjs --platform=node --format=esm --log-level=warning \
  --banner:js="import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"
$E src/app.ts --bundle --outfile=out/bundle.cjs --platform=node --format=cjs --log-level=warning
ls -la out dist | grep -E 'app|bundle'
