interface CdnConfig {
  /** CDN origin URL */
  origin: string
  /** Whether to generate responsive srcset */
  responsive?: boolean
}

const cdnConfigs: Record<string, CdnConfig> = {
  'pic.macondo.cc': {
    origin: 'https://pic.macondo.cc',
    responsive: false,
  },
}

export function resolveImageUrl(src: string): {
  url: string
  isCdn: boolean
} {
  try {
    const u = new URL(src)
    const config = cdnConfigs[u.hostname]
    if (config) {
      return { url: src, isCdn: true }
    }
  } catch {
    // relative path, leave as-is
  }
  return { url: src, isCdn: false }
}


