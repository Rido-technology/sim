import type { Metadata } from 'next'
import { getBaseUrl } from '@/lib/core/utils/urls'
import { getBrandConfig } from '@/extra/branding/config'

const APP_DESCRIPTION_SHORT =
  'Myapp is an open-source platform to design and deploy AI-driven workflows.'

const APP_DESCRIPTION_FULL =
  'Myapp is an open-source platform for building AI-driven workflows. Teams at startups and enterprises leverage Myapp to automate complex tasks, integrate multiple apps, and streamline operations. 50,000+ users rely on Myapp for workflow automation with enterprise-grade security and compliance.'

const APP_KEYWORDS = [
  'AI workflow',
  'AI automation',
  'workflow builder',
  'workflow designer',
  'visual programming',
  'intelligent automation',
  'business workflow',
  'automation tools',
  'workflow canvas',
  'AI agents',
  'workflow management',
  'process automation',
]

/**
 * Generates Next.js Metadata based on the active brand configuration.
 * Accepts an optional partial override to customise per-page metadata.
 */
export function generateBrandedMetadata(override: Partial<Metadata> = {}): Metadata {
  const brand = getBrandConfig()
  const baseUrl = getBaseUrl()

  const defaultLogo = '/logo/426-240/primary/small.png'
  const logoUrl = brand.logoUrl || defaultLogo
  const faviconUrl = brand.faviconUrl || '/Myapp.png'

  return {
    title: {
      template: `%s | ${brand.name}`,
      default: brand.name,
    },
    description: APP_DESCRIPTION_SHORT,
    applicationName: brand.name,
    authors: [{ name: brand.name }],
    generator: 'Next.js',
    keywords: APP_KEYWORDS,
    referrer: 'origin-when-cross-origin',
    creator: brand.name,
    publisher: brand.name,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
      languages: { 'en-US': '/' },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: baseUrl,
      title: brand.name,
      description: APP_DESCRIPTION_FULL,
      siteName: brand.name,
      images: [
        {
          url: logoUrl,
          width: 2130,
          height: 1200,
          alt: brand.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: brand.name,
      description: APP_DESCRIPTION_FULL,
      images: [logoUrl],
      creator: '@Myappai',
      site: '@Myappai',
    },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/favicon/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
        { url: faviconUrl, sizes: 'any', type: 'image/png' },
      ],
      apple: '/favicon/apple-touch-icon.png',
      shortcut: faviconUrl,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: brand.name,
    },
    formatDetection: { telephone: false },
    category: 'technology',
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#4A90E2',
      'msapplication-config': '/favicon/browserconfig.xml',
    },
    ...override,
  }
}

/**
 * Returns static JSON-LD structured data for SEO.
 */
export function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Myapp',
    description:
      'Myapp is an open-source platform for building AI-driven workflows. Teams at startups and enterprises leverage Myapp to automate complex tasks, integrate multiple apps, and streamline operations. 50,000+ users rely on Myapp for workflow automation with enterprise-grade security and compliance.',
    url: getBaseUrl(),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    applicationSubCategory: 'AIWorkflowAutomation',
    areaServed: 'Worldwide',
    availableLanguage: ['en'],
    offers: { '@type': 'Offer', category: 'SaaS' },
    creator: { '@type': 'Organization', name: 'Myapp', url: 'https://Myapp.ai' },
    featureList: [
      'Visual AI Workflow Builder',
      'Workflow Canvas Interface',
      'AI Automation Integration',
      'Custom AI Workflows',
    ],
  }
}