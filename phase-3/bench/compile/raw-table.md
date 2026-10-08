| Group | Command | median ms | max RSS MB |
|---|---|---:|---:|
| typecheck | tsc 6.0.3 (JS) --noEmit | 2728 | 499 |
| typecheck | tsc 7.0.2 (native) --noEmit | 304 | 235 |
| typecheck | tsc 7.0.2 --noEmit --singleThreaded | 813 | 224 |
| build | tsc 6.0.3 emit (typecheck + emit) | 3131 | 518 |
| build | tsc 7.0.2 emit (typecheck + emit) | 334 | 265 |
| build | esbuild transpile, unbundled (no typecheck) | 80 | 115 |
| build | esbuild bundle (no typecheck) | 38 | 80 |
| build | tsdown 0.23 bundle (rolldown, no typecheck) | 220 | 257 |
| build | tsup 8.5 bundle (esbuild, no typecheck) | 209 | 90 |
| start | node dist (tsc output, 402 files) | 260 | 76 |
| start | node bundle (esbuild single file) | 128 | 61 |
| start | node src/main.ts (native type stripping) | 425 | 107 |
| start | tsx src/main.ts | 424 | 98 |
| start | node --import tsx src/main.ts | 384 | 97 |
| start | node -e "" (baseline: empty process) | 21 | 44 |

Output sizes: tsc7 dist 1180 KB, esbuild bundle 1019 KB, tsdown 1038 KB, tsup 1019 KB
