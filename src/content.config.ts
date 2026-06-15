import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const postsCollection = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      draft: z.boolean().optional().default(false),
      description: z.string().optional(),
      author: z.string().optional(),
      series: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      coverImage: z
        .strictObject({
          src: image(),
          alt: z.string(),
        })
        .optional(),
      toc: z.boolean().optional().default(true),
    }),
})

const homeCollection = defineCollection({
  loader: glob({ pattern: ['home.md', 'home.mdx'], base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default('My avatar'),
        })
        .optional(),
      inaturalist: z.string().optional(), // iNaturalist username for observations widget
    }),
})

const addendumCollection = defineCollection({
  loader: glob({ pattern: ['addendum.md', 'addendum.mdx'], base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default('My avatar'),
        })
        .optional(),
    }),
})

const memosCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: './src/content/memos' }),
  schema: z.object({
    title: z.string().optional(),
    published: z.coerce.date(),
    tags: z.array(z.string()).optional().default([]),
    externalUrl: z.string().url().optional(),
    externalTitle: z.string().optional(),
    musicUrl: z.string().url().optional(),
    musicTitle: z.string().optional(),
    musicArtist: z.string().optional(),
  }),
})

const aboutCollection = defineCollection({
  loader: glob({ pattern: ['about.md', 'about.mdx'], base: './src/content' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
})

const nowCollection = defineCollection({
  loader: glob({ pattern: ['now.md', 'now.mdx'], base: './src/content' }),
  schema: z.object({
    updated: z.coerce.date(),
  }),
})

export const collections = {
  posts: postsCollection,
  home: homeCollection,
  addendum: addendumCollection,
  memos: memosCollection,
  about: aboutCollection,
  now: nowCollection,
}
