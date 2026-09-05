#!/usr/bin/env node
// scripts/deploy.mjs — upload the web export to Cloudflare Workers
// static assets, tagged with the commit it was built from.
//
// The post-push half of the deploy gate is in two parts:
//   npm run deploy          (this file)  — wrangler deploy --tag <sha7> --message "<sha7> <subject>"
//   npm run deploy:version  (this file, --upload-only) — wrangler versions upload, same tag and
//                           message, no traffic change (preview of a non-production branch)
//   npm run deploy:check    (deploy-check.mjs) — polls the Workers API for that sha
//
// Who runs it:
//   - Cloudflare Workers Builds, on every push (the repo is connected in
//     the dashboard): Deploy command `npm run deploy` on the production
//     branch, Version command `npm run deploy:version` on other branches.
//     The commit comes from WORKERS_CI_COMMIT_SHA there.
//   - The loop itself, right after `git push`, from a laptop with .env
//     or a cloud runner with the variables in its environment. Both
//     produce the same tagged version, so deploy:check matches whichever
//     ran first and the other is idempotent.
//
// Env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID (wrangler reads both;
//      Workers Builds injects its own).
// Exit 0 deployed; 1 wrangler failed; 3 config (no token, no export).

import { execSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const uploadOnly = process.argv.includes('--upload-only')

// --- load .env if present (same loader as deploy-check.mjs) ---
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

// Workers Builds authenticates wrangler itself; elsewhere the token and
// account must be present.
const onWorkersBuilds = Boolean(process.env.WORKERS_CI || process.env.WORKERS_CI_COMMIT_SHA)
if (!onWorkersBuilds) {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    console.error('deploy: CLOUDFLARE_API_TOKEN missing (see .env.example). Exit 3.')
    process.exit(3)
  }
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
    console.error('deploy: CLOUDFLARE_ACCOUNT_ID missing (see .env.example). Exit 3.')
    process.exit(3)
  }
}
if (!existsSync('apps/app/dist/index.html')) {
  console.error('deploy: apps/app/dist is empty — run `npm run build:web` first. Exit 3.')
  process.exit(3)
}

/** Run a git command, or return null when git or the repo is unavailable. */
const git = (args) => {
  try {
    return execSync(`git ${args}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}

// The commit being deployed: Workers Builds names it in the environment;
// everywhere else it is HEAD.
const fullSha = process.env.WORKERS_CI_COMMIT_SHA ?? git('rev-parse HEAD')
if (!fullSha) {
  console.error('deploy: cannot determine the commit (no WORKERS_CI_COMMIT_SHA, no git). Exit 3.')
  process.exit(3)
}
const sha7 = fullSha.slice(0, 7)
const subject = git('log -1 --pretty=%s') ?? 'workers-builds'
// Tags are limited in length and charset; the message carries the subject.
const message = `${sha7} ${subject}`.slice(0, 120)

// A preview upload gets a stable alias from the branch name, so its URL
// is https://<alias>-martial-havoc.<subdomain>.workers.dev (Workers
// Builds does the same for non-production branches). deploy-check.mjs
// reads the alias back from the version's annotations.
const branch = process.env.WORKERS_CI_BRANCH ?? git('rev-parse --abbrev-ref HEAD') ?? 'preview'
const alias = branch
  .toLowerCase()
  .replace(/[^a-z0-9-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 63) || 'preview'

const args = uploadOnly
  ? ['wrangler', 'versions', 'upload', '--tag', sha7, '--message', message, '--preview-alias', alias]
  : ['wrangler', 'deploy', '--tag', sha7, '--message', message]

console.log(`deploy: npx ${args.join(' ')}`)
const result = spawnSync('npx', args, { stdio: 'inherit', env: process.env })
process.exit(result.status === 0 ? 0 : 1)
