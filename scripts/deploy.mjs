#!/usr/bin/env node
// scripts/deploy.mjs — upload the web export to Cloudflare Workers
// static assets, tagged with the commit it was built from.
//
// The post-push half of the deploy gate is in two parts:
//   npm run deploy        (this file)  — wrangler deploy --tag <sha7> --message "<sha7> <subject>"
//   npm run deploy:check  (deploy-check.mjs) — polls the Workers API for that sha
//
// Runs from a laptop with .env, from a cloud runner with the variables
// in its environment, or from .github/workflows/deploy.yml on push to
// main. All three produce the same tagged version, so deploy:check
// matches whichever ran first and the others are idempotent.
//
// Env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID (wrangler reads both).
// Exit 0 deployed; 1 wrangler failed; 3 config (no token, no export).

import { execSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

// --- load .env if present (same loader as deploy-check.mjs) ---
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.error('deploy: CLOUDFLARE_API_TOKEN missing (see .env.example). Exit 3.')
  process.exit(3)
}
if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
  console.error('deploy: CLOUDFLARE_ACCOUNT_ID missing (see .env.example). Exit 3.')
  process.exit(3)
}
if (!existsSync('apps/app/dist/index.html')) {
  console.error('deploy: apps/app/dist is empty — run `npm run build:web` first. Exit 3.')
  process.exit(3)
}

const sha7 = execSync('git rev-parse --short=7 HEAD', { encoding: 'utf-8' }).trim()
const subject = execSync('git log -1 --pretty=%s', { encoding: 'utf-8' }).trim()
// Tags are limited in length and charset; the message carries the subject.
const message = `${sha7} ${subject}`.slice(0, 120)

console.log(`deploy: wrangler deploy --tag ${sha7} --message "${message}"`)
const result = spawnSync(
  'npx',
  ['wrangler', 'deploy', '--tag', sha7, '--message', message],
  { stdio: 'inherit', env: process.env },
)
process.exit(result.status === 0 ? 0 : 1)
