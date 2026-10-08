// Survey boilerplate repos via GitHub API metadata only (no cloning, no code execution).
// Usage: node survey.mjs cand.json out.json [limit]
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, writeFileSync } from 'node:fs';
const run = promisify(execFile);
const [, , inFile, outFile, limitArg] = process.argv;
const cands = JSON.parse(readFileSync(inFile, 'utf8'));
const limit = Number(limitArg ?? 260);

async function api(path) {
  try { const { stdout } = await run('gh', ['api', path], { maxBuffer: 20e6 }); return JSON.parse(stdout); }
  catch { return null; }
}
async function file(repo, p) {
  const r = await api(`repos/${repo}/contents/${p}`);
  if (!r || !r.content) return null;
  return Buffer.from(r.content, 'base64').toString('utf8');
}
const has = (deps, ...names) => names.find((n) => n in deps);
function detect(pkg, tsconfig, tree, repo) {
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  const paths = tree.map((t) => t.path);
  const any = (re) => paths.some((p) => re.test(p));
  const ts = (tsconfig ?? '').replace(/\/\/.*$/gm, '');
  const framework = has(deps, '@nestjs/core') ? 'nestjs' : has(deps, 'fastify') ? 'fastify' : has(deps, 'hono') ? 'hono'
    : has(deps, 'elysia') ? 'elysia' : has(deps, 'koa') ? 'koa' : has(deps, '@hapi/hapi') ? 'hapi' : has(deps, 'express') ? 'express' : 'other';
  const moduleSystem = pkg.type === 'module' ? 'esm' : 'cjs';
  const alias = pkg.imports ? 'pkg-imports' : /"paths"\s*:/.test(ts) ? 'tsconfig-paths'
    : has(deps, 'module-alias') ? 'module-alias' : 'none';
  const validation = has(deps, 'zod') ? 'zod' : has(deps, 'class-validator') ? 'class-validator' : has(deps, 'joi') ? 'joi'
    : has(deps, '@sinclair/typebox', 'typebox') ? 'typebox' : has(deps, 'valibot') ? 'valibot' : has(deps, 'yup') ? 'yup'
    : has(deps, 'arktype') ? 'arktype' : has(deps, 'express-validator') ? 'express-validator' : has(deps, 'ajv') ? 'ajv' : 'none';
  const orm = has(deps, 'drizzle-orm') ? 'drizzle' : has(deps, '@prisma/client', 'prisma') ? 'prisma' : has(deps, 'typeorm') ? 'typeorm'
    : has(deps, '@mikro-orm/core') ? 'mikro-orm' : has(deps, 'kysely') ? 'kysely' : has(deps, 'sequelize', 'sequelize-typescript') ? 'sequelize'
    : has(deps, 'mongoose') ? 'mongoose' : has(deps, 'knex') ? 'knex' : has(deps, 'pg', 'postgres', 'mysql2') ? 'raw-driver' : 'none';
  const logger = has(deps, 'pino', 'nestjs-pino', 'pino-http') ? 'pino' : has(deps, 'winston', 'nest-winston') ? 'winston'
    : has(deps, 'bunyan') ? 'bunyan' : has(deps, 'morgan') ? 'morgan-only' : framework === 'fastify' ? 'pino(builtin)' : 'none/console';
  const test = has(deps, 'vitest') ? 'vitest' : has(deps, 'jest', 'ts-jest', '@swc/jest') ? 'jest' : has(deps, 'mocha') ? 'mocha'
    : has(deps, 'ava') ? 'ava' : /node --test|node:test/.test(JSON.stringify(pkg.scripts ?? {})) ? 'node:test' : has(deps, 'tap', 'tsx') && /tap/.test(JSON.stringify(pkg.scripts ?? {})) ? 'tap' : 'none';
  const linter = has(deps, '@biomejs/biome') ? 'biome' : has(deps, 'oxlint') ? 'oxlint' : has(deps, 'eslint') ? 'eslint' : has(deps, 'tslint') ? 'tslint' : 'none';
  const formatter = has(deps, '@biomejs/biome') ? 'biome' : has(deps, 'prettier') ? 'prettier' : has(deps, '@dprint/formatter', 'dprint') ? 'dprint' : 'none';
  const s = JSON.stringify(pkg.scripts ?? {});
  const build = has(deps, 'tsdown') ? 'tsdown' : has(deps, 'tsup') ? 'tsup' : /esbuild/.test(s) || has(deps, 'esbuild') ? 'esbuild'
    : has(deps, '@swc/cli', '@swc/core') ? 'swc' : has(deps, 'webpack') ? 'webpack' : has(deps, 'rollup') ? 'rollup'
    : framework === 'nestjs' ? 'nest-cli(tsc)' : /\btsc\b/.test(s) ? 'tsc' : 'none';
  const devRunner = has(deps, 'tsx') ? 'tsx' : has(deps, 'ts-node-dev') ? 'ts-node-dev' : has(deps, 'ts-node') ? 'ts-node'
    : has(deps, 'nodemon') ? 'nodemon' : /node --watch/.test(s) ? 'node --watch' : framework === 'nestjs' ? 'nest start' : 'other';
  const docker = any(/(^|\/)Dockerfile/i) ? 'yes' : 'no';
  const compose = any(/(docker-)?compose\.ya?ml$/i) ? 'yes' : 'no';
  const ci = any(/^\.github\/workflows\//) ? 'gha' : any(/\.gitlab-ci\.yml$/) ? 'gitlab' : any(/\.circleci\//) ? 'circle' : 'none';
  const hooks = has(deps, 'husky') ? 'husky' : has(deps, 'lefthook', '@evilmartians/lefthook') ? 'lefthook' : has(deps, 'simple-git-hooks') ? 'simple-git-hooks' : 'none';
  const pm = any(/^pnpm-lock\.yaml$/) ? 'pnpm' : any(/^yarn\.lock$/) ? 'yarn' : any(/^bun\.lockb?$/) ? 'bun' : any(/^package-lock\.json$/) ? 'npm' : 'none';
  const strict = /"strict"\s*:\s*true/.test(ts) ? 'yes' : 'no';
  const tsModule = (ts.match(/"module"\s*:\s*"([^"]+)"/i) ?? [])[1] ?? '';
  const tsRes = (ts.match(/"moduleResolution"\s*:\s*"([^"]+)"/i) ?? [])[1] ?? '';
  const nuia = /"noUncheckedIndexedAccess"\s*:\s*true/.test(ts) ? 'yes' : 'no';
  const tsVer = deps.typescript ?? '';
  const di = has(deps, 'tsyringe') ? 'tsyringe' : has(deps, 'inversify') ? 'inversify' : has(deps, 'awilix') ? 'awilix' : has(deps, 'typedi') ? 'typedi' : framework === 'nestjs' ? 'nest' : 'manual/none';
  const otel = Object.keys(deps).some((d) => d.startsWith('@opentelemetry/')) ? 'yes' : 'no';
  const config = has(deps, '@t3-oss/env-core', 'envalid', 'env-var', 'convict', '@nestjs/config', 'dotenv') ?? 'none';
  return { repo, framework, moduleSystem, alias, validation, orm, logger, test, linter, formatter, build, devRunner, docker, compose, ci, hooks, pm, strict, tsModule, tsRes, nuia, tsVer, di, otel, config };
}
const out = [];
let i = 0;
async function worker() {
  while (i < Math.min(cands.length, limit)) {
    const c = cands[i++];
    const repo = c.fullName;
    const meta = await api(`repos/${repo}`);
    if (!meta) continue;
    const treeRes = await api(`repos/${repo}/git/trees/${meta.default_branch}?recursive=1`);
    const tree = (treeRes?.tree ?? []).filter((t) => !t.path.includes('node_modules'));
    const pkgPath = tree.find((t) => t.path === 'package.json') ? 'package.json'
      : tree.filter((t) => /(^|\/)package\.json$/.test(t.path) && /(api|server|backend)/.test(t.path)).map((t) => t.path)[0];
    if (!pkgPath) { out.push({ repo, skipped: 'no package.json' }); continue; }
    let pkg; try { pkg = JSON.parse(await file(repo, pkgPath) ?? '{}'); } catch { pkg = {}; }
    const tsPath = pkgPath.replace('package.json', 'tsconfig.json');
    const tsconfig = tree.some((t) => t.path === tsPath) ? await file(repo, tsPath) : null;
    const d = detect(pkg, tsconfig, tree, repo);
    out.push({ ...d, stars: meta.stargazers_count, pushed: meta.pushed_at.slice(0, 10), archived: meta.archived, license: meta.license?.spdx_id ?? '', pkgPath, hasTs: !!tsconfig || 'typescript' in { ...pkg.dependencies, ...pkg.devDependencies } });
    if (out.length % 20 === 0) { writeFileSync(outFile, JSON.stringify(out, null, 1)); console.error('progress', out.length); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
writeFileSync(outFile, JSON.stringify(out, null, 1));
console.log('done', out.length);
