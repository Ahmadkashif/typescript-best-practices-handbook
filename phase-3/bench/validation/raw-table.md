| Library | valid ops/s | invalid ops/s (incl. building error list) |
|---|---:|---:|
| zod 4 safeParse | 306,537 | 84,346 |
| valibot safeParse | 433,501 | 300,420 |
| typebox Compile().Check | 4,223,132 | 33,354 |
| typebox Value.Check (no JIT) | 48,074 | 31,805 |
| ajv compiled (first error) | 1,320,915 | 4,243,927 |
| ajv compiled (allErrors) | 1,307,317 | 1,255,546 |
