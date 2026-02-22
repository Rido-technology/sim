import { type BrandConfig, defaultBrandConfig, type ThemeColors } from '@/lib/branding'
import { getEnv } from '@/lib/core/config/env'

export type { BrandConfig, ThemeColors }

/** Static brand identity settings. */
const BRAND_IDENTITY = {
  name: 'Myapp',
  logoUrl: '/logo/Myapp-logo.png',
  faviconUrl: '/favicon/Myapp-favicon.png',
  supportEmail: 'support@Myapp.ai',
  documentationUrl: 'https://docs.Myapp.ai',
  termsUrl: 'https://Myapp.ai/terms',
  privacyUrl: 'https://Myapp.ai/privacy',
} as const

/** Brand colour palette. */
const BRAND_PALETTE = {
  primaryColor: '#4A90E2',
  primaryHoverColor: '#357ABD',
  accentColor: '#F5A623',
  accentHoverColor: '#D48806',
  backgroundColor: '#FFFFFF',
} as const

/**
 * Merges the static colour palette with defaults for any missing keys.
 */
function buildThemeColors(): ThemeColors {
  const fallback = defaultBrandConfig.theme ?? {}
  return {
    primaryColor: BRAND_PALETTE.primaryColor || fallback.primaryColor,
    primaryHoverColor: BRAND_PALETTE.primaryHoverColor || fallback.primaryHoverColor,
    accentColor: BRAND_PALETTE.accentColor || fallback.accentColor,
    accentHoverColor: BRAND_PALETTE.accentHoverColor || fallback.accentHoverColor,
    backgroundColor: BRAND_PALETTE.backgroundColor || fallback.backgroundColor,
  }
}

/**
 * Assembles the full brand configuration, merging static identity,
 * runtime CSS URL, and resolved theme colours.
 */
function assembleBrandConfig(): BrandConfig {
  const customCssUrl =
    getEnv('NEXT_PUBLIC_CUSTOM_CSS_URL') || defaultBrandConfig.customCssUrl

  return {
    ...BRAND_IDENTITY,
    customCssUrl: customCssUrl || defaultBrandConfig.customCssUrl,
    theme: buildThemeColors(),
  }
}

/**
 * Returns the active brand configuration.
 */
export const getBrandConfig = (): BrandConfig => assembleBrandConfig()

/**
 * React hook to access brand configuration inside components.
 */
export const useBrandConfig = (): BrandConfig => assembleBrandConfig()
