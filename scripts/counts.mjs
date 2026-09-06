#!/usr/bin/env node
// scripts/counts.mjs — the content and behaviour counts, printed.
//
// spec.md asks for counts readable from the build, and the phase 9
// release checklist has a line that wants them printed. This is that
// printed form; apps/app/src/screens/AboutScreen.tsx is the readable
// one. Both read contentCounts() and the engine's behaviour registry,
// so the number on the checklist and the number on the screen cannot
// drift apart.
//
//   node scripts/counts.mjs            # a short report
//   node scripts/counts.mjs --by-file  # every file and its record count
//   node scripts/counts.mjs --json     # the whole thing, machine-readable
//
// Why it bundles rather than imports: the two workspace packages are
// TypeScript that imports JSON the way a bundler resolves it, which is
// what keeps them free of runtime I/O (agents.md rule 7). Node cannot
// load that directly. esbuild is already installed - it is what vite
// and therefore vitest run on - so this asks it for one in-memory
// bundle of a three-line entry point and imports the result. No new
// dependency, no build artefact on disk, and the numbers come from the
// same modules the app ships rather than from a second walk of the
// directory that could quietly disagree with them.
//
// Reads nothing but the two packages. No network, no git. Always exits
// 0: this is a report, not a gate. The gate that keeps these numbers
// honest is packages/content/src/content.test.ts.

import { build } from 'esbuild'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')

/** Bundle the two registries into one module and import it. */
const load = async () => {
  const bundled = await build({
    stdin: {
      contents: `
        export { contentCounts } from '@martial-havoc/content'
        export { behaviours } from '@martial-havoc/engine'
      `,
      resolveDir: ROOT,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
  })
  const code = bundled.outputFiles[0]?.text ?? ''
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}

const { contentCounts, behaviours } = await load()
const args = new Set(process.argv.slice(2))
const counts = contentCounts()

/** Behaviours by label, the three the estate allows (agents.md rule 6). */
const byLabel = behaviours.reduce((tally, b) => {
  tally[b.label] = (tally[b.label] ?? 0) + 1
  return tally
}, {})

if (args.has('--json')) {
  console.log(
    JSON.stringify(
      { content: counts, behaviours: { total: behaviours.length, byLabel } },
      null,
      2,
    ),
  )
  process.exit(0)
}

console.log('Martial Havoc — what ships')
console.log('')
console.log(`  content files        ${String(counts.files)}`)
console.log(`  content records      ${String(counts.records)}`)
console.log(`  authored lines       ${String(counts.authoredLines)}`)
console.log(`  engine behaviours    ${String(behaviours.length)}`)
for (const [label, n] of Object.entries(byLabel).sort()) {
  console.log(`    ${label.padEnd(17)}${String(n)}`)
}

if (args.has('--by-file')) {
  console.log('')
  console.log('  records per file')
  for (const [id, n] of Object.entries(counts.byFile).sort()) {
    console.log(`    ${id.padEnd(45)}${String(n)}`)
  }
}
