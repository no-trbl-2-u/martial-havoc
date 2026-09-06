/**
 * Phase 9: the web release.
 *
 * What a player meets before the bundle does anything — the document's
 * own metadata, the install manifest, the icon — and the two things the
 * release adds to a working app: the About screen that says whose work
 * this is, and a reload that survives having no network.
 *
 * These run against the same hermetic export every other spec does
 * (`scripts/serve-static.mjs` over `apps/app/dist`), so what they assert
 * is what the Worker serves.
 */
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const button = (page: Page, name: RegExp | string) => page.getByRole('button', { name })

/**
 * Past creation and into the cave.
 *
 * A fresh record opens on creation (Phase 8), so a spec about anything
 * else has to make a Master first. Taking San Te's printed sheet is two
 * taps and spends no `?dice=` faces.
 */
const begin = async (page: Page) => {
  await page.getByTestId('title-start').click()
  await page.getByTestId('preset-preset.san-te').click()
  await page.getByTestId('creation-begin').click()
  await expect(page.getByTestId('beat')).toBeVisible()
}

const TAGLINE =
  'A rules engine for a rule-light d6 solo wuxia RPG. The sandbox is the real game; adventures are scenes in it.'

test('the document names itself before the bundle loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Martial Havoc')
  const head = async (selector: string, attr: string) =>
    page.locator(selector).first().getAttribute(attr)
  expect(await head('meta[name="description"]', 'content')).toBe(TAGLINE)
  expect(await head('meta[name="theme-color"]', 'content')).toBe('#16110C')
  expect(await head('link[rel="manifest"]', 'href')).toBe('/manifest.webmanifest')
  expect(await head('link[rel="icon"]', 'type')).toBe('image/svg+xml')
  expect(await head('meta[name="apple-mobile-web-app-capable"]', 'content')).toBe('yes')
  // viewport-fit=cover: the frame reaches the edges of a notched phone.
  expect(await head('meta[name="viewport"]', 'content')).toContain('viewport-fit=cover')
})

test('the manifest and the icon are served, installably', async ({ request }) => {
  const manifest = await request.get('/manifest.webmanifest')
  expect(manifest.ok()).toBe(true)
  expect(manifest.headers()['content-type']).toContain('application/manifest+json')
  const parsed = (await manifest.json()) as Record<string, unknown>
  expect(parsed['name']).toBe('Martial Havoc')
  expect(parsed['display']).toBe('fullscreen')

  const icon = await request.get('/icon.svg')
  expect(icon.ok()).toBe(true)
  expect(icon.headers()['content-type']).toContain('image/svg+xml')
  expect(await icon.text()).toContain('<svg')
})

test('About credits every author, carries the licence, and counts what shipped', async ({
  page,
}) => {
  await page.goto('/')
  await begin(page)
  await button(page, 'ABOUT').click()
  await expect(page.getByTestId('about')).toBeVisible()
  await expect(page.getByText("The rules are Gianluca Monaco's.")).toBeVisible()
  // Every other author is named by the licence sentence itself, which is
  // transcribed rather than paraphrased, so it is the thing to assert.
  const licence = page.getByTestId('about-licence')
  await expect(licence).toContainText('Gianluca Monaco')
  await expect(licence).toContainText('Cristian Cammarata')
  await expect(licence).toContainText('limofeus')
  await expect(licence).toContainText('watabou')
  await expect(licence).toContainText('CC BY-SA 4.0')
  // The clause that matters: none of the credited art ships.
  await expect(licence).toContainText('Text and SVG only; none of the credited art ships.')
  // Counts are read from the build, so assert their shape, not a literal
  // that would have to be edited every time a table grows.
  await expect(page.getByTestId('about-records')).toHaveText(/^\d{3,} records in \d+ files$/)
  await expect(page.getByTestId('about-behaviours')).toHaveText(
    /^\d+ engine behaviours, every one labelled and cited$/,
  )
  await button(page, 'BACK TO PLAY').click()
  await expect(page.getByTestId('beat')).toBeVisible()
})

test('About never scrolls sideways at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await begin(page)
  await button(page, 'ABOUT').click()
  await expect(page.getByTestId('about-licence')).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('the app opens on a reload with no network', async ({ page, context }) => {
  await page.goto('/')
  await begin(page)
  // One online visit first: the worker fills its cache as the app is
  // used, which is what the release checklist says out loud.
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, {
    timeout: 15_000,
  })
  await expect(page.getByTestId('beat')).toBeVisible()

  await context.setOffline(true)
  await page.reload()
  // The whole app, from cache, and the campaign with it: the title page
  // first, as at every launch, then the Master already made and the
  // menu the rules allow.
  await expect(page.getByTestId('title')).toBeVisible()
  await page.getByTestId('title-start').click()
  await expect(page.getByTestId('beat')).toBeVisible()
  await expect(page.getByTestId('attr-skill')).toHaveText('8')
  await expect(button(page, /TO THE CAVE ENTRANCE/)).toBeVisible()

  await context.setOffline(false)
})
