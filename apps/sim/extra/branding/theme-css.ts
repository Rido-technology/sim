/** Maps each CSS variable name to its static brand colour value. */
const BRAND_CSS_VARS: ReadonlyMap<string, string> = new Map([
  ['--brand-primary-hex', '#4A90E2'],
  ['--brand-primary-hover-hex', '#357ABD'],
  ['--brand-accent-hex', '#F5A623'],
  ['--brand-accent-hover-hex', '#D48806'],
  ['--brand-background-hex', '#FFFFFF'],
])

/** The CSS variable that signals a dark background to child components. */
const DARK_FLAG_VAR = '--brand-is-dark: 1;'

/** Background colour key used for dark-mode detection. */
const BACKGROUND_VAR = '--brand-background-hex'

/**
 * Returns `true` when the perceived luminance of a hex colour falls below 50 %.
 */
function perceivedAsDark(hex: string): boolean {
  const stripped = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(stripped.slice(offset, offset + 2), 16))
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}

/**
 * Iterates the colour map, emits `property: value` declarations,
 * and appends a dark-mode flag when the background is perceived as dark.
 */
function buildCSSDeclarations(): string[] {
  const declarations: string[] = []

  for (const [variable, value] of BRAND_CSS_VARS) {
    if (value) {
      declarations.push(`${variable}: ${value};`)
      if (variable === BACKGROUND_VAR && perceivedAsDark(value)) {
        declarations.push(DARK_FLAG_VAR)
      }
    }
  }

  return declarations
}

/**
 * Generates a CSS string containing brand theme custom properties for injection into the page.
 */
export function generateThemeCSS(): string {
  const declarations = buildCSSDeclarations()
  return declarations.length > 0 ? `:root { ${declarations.join(' ')} }` : ''
}
