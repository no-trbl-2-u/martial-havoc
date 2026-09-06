/**
 * The release shell: the files the export serves the app in.
 *
 * These are static assets, not modules — nothing imports them, so
 * nothing else would notice if one drifted. The checks here are the
 * ones a broken release would fail on a phone and nowhere else: a
 * manifest that no longer names the app, an icon that stopped being an
 * icon, a template that lost the styles the frame's layout needs, or a
 * service worker whose two rules quietly became one (phase 9 brief).
 *
 * It lives at the root rather than in `apps/app` for the same reason
 * `docs-check.test.ts` does: it reads the filesystem, and the app's
 * tsconfig is Expo's, which carries no node types. The root vitest
 * config gives it its own project.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { t } from '@martial-havoc/content'

const appDir = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'apps', 'app')
const read = (name: string): string => readFileSync(join(appDir, 'public', name), 'utf-8')

/**
 * The woodblock tokens, read out of `theme/tokens.ts` as source text.
 *
 * Importing the module would pull in `react-native` for `Platform`,
 * which this runner cannot parse. Reading the hex values instead keeps
 * the cross-check real - rename or repaint a token and these tests go
 * red - without dragging the whole native runtime into a test about
 * four static files.
 */
const tokens = readFileSync(join(appDir, 'src', 'theme', 'tokens.ts'), 'utf-8')
const color = (name: string): string => {
  const found = new RegExp(`${name}:\\s*'(#[0-9A-Fa-f]{3,8})'`).exec(tokens)
  if (found?.[1] === undefined) throw new Error(`no colour token named ${name}`)
  return found[1]
}

describe('the web app manifest', () => {
  const manifest = JSON.parse(read('manifest.webmanifest')) as Record<string, unknown>

  it('names the app the way the content package does', () => {
    expect(manifest['name']).toBe(t('app.title'))
    expect(manifest['description']).toBe(t('app.tagline'))
  })

  it('installs as a portrait fullscreen app from the root', () => {
    // fullscreen: on Android the installed app hides the status bar and
    // the system navigation bar, which otherwise sat over the footer
    // (operator request, 2026-09-06).
    expect(manifest['display']).toBe('fullscreen')
    expect(manifest['orientation']).toBe('portrait')
    expect(manifest['start_url']).toBe('/')
    expect(manifest['scope']).toBe('/')
  })

  it('paints in the woodblock tokens, not in colours of its own', () => {
    expect(manifest['theme_color']).toBe(color('ink'))
    expect(manifest['background_color']).toBe(color('frame'))
  })

  it('ships one SVG icon, offered both plain and maskable', () => {
    const icons = manifest['icons'] as readonly Record<string, string>[]
    expect(icons).toHaveLength(2)
    expect(icons.every((i) => i.type === 'image/svg+xml' && i.src === '/icon.svg')).toBe(true)
    expect(icons.map((i) => i.purpose).sort()).toEqual(['any', 'maskable'])
  })
})

describe('the icon', () => {
  const icon = read('icon.svg')

  it('is an SVG, which is the only image form the licence lets us ship', () => {
    expect(icon).toContain('<svg')
    expect(icon).toContain('viewBox="0 0 512 512"')
  })

  it('is drawn in the woodblock tokens', () => {
    expect(icon).toContain(color('ochre'))
    expect(icon).toContain(color('paper'))
    expect(icon).toContain(color('ink'))
    expect(icon).toContain(color('vermilion'))
  })

  it('keeps every stroke inside a maskable icon’s safe zone', () => {
    // 512 * 0.2 = 102.4; the drawn field starts at 112 and ends at 400.
    expect(icon).toContain('x="112" y="112" width="288" height="288"')
  })
})

describe('the document template', () => {
  const html = read('index.html')

  it('carries the metadata a phone reads before the bundle loads', () => {
    expect(html).toContain(`<title>${t('app.title')}</title>`)
    expect(html).toContain(t('app.tagline'))
    expect(html).toContain(`content="${color('ink')}"`)
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"')
    expect(html).toContain('viewport-fit=cover')
  })

  it('keeps the react-native-web reset the default Expo template supplies', () => {
    // Replacing the template means owning these three rules; without
    // them the frame loses its height on the export and nowhere else.
    expect(html).toContain('id="expo-reset"')
    expect(html).toContain('height: 100%')
    expect(html).toContain('overflow: hidden')
    expect(html).toContain('#root')
  })
})

describe('the service worker', () => {
  const sw = read('sw.js')

  it('keeps both rules: hashed assets cached, everything else network-first', () => {
    expect(sw).toContain("pathname.startsWith('/_expo/static/')")
    expect(sw).toContain('cacheFirst')
    expect(sw).toContain('networkFirst')
    expect(sw).toContain('isImmutable(request.url) ? cacheFirst(request) : networkFirst(request)')
  })

  it('never caches a request that is not a same-origin GET', () => {
    expect(sw).toContain("request.method !== 'GET'")
    expect(sw).toContain('!== self.location.origin')
  })
})
