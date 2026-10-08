| Variant | compile cache | wall median ms (p25-p75) | in-process ready ms | max RSS MB |
|---|---|---:|---:|---:|
| ESM unbundled (tsc output) | off | 169 (167-170) | 152 | 82 |
| ESM unbundled (tsc output) | on | 142 (139-145) | 126 | 84 |
| CJS unbundled | off | 167 (165-169) | 150 | 82 |
| CJS unbundled | on | 134 (133-135) | 117 | 83 |
| ESM bundle (esbuild) | off | 107 (106-109) | 100 | 75 |
| ESM bundle (esbuild) | on | 88 (87-89) | 80 | 70 |
| ESM bundle minified | off | 110 (109-113) | 103 | 74 |
| ESM bundle minified | on | 90 (89-92) | 83 | 67 |
| CJS bundle (esbuild) | off | 105 (105-107) | 98 | 74 |
| CJS bundle (esbuild) | on | 87 (86-88) | 80 | 69 |
| TS source, native type stripping | off | 194 (192-197) | 183 | 98 |
| TS source, native type stripping | on | 141 (139-144) | 124 | 84 |
| TS source, node --import tsx | off | 284 (278-286) | 274 | 95 |
| TS source, node --import tsx | on | 252 (250-257) | 242 | 97 |
| TS source, tsx CLI | off | 324 (321-327) | 270 | 95 |
| TS source, tsx CLI | on | 289 (283-297) | 235 | 98 |
