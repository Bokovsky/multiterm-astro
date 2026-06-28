import type { SiteConfig, ThemesWithColorStyles } from '~/types'
import { pick } from '~/utils/theme'
import { themeKeys } from '~/types'

const giscusKeys = new Set([
  'comment',
  'constant',
  'entity',
  'tag',
  'keyword',
  'string',
  'variable',
  'regexp',
])
const cssVarKeys = themeKeys.filter((k) => !giscusKeys.has(k))

export function buildWebsiteSchema(
  siteConfig: SiteConfig,
  siteUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.title,
    description: siteConfig.description,
    url: siteUrl,
    author: {
      '@type': 'Person',
      name: siteConfig.author,
    },
  }
}

export function buildArticleSchema(params: {
  title: string
  description: string
  pageUrl: string
  pageImage: string
  publishedDate?: Date
  modifiedDate?: Date
  author: string
  tags: string[]
  siteTitle: string
  siteUrl: string
}) {
  const {
    title,
    description,
    pageUrl,
    pageImage,
    publishedDate,
    modifiedDate,
    author,
    tags,
    siteTitle,
    siteUrl,
  } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title || '',
    description,
    url: pageUrl,
    ...(publishedDate && { datePublished: publishedDate.toISOString() }),
    ...(modifiedDate && { dateModified: modifiedDate.toISOString() }),
    ...(publishedDate && !modifiedDate && {
      dateModified: publishedDate.toISOString(),
    }),
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteTitle,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.svg`,
      },
    },
    image: pageImage,
    keywords: tags.join(', ') || '',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  }
}

export function generateThemeCss(
  resolvedThemes: ThemesWithColorStyles,
): string {
  const cssLines: string[] = []
  for (const [themeId, themeStyles] of Object.entries(resolvedThemes)) {
    const relevantStyles = pick(themeStyles, cssVarKeys)
    cssLines.push(`:root[data-theme="${themeId}"] {`)
    for (const [key, value] of Object.entries(relevantStyles)) {
      cssLines.push(`--theme-${key}: ${value};`)
    }
    cssLines.push(`}`)
  }
  return cssLines.join('\n')
}
