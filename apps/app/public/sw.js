/**
 * Offline: the service worker, with two rules and no third.
 *
 * spec.md's Horizon says the game is offline. Everything it needs is
 * already in the bundle - the tables, the lines, the engine - and the
 * campaign is in localStorage. The one thing a browser still needs the
 * network for is fetching the app itself, and this is what removes that.
 *
 * The two rules, split by path rather than by a version string:
 *
 * 1. `/_expo/static/**` is CACHE-FIRST. Those filenames carry a content
 *    hash, so a cached one is byte-identical to the one on the server
 *    and can never be stale. A new build has new names and misses the
 *    cache exactly once.
 * 2. Everything else - the document above all - is NETWORK-FIRST with a
 *    cached fallback. Online, the player always gets today's shell.
 *    Offline, they get the last one that loaded.
 *
 * The failure mode this avoids is the one a cache-first shell has:
 * serving yesterday's app to someone who is online and cannot tell.
 * Network-first costs a round trip on a warm cache and cannot do that.
 *
 * No dependency, no build step, no precache list to keep in step with
 * the export (phase 9 brief, decision 2). The cache fills as the app is
 * used, which is also why the first offline reload requires one online
 * visit first - the checklist says so.
 */

/** Bumping this name is how a bad cache is abandoned wholesale. */
const CACHE = 'martial-havoc-v1'

/** Content-hashed bundle output: safe to serve from cache forever. */
const isImmutable = (url) => new URL(url).pathname.startsWith('/_expo/static/')

/** Put a good response in the cache; a failure to store is never fatal. */
const remember = async (request, response) => {
  if (!response || !response.ok || response.type === 'opaque') return response
  try {
    const cache = await caches.open(CACHE)
    await cache.put(request, response.clone())
  } catch {
    /* quota, private mode, refused: the app still works */
  }
  return response
}

/** Rule 1: the cache wins, and the network only fills a miss. */
const cacheFirst = async (request) => {
  const hit = await caches.match(request)
  if (hit !== undefined) return hit
  return remember(request, await fetch(request))
}

/**
 * Rule 2: the network wins, and the cache is the fallback.
 *
 * The last fallback is the cached document itself: a deep link opened
 * offline should give the app, exactly as the Worker's
 * `not_found_handling: single-page-application` gives it online.
 */
const networkFirst = async (request) => {
  try {
    return await remember(request, await fetch(request))
  } catch {
    const hit = await caches.match(request)
    if (hit !== undefined) return hit
    const shell = await caches.match('/')
    if (shell !== undefined) return shell
    throw new Error('offline and nothing cached')
  }
}

self.addEventListener('install', (event) => {
  // The shell is worth having before the first offline visit; everything
  // else arrives as it is used. A failed warm-up is not a failed install.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/', '/manifest.webmanifest', '/icon.svg']))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  // Drop every cache but this version's, then take over open pages so a
  // player does not have to close the tab to get the new worker.
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  // Only GET is cacheable, and only this origin is ours to serve.
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return
  event.respondWith(isImmutable(request.url) ? cacheFirst(request) : networkFirst(request))
})
