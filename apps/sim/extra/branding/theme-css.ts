/**
 * Brand constants (replacing environment variables)
 */
const BRAND_PRIMARY_COLOR = '#4A90E2'
const BRAND_PRIMARY_HOVER_COLOR = '#357ABD'
const BRAND_ACCENT_COLOR = '#F5A623'
const BRAND_ACCENT_HOVER_COLOR = '#D48806'
const BRAND_BACKGROUND_COLOR = '#FFFFFF'

/**
 * Determines whether a hex background colour is perceived as dark.
 */
function isHexColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16) // ✅ b was missing

  // Standard relative luminance formula
  const relativeLuminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return relativeLuminance < 0.5
}

/**
 * Collects brand-related CSS custom properties from constants
 * and returns a :root block string.
 */
function computeCSSVariables(): string {
  const declarations: string[] = []

  if (BRAND_PRIMARY_COLOR) {
    declarations.push(`--brand-primary-hex: ${BRAND_PRIMARY_COLOR};`)
  }

  if (BRAND_PRIMARY_HOVER_COLOR) {
    declarations.push(`--brand-primary-hover-hex: ${BRAND_PRIMARY_HOVER_COLOR};`)
  }

  if (BRAND_ACCENT_COLOR) {
    declarations.push(`--brand-accent-hex: ${BRAND_ACCENT_COLOR};`)
  }

  if (BRAND_ACCENT_HOVER_COLOR) {
    declarations.push(`--brand-accent-hover-hex: ${BRAND_ACCENT_HOVER_COLOR};`)
  }

  if (BRAND_BACKGROUND_COLOR) {
    declarations.push(`--brand-background-hex: ${BRAND_BACKGROUND_COLOR};`)

    if (isHexColorDark(BRAND_BACKGROUND_COLOR)) {
      declarations.push('--brand-is-dark: 1;')
    }
  }

  return declarations.length > 0 ? `:root { ${declarations.join(' ')} }` : ''
}

/**
 * Generates a CSS string containing brand theme custom properties for injection into the page.
 */
export function generateThemeCSS(): string {
  return computeCSSVariables()
}
