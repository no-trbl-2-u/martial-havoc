/**
 * Registering the service worker that makes a reload work offline.
 *
 * The worker itself is `apps/app/public/sw.js`, copied to the export
 * root by `expo export`. This module is the one line of app code that
 * asks the browser to install it, and it is entirely guarded.
 *
 * Nothing here is fatal (phase 9 brief, decision 4). A native build has
 * no `navigator.serviceWorker`; a browser in private mode may refuse
 * registration; an insecure origin is not allowed one at all. Each of
 * those is a normal app with no offline reload - never an error a player
 * sees, and never a reason the app does not start.
 */

/** What `navigator` looks like when a service worker is available. */
type WorkerNavigator = {
  readonly serviceWorker?: {
    readonly register: (url: string) => Promise<unknown>
  }
}

/** The path the export serves the worker from. */
export const WORKER_URL = '/sw.js'

/**
 * Ask the browser to install the worker, once, after load.
 *
 * Returns whether registration was even attempted, which is what a test
 * asserts: whether the browser then honours it is the browser's affair.
 * Deliberately fire-and-forget - the app must not wait on it.
 */
export const registerOfflineWorker = (): boolean => {
  try {
    const nav = (globalThis as { navigator?: WorkerNavigator }).navigator
    const worker = nav?.serviceWorker
    if (worker === undefined || typeof worker.register !== 'function') return false
    // A rejected registration is the expected outcome on an insecure
    // origin and in some private modes; it is swallowed on purpose.
    void worker.register(WORKER_URL).catch(() => undefined)
    return true
  } catch {
    return false
  }
}
