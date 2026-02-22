import type { Metadata } from 'next'
import { getBaseUrl } from '@/lib/core/utils/urls'
import { getBrandConfig } from '@/extra/branding/config'

const APP_DESCRIPTION_SHORT =
  'Sim is an open-source AI agent workflow builder for production workflows.'

const APP_DESCRIPTION_FULL =
  'Sim is an open-source AI agent workflow builder. Developers at trail-blazing startups to Fortune 500 companies deploy agentic workflows on the Sim platform. 60,000+ developers already use Sim to build and deploy AI agent workflows and connect them to 100+ apps. Sim is SOC2 and HIPAA compliant, ensuring enterprise-grade security for AI automation.'

const APP_KEYWORDS = [
  'AI agent',
  'AI agent builder',
  'AI agent workflow',
  'AI workflow automation',
  'visual workflow editor',
  'AI agents',
  'workflow canvas',
  'intelligent automation',
  'AI tools',
  'workflow designer',
  'artificial intelligence',
  'business automation',
  'AI agent workflows',
  'visual programming',
]

/**
 * Generates Next.js Metadata based on the active brand configuration.
 * Accepts an optional partial override to customise per-page metadata.
 */
export function generateBrandedMetadata(override: Partial<Metadata> = {}): Metadata {
  const brand = getBrandConfig()
  const baseUrl = getBaseUrl()

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
          url: brand.logoUrl || '/logo/426-240/primary/small.png',
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
      images: [brand.logoUrl || '/logo/426-240/primary/small.png'],
      creator: '@simdotai',
      site: '@simdotai',
    },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/favicon/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
        { url: brand.faviconUrl || '/sim.png', sizes: 'any', type: 'image/png' },
      ],
      apple: '/favicon/apple-touch-icon.png',
      shortcut: brand.faviconUrl || '/favicon/favicon.ico',
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
      'msapplication-TileColor': '#701FFC',
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
    name: 'Sim',
    description:
      'Sim is an open-source AI agent workflow builder. Developers at trail-blazing startups to Fortune 500 companies deploy agentic workflows on the Sim platform. 60,000+ developers already use Sim to build and deploy AI agent workflows and connect them to 100+ apps. Sim is SOC2 and HIPAA compliant, ensuring enterprise-level security.',
    url: getBaseUrl(),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    applicationSubCategory: 'AIWorkflowAutomation',
    areaServed: 'Worldwide',
    availableLanguage: ['en'],
    offers: { '@type': 'Offer', category: 'SaaS' },
    creator: { '@type': 'Organization', name: 'Sim', url: 'https://sim.ai' },
    featureList: [
      'Visual AI Agent Builder',
      'Workflow Canvas Interface',
      'AI Agent Automation',
      'Custom AI Workflows',
    ],
  }
}
