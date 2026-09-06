/**
 * The three Phase 8a layout candidates, photographed for the operator.
 *
 * The build-plan row's `[needs-user-call]`: "the agent renders three
 * layouts at phone width with a working beat and files them; the
 * operator picks". These are the files. Each candidate is shot twice —
 * the beat as it opens, and the beat with a result on it, which is
 * where the three arrangements actually differ — on the same named
 * dice, so the only variable between the pictures is the layout.
 *
 * Not a verify leg: fonts differ between machines, so a pixel diff
 * would be a flaky gate. `npm run screenshots` after `npm run
 * build:web`.
 */
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const CANDIDATES = [
  { id: 'a', name: 'scroll' },
  { id: 'b', name: 'sheet' },
  { id: 'c', name: 'ledger' },
] as const

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `design/screenshots/layouts/${name}.png`, fullPage: false })

for (const candidate of CANDIDATES) {
  test(`layout ${candidate.id} (${candidate.name}) — the beat as it opens`, async ({ page }) => {
    await page.goto(`/?layout=${candidate.id}`)
    await expect(page.getByTestId(`layout-${candidate.id}`)).toBeVisible()
    await expect(page.getByTestId('authored-line')).toBeVisible()
    await shot(page, `${candidate.id}-${candidate.name}-1-opening`)
  })

  test(`layout ${candidate.id} (${candidate.name}) — with a result on it`, async ({ page }) => {
    // 4 + 6 = 10: a passed SKILL check, the same roll in all three.
    await page.goto(`/?layout=${candidate.id}&dice=4,6`)
    await page.getByRole('button', { name: /FORCE THE SHUT GATE/ }).click()
    await expect(page.getByText('SKILL CHECK · PASSED')).toBeVisible()
    await shot(page, `${candidate.id}-${candidate.name}-2-result`)
  })
}
