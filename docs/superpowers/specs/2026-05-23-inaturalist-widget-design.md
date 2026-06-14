# iNaturalist Observations Widget - Design Spec

**Date:** 2026-05-23
**Branch:** dev-inaturalist
**Status:** Design approved

## Overview

Add an iNaturalist observations widget to the blog home page, displayed below the GitHub activity calendar in the HomeBanner component. Built as a static SSG component that fetches data at build time from the iNaturalist API.

## Architecture

### Data Flow

```
build time:
  INaturalistObservations.astro
    → fetch iNaturalist API v1 (/observations?user_login=X&per_page=N&order=desc&order_by=created_at)
    → render photo grid + link footer

site.config.ts  →  home.md (inaturalist field)  →  index.astro  →  HomeBanner  →  INaturalistObservations
```

### Component Tree

```
Layout.astro
  └── index.astro
        └── HomeBanner.astro
              ├── GitHubActivityCalendar.astro (existing)
              └── INaturalistObservations.astro (new)
```

## Implementation Details

### 1. Types (`src/types.ts`)

Add `INaturalistConfig` interface and API response types:

```typescript
export interface INaturalistConfig {
  username: string
  limit: number
}

export interface INaturalistObservationPhoto {
  id: number
  url: string
  license_code: string
  attribution: string
}

export interface INaturalistObservation {
  id: number
  species_guess: string
  observed_on: string
  photos: INaturalistObservationPhoto[]
  taxon: {
    name: string
    preferred_common_name: string
  }
}

export type INaturalistApiResponse = {
  total_results: number
  results: INaturalistObservation[]
}
```

Extend `SiteConfig` with `inaturalist?: INaturalistConfig`.

### 2. Config (`src/site.config.ts`)

```typescript
inaturalist: {
  username: 'edta2na',
  limit: 10,
}
```

### 3. Content Schema (`src/content.config.ts`)

Add optional `inaturalist` field to home collection schema:

```typescript
inaturalist: z.string().optional()
```

### 4. Content (`src/content/home.md`)

Add to frontmatter:

```yaml
inaturalist: edta2na
```

### 5. Component (`src/components/INaturalistObservations.astro`)

**Props:** `username: string`, `limit: number`

**Data fetching:** Build-time fetch to iNaturalist API with 5s timeout via AbortController. On failure, returns empty and component renders nothing.

**Rendering:**

- BlockHeader with title "我的 iNaturalist 观察"
- Photo grid: 5 columns, 48px square thumbnails with `rounded-lg`, `border-1 border-transparent hover:border-accent/30` interactions
- Each thumbnail links to `https://www.inaturalist.org/observations/{id}`
- Footer: "在 iNaturalist 上查看更多" button-styled link to user's observations page

**Image optimization:** Use Astro's `<Image />` component for thumbnail optimization where possible. Use `square` (75px) thumbnails from iNaturalist CDN.

### 6. Integration (`HomeBanner.astro` + `index.astro`)

- HomeBanner: Add `inaturalistUsername?: string` prop, render widget below GitHub calendar
- index.astro: Read `homeEntry.data.inaturalist`, pass to HomeBanner

## Error Handling

- API timeout (5s) → component renders nothing
- API error response → component renders nothing
- Empty results → component renders nothing
- Graceful degradation: widget is never a hard failure for page build

## Style Consistency

All styles follow existing design system:

- `BlockHeader` component for section title
- `border-accent/10`, `border-accent/30` for borders
- `rounded-xl`, `rounded-lg` for corners
- `text-link` for links
- `button` class for action links
- `transition-colors` for hover effects
- JetBrains Mono Variable font (inherited)

## Files Changed

| File                                           | Change            |
| ---------------------------------------------- | ----------------- |
| `src/types.ts`                                 | Add types         |
| `src/site.config.ts`                           | Add config        |
| `src/content.config.ts`                        | Update schema     |
| `src/content/home.md`                          | Add field         |
| `src/components/INaturalistObservations.astro` | **New**           |
| `src/components/HomeBanner.astro`              | Add prop + widget |
| `src/pages/index.astro`                        | Pass data         |
