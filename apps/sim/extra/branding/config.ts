import { type BrandConfig, defaultBrandConfig, type ThemeColors } from '@/lib/branding'

export type { BrandConfig, ThemeColors }
import { getEnv } from '@/lib/core/config/env'
/**
 * Brand constants 
 */
const BRAND_NAME = 'Myapp'
const BRAND_LOGO_URL = '/logo/Myapp-logo.png'
const BRAND_FAVICON_URL = '/favicon/Myapp-favicon.png'
const CUSTOM_CSS_URL = getEnv('NEXT_PUBLIC_CUSTOM_CSS_URL') || defaultBrandConfig.customCssUrl
const SUPPORT_EMAIL = 'support@Myapp.ai'
const DOCUMENTATION_URL = 'https://docs.Myapp.ai'
const TERMS_URL = 'https://Myapp.ai/terms'
const PRIVACY_URL = 'https://Myapp.ai/privacy'

const THEME_PRIMARY_COLOR = '#4A90E2'
const THEME_PRIMARY_HOVER_COLOR = '#357ABD'
const THEME_ACCENT_COLOR = '#F5A623'
const THEME_ACCENT_HOVER_COLOR = '#D48806'
const THEME_BACKGROUND_COLOR = '#FFFFFF'

/**
 * Resolves theme color values from constants with fallback to defaults.
 */
function resolveThemeColors(): ThemeColors {
  const defaultTheme = defaultBrandConfig.theme || {}
  return {
    primaryColor: THEME_PRIMARY_COLOR || defaultTheme.primaryColor,
    primaryHoverColor: THEME_PRIMARY_HOVER_COLOR || defaultTheme.primaryHoverColor,
    accentColor: THEME_ACCENT_COLOR || defaultTheme.accentColor,
    accentHoverColor: THEME_ACCENT_HOVER_COLOR || defaultTheme.accentHoverColor,
    backgroundColor: THEME_BACKGROUND_COLOR || defaultTheme.backgroundColor,
  }
}

/**
 * Builds the full brand configuration from constants.
 * Falls back to default brand config for any missing values.
 */
function buildBrandConfig(): BrandConfig {
  return {
    name: BRAND_NAME || defaultBrandConfig.name,
    logoUrl: BRAND_LOGO_URL || defaultBrandConfig.logoUrl,
    faviconUrl: BRAND_FAVICON_URL || defaultBrandConfig.faviconUrl,
    customCssUrl: CUSTOM_CSS_URL || defaultBrandConfig.customCssUrl,
    supportEmail: SUPPORT_EMAIL || defaultBrandConfig.supportEmail,
    documentationUrl: DOCUMENTATION_URL || defaultBrandConfig.documentationUrl,
    termsUrl: TERMS_URL || defaultBrandConfig.termsUrl,
    privacyUrl: PRIVACY_URL || defaultBrandConfig.privacyUrl,
    theme: resolveThemeColors(),
  }
}

/**
 * Returns the active brand configuration derived from constants.
 */
export const getBrandConfig = (): BrandConfig => buildBrandConfig()

/**
 * React hook to access brand configuration inside components.
 */
export const useBrandConfig = (): BrandConfig => getBrandConfig()
