/**
 * Registering the offline worker.
 *
 * The worker's own two rules are asserted in
 * `scripts/release-check.test.ts`, which can read the file. What is
 * testable here is the contract this module actually owns: that asking
 * for a worker where none exists is a quiet no, never a throw, and
 * never something a player sees (phase 9 brief, decision 4).
 */
import { describe, expect, it } from 'vitest'
import { WORKER_URL, registerOfflineWorker } from './offline'

describe('registering the offline worker', () => {
  it('is a no-op, not a throw, where no service worker exists', () => {
    // Vitest runs in node: there is no navigator.serviceWorker, which is
    // the same shape a native build and an insecure origin present.
    expect(registerOfflineWorker()).toBe(false)
  })

  it('asks for the worker at the path the export serves it from', () => {
    expect(WORKER_URL).toBe('/sw.js')
  })
})
