/**
 * Fill a content string's `{placeholders}`.
 *
 * UI copy lives in `packages/content` (agents.md rule 7) and carries its
 * variable parts as braces: `OVERRIDES {n}`. This is the one place they
 * are filled. A placeholder with no value is left as written, so a
 * missing variable is visible on screen rather than silently blank.
 */
export const fill = (
  template: string,
  values: Readonly<Record<string, string | number>>,
): string =>
  template.replace(/\{([a-zA-Z0-9_]+)\}/g, (whole, key: string) => {
    const value = values[key]
    return value === undefined ? whole : String(value)
  })
