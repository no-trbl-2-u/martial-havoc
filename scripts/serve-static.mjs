#!/usr/bin/env node
// scripts/serve-static.mjs <dir> <port>
//
// A dependency-free static file server for the e2e gate. Serves the
// Expo web export with the same single-page fallback the Cloudflare
// Worker uses (wrangler.jsonc: not_found_handling =
// "single-page-application"), so what Playwright sees is what the
// deploy serves. Not for production.

import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const [dirArg = 'apps/app/dist', portArg = '4173'] = process.argv.slice(2)
const root = resolve(dirArg)
const port = Number(portArg)

if (!existsSync(join(root, 'index.html'))) {
  console.error(`serve-static: no index.html in ${root} — run \`npm run build:web\` first`)
  process.exit(1)
}

/** MIME by extension; anything else is served as octet-stream. */
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  // The install manifest has its own type; served as JSON a browser
  // ignores it and the app is not installable (phase 9).
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
}

/** Map a URL path to a file under root, or the SPA fallback. */
const resolveFile = (urlPath) => {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  const candidate = join(root, clean)
  if (candidate.startsWith(root) && existsSync(candidate) && statSync(candidate).isFile()) return candidate
  return join(root, 'index.html')
}

createServer((req, res) => {
  const file = resolveFile(req.url ?? '/')
  const body = readFileSync(file)
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
  res.end(body)
}).listen(port, '127.0.0.1', () => {
  console.log(`serve-static: ${root} on http://127.0.0.1:${port}`)
})
