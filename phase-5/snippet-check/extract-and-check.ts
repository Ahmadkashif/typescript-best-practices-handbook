// Extracts every ```ts block from guide/**/*.md, typechecks them with tsc (TS 7), and verifies expectations.
//   ```ts        -> MUST typecheck cleanly
//   ```ts fails  -> MUST produce >=1 compiler error (shows the compiler enforces the rule)
//   ```ts lint   -> a "bad" example that compiles; MUST typecheck cleanly (enforced by lint/review instead)
// Run: node extract-and-check.ts   (Node >=24.12 strips types natively)
import { readdirSync, readFileSync, writeFileSync, rmSync, mkdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const here = import.meta.dirname;
const guide = join(here, '..', '..', 'guide');
const outDir = join(here, 'snippets');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

type Expect = 'pass' | 'fail';
type Snippet = { file: string; source: string; line: number; expect: Expect };

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

const snippets: Snippet[] = [];
for (const md of walk(guide).sort()) {
  const lines = readFileSync(md, 'utf8').split('\n');
  let open: { info: string; start: number; body: string[] } | undefined;
  lines.forEach((line, idx) => {
    const fence = /^```(.*)$/.exec(line);
    if (fence && open === undefined) {
      const info = (fence[1] ?? '').trim();
      if (/^(ts|typescript)\b/.test(info)) open = { info, start: idx + 1, body: [] };
      return;
    }
    if (open !== undefined && line.startsWith('```')) {
      const rel = relative(guide, md).replace(/[\\/]/g, '__').replace(/\.md$/, '');
      const file = join(outDir, `${rel}__L${open.start}.ts`);
      const expect: Expect = /\bfails\b/.test(open.info) ? 'fail' : 'pass';
      writeFileSync(file, `${open.body.join('\n')}\nexport {};\n`);
      snippets.push({ file, source: `${relative(guide, md)}:${open.start}`, line: open.start, expect });
      open = undefined;
      return;
    }
    open?.body.push(line);
  });
}

const tsc = spawnSync(join(here, 'node_modules', '.bin', 'tsc'), ['-p', join(here, 'tsconfig.json'), '--pretty', 'false'], { encoding: 'utf8' });
const errorsByFile = new Map<string, string[]>();
for (const l of tsc.stdout.split('\n')) {
  const m = /^(.+?\.ts)\(\d+,\d+\): error (TS\d+.*)$/.exec(l);
  if (m?.[1] !== undefined && m[2] !== undefined) {
    const abs = join(here, m[1]);
    errorsByFile.set(abs, [...(errorsByFile.get(abs) ?? []), m[2]]);
  }
}

const problems: string[] = [];
for (const s of snippets) {
  const errs = errorsByFile.get(s.file) ?? [];
  if (s.expect === 'pass' && errs.length > 0) problems.push(`UNEXPECTED ERROR ${s.source}: ${errs.join(' | ')}`);
  if (s.expect === 'fail' && errs.length === 0) problems.push(`EXPECTED ERROR BUT COMPILED ${s.source}`);
}
const pass = snippets.filter((s) => s.expect === 'pass').length;
const summary = [
  `tsc ${spawnSync(join(here, 'node_modules', '.bin', 'tsc'), ['-v'], { encoding: 'utf8' }).stdout.trim()}`,
  `snippets: ${snippets.length} (must-compile: ${pass}, must-fail: ${snippets.length - pass})`,
  `problems: ${problems.length}`,
  ...problems,
].join('\n');
writeFileSync(join(here, 'result.log'), `${new Date().toISOString()}\n${summary}\n`);
console.log(summary);
process.exitCode = problems.length === 0 ? 0 : 1;
