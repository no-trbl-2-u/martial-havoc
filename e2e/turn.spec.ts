/**
 * The page turn: changing screen lifts the leaf just read over the new
 * one and lands it (apps/app/src/components/Leaf.tsx).
 *
 * Every other spec runs with reduced motion (playwright config) and
 * never sees a turn. This one opts back in, so it proves
 * three things the gate would otherwise not: that a turn happens, that
 * the new page is readable underneath it from the first frame, and
 * that the lifted leaf lands and is gone.
 */
import { expect, test } from '@playwright/test'

test.use({ contextOptions: { reducedMotion: 'no-preference' } })

const begin = async (page: import('@playwright/test').Page) => {
  await page.getByTestId('preset-preset.san-te').click()
  await page.getByTestId('creation-begin').click()
  await expect(page.getByTestId('beat')).toBeVisible()
}

test('a screen change turns the leaf, with the new page under it at once', async ({ page }) => {
  await page.goto('/')
  await begin(page)
  // Creation to the beat was itself a turn; let it land.
  await expect(page.getByTestId('leaf-turning')).toHaveCount(0)

  await page.getByRole('button', { name: 'RULES' }).click()
  // The old leaf is in the air, and takes no taps.
  const lifted = page.getByTestId('leaf-turning')
  await expect(lifted).toBeVisible()
  await expect(lifted).toHaveCSS('pointer-events', 'none')
  // The rules panel is already there beneath it.
  await expect(page.getByText('RULES, READINGS AND INVENTIONS')).toBeVisible()
  // And the leaf lands.
  await expect(lifted).toHaveCount(0)
  await expect(page.getByText('RULES, READINGS AND INVENTIONS')).toBeVisible()
})

test('with reduced motion the page simply changes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  await begin(page)
  await page.getByRole('button', { name: 'RULES' }).click()
  await expect(page.getByText('RULES, READINGS AND INVENTIONS')).toBeVisible()
  await expect(page.getByTestId('leaf-turning')).toHaveCount(0)
  await context.close()
})
