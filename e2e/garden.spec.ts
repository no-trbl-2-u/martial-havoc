/**
 * The garden's one e2e: the exported web build serves the placeholder
 * page with the project name and the licence line. Phase 8 (The UI)
 * replaces this spec together with the page.
 */
import { expect, test } from '@playwright/test'

test('the placeholder page shows the name and the licence line', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Martial Havoc' })).toBeVisible()
  await expect(page.getByText('CC BY-SA 4.0', { exact: false })).toBeVisible()
  await expect(page.getByText('Gianluca Monaco', { exact: false })).toBeVisible()
})

test('an unknown route still serves the app (single-page fallback)', async ({ page }) => {
  await page.goto('/not-a-route')
  await expect(page.getByRole('heading', { name: 'Martial Havoc' })).toBeVisible()
})
