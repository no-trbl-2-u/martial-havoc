// The label leg of the verify gate (`npm run labels:check`).
// One spec, run on its own so a red label is reported as its own
// gate and not buried in the unit run. See scripts/labels-check.test.ts.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['scripts/labels-check.test.ts'],
  },
})
