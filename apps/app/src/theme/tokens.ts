/**
 * The woodblock tokens, from `design/prototype/martial-havoc-prototype.dc.html`.
 *
 * Two inks and a paper, heavy borders, three families. Everything a
 * component colours or sizes comes from here; the design file is the
 * source and `design/INDEX.md` records what it decided.
 */
import { Platform } from 'react-native'

export const color = {
  paper: '#FBF3E1',
  ink: '#16110C',
  ochre: '#C1873A',
  binding: '#A87030',
  vermilion: '#8E2417',
  dim: '#3A2A12',
  disabled: '#E4D6B4',
  frame: '#8E6428',
} as const

export const font = {
  /** Labels: the platform sans, heavy and tracked. */
  sans: Platform.select({
    web: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    default: undefined,
  }),
  /** Authored lines: a serif. */
  serif: Platform.select({ web: 'Georgia, serif', ios: 'Georgia', default: 'serif' }),
  /** Citations and numbers: a monospace. */
  mono: Platform.select({ web: 'ui-monospace, Menlo, Consolas, monospace', ios: 'Menlo', default: 'monospace' }),
} as const

/** The ink border every slip carries. */
export const border = 3

/** The frame's reference width (design/V1-DESIGN-PROMPT.md: 390 x 844). */
export const frameWidth = 390

export const space = { xs: 4, s: 7, m: 9, l: 14 } as const
