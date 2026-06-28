import { getCollection, type CollectionEntry } from 'astro:content'
import { slug } from 'github-slugger'
import { pinyin } from 'pinyin'
import type { Collation, CollationGroup } from '~/types'

type CollectionWithDate = 'posts' | 'memos'

export function tagSlug(title: string): string {
  const lower = title.trim().toLowerCase()
  const hasChinese = /[\u4e00-\u9fff]/.test(lower)
  if (!hasChinese) return slug(lower)
  const py = pinyin(lower, { style: 'normal' })
    .map((seg: string[]) => seg[0])
    .join('')
  return slug(py)
}

export async function getSortedPosts() {
  const allPosts = await getCollection('posts', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true
  })
  const sortedPosts = allPosts.sort((a, b) => {
    return a.data.published < b.data.published ? -1 : 1
  })
  return sortedPosts
}

export async function getSortedMemos() {
  const allMemos = await getCollection('memos')
  if (!allMemos || allMemos.length === 0) {
    return []
  }
  const sortedMemos = allMemos.sort((a, b) => {
    if (!a.data?.published || !b.data?.published) return 0
    return a.data.published < b.data.published ? 1 : -1
  })
  return sortedMemos
}

export abstract class BaseCollationGroup<E extends CollectionWithDate>
  implements CollationGroup<E>
{
  title: string
  url: string
  collations: Collation<E>[]

  constructor(title: string, url: string, collations: Collation<E>[]) {
    this.title = title
    this.url = url
    this.collations = collations
  }

  sortCollationsAlpha(): Collation<E>[] {
    this.collations.sort((a, b) => a.title.localeCompare(b.title))
    return this.collations
  }

  sortCollationsLargest(): Collation<E>[] {
    this.collations.sort((a, b) => b.entries.length - a.entries.length)
    return this.collations
  }

  sortCollationsMostRecent(): Collation<E>[] {
    this.collations.sort((a, b) => {
      const aDate = a.entries[a.entries.length - 1].data.published
      const bDate = b.entries[b.entries.length - 1].data.published
      return aDate < bDate ? 1 : -1
    })
    return this.collations
  }

  add(item: CollectionEntry<E>, collationTitle: string): void {
    const collationTitleSlug = tagSlug(collationTitle)
    const existing = this.collations.find(
      (i) => i.titleSlug === collationTitleSlug,
    )
    if (existing) {
      const alreadyHasItem = existing.entries.find((e) => e.id === item.id)
      if (!alreadyHasItem) {
        existing.entries.push(item)
      }
    } else {
      this.collations.push({
        title: collationTitle,
        titleSlug: collationTitleSlug,
        url: `${this.url}/${collationTitleSlug}`,
        entries: [item],
      })
    }
  }

  match(rawKey: string): Collation<E> | undefined {
    return this.collations.find((entry) => entry.title === rawKey)
  }

  matchMany(rawKeys: string[]): Collation<E>[] {
    return this.collations.filter((entry) => rawKeys.includes(entry.title))
  }
}

export class SeriesGroup extends BaseCollationGroup<'posts'> {
  private constructor(
    title: string,
    url: string,
    items: Collation<'posts'>[],
  ) {
    super(title, url, items)
  }

  static async build(
    posts?: CollectionEntry<'posts'>[],
  ): Promise<SeriesGroup> {
    const sortedPosts = posts || (await getSortedPosts())
    const seriesGroup = new SeriesGroup('Series', '/series', [])
    sortedPosts.forEach((post) => {
      const frontmatterSeries = post.data.series
      if (frontmatterSeries) {
        seriesGroup.add(post, frontmatterSeries)
      }
    })
    return seriesGroup
  }
}

export class TagsGroup extends BaseCollationGroup<'posts'> {
  private constructor(
    title: string,
    url: string,
    items: Collation<'posts'>[],
  ) {
    super(title, url, items)
  }

  static async build(
    posts?: CollectionEntry<'posts'>[],
  ): Promise<TagsGroup> {
    const sortedPosts = posts || (await getSortedPosts())
    const tagsGroup = new TagsGroup('Tags', '/tags', [])
    sortedPosts.forEach((post) => {
      const frontmatterTags = post.data.tags || []
      frontmatterTags.forEach((tag) => {
        tagsGroup.add(post, tag)
      })
    })
    return tagsGroup
  }
}

export class MemosTagsGroup extends BaseCollationGroup<'memos'> {
  private constructor(
    title: string,
    url: string,
    items: Collation<'memos'>[],
  ) {
    super(title, url, items)
  }

  static async build(
    memos?: CollectionEntry<'memos'>[],
  ): Promise<MemosTagsGroup> {
    const sortedMemos = memos || (await getSortedMemos())
    const tagsGroup = new MemosTagsGroup('Tags', '/now/tags', [])
    sortedMemos.forEach((memo) => {
      const frontmatterTags = memo.data.tags || []
      frontmatterTags.forEach((tag) => {
        tagsGroup.add(memo, tag)
      })
    })
    return tagsGroup
  }
}

export function getPostSequenceContext(
  post: CollectionEntry<'posts'>,
  posts: CollectionEntry<'posts'>[],
) {
  const index = posts.findIndex((p) => p.id === post.id)
  const prev = index > 0 ? posts[index - 1] : undefined
  const next = index < posts.length - 1 ? posts[index + 1] : undefined
  return { index, prev, next }
}
