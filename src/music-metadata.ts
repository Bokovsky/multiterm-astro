function extractAppleSongId(url: string): string | undefined {
  // `?i=SONG_ID` (most common for shared songs)
  const query = new URL(url).searchParams.get('i')
  if (query) return query
  // /song/slug/ID — last path segment
  const match = url.match(/\/song\/[^/]+\/(\d+)/)
  return match?.[1]
}

export async function fetchMusicMetadata(url: string): Promise<{
  title: string
  artist?: string
  artworkUrl?: string
}> {
  // Apple Music → use iTunes public API
  if (url.includes('music.apple.com')) {
    const songId = extractAppleSongId(url)
    if (!songId) return { title: 'Apple Music' }
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(
        `https://itunes.apple.com/lookup?id=${songId}`,
        { signal: controller.signal },
      )
      clearTimeout(timeout)
      if (res.ok) {
        const data = await res.json()
        const track = data.results?.[0]
        if (track) {
          return {
            title: track.trackName || '未知歌曲',
            artist: track.artistName,
            artworkUrl: track.artworkUrl100?.replace(
              '100x100',
              '600x600',
            ),
          }
        }
      }
    } catch {
      // fallback to slug below
    }
    // Fallback: extract title from URL slug
    const slug = url.match(/\/song\/([^/]+?)(?:\/\d+)?(?:\?|$)/)
    const title = slug
      ? slug[1]
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Apple Music'
    return { title }
  }

  // Other platforms: fetch page and parse <title>
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) return { title: '未知歌曲' }
    const html = await response.text()

    const ogMatch = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    )
    if (ogMatch) return parseMusicTitle(ogMatch[1], url)

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) return parseMusicTitle(titleMatch[1], url)

    return { title: '未知歌曲' }
  } catch {
    return { title: '未知歌曲' }
  }
}

function detectPlatform(url: string): string {
  if (url.includes('music.163.com')) return 'netease'
  if (url.includes('y.qq.com')) return 'qqmusic'
  if (url.includes('music.apple.com')) return 'applemusic'
  if (url.includes('bilibili.com') || url.includes('b23.tv')) return 'bilibili'
  return 'unknown'
}

function parseMusicTitle(
  pageTitle: string,
  url: string,
): { title: string; artist?: string } {
  const safe = pageTitle.replace(/\s+/g, ' ').trim()
  switch (detectPlatform(url)) {
    case 'netease': {
      const parts = safe.split(' - ').filter(Boolean)
      if (parts.length >= 3) return { title: parts[0], artist: parts[1] }
      return { title: safe }
    }
    case 'qqmusic': {
      const parts = safe.split(' - ').filter(Boolean)
      if (parts.length >= 2) return { title: parts[0], artist: parts[1] }
      return { title: safe }
    }
    case 'bilibili': {
      const parts = safe.split('_').filter(Boolean)
      if (parts.length >= 2) return { title: parts[0] }
      return { title: safe }
    }
    default:
      return { title: safe }
  }
}
