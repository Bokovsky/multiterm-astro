# AGENTS.md 鈥?Coding Guidelines for AI Agents

> **Project:** multiterm-astro 鈥?Terminal-inspired Astro blog
> **Framework:** Astro 6 + TypeScript (strict) + Tailwind CSS 4
> **Site:** <https://blog.macondo.cc>

## Environment Setup

```powershell
.\activate-dev.ps1     # Activates conda env (blog) + Node.js env (.nodeenv)
```

## Build & Quality Commands

```bash
pnpm dev               # Start dev server (use pnpm from nodeenv)
pnpm build             # Production build
pnpm postbuild         # Generate Pagefind search index
pnpm preview           # Preview production build
pnpm format            # Format with Prettier
```

No test runner or linter. Use `tsc --noEmit` / IDE for type checking.

## Browser Debugging

When the user asks to debug in browser / preview / 娴忚鍣ㄨ皟璇?

1. **Start dev server in a new terminal:**
   ```powershell
   Start-Process pwsh -WorkingDirectory "D:\project\blog" -ArgumentList "-NoExit", "-Command", ".\activate-dev.ps1; pnpm dev"
   ```
2. **Wait for the server** 鈥?poll port 4321 (IPv6 `[::1]`):
   ```powershell
   netstat -ano | Select-String "4321.*LISTENING"
   ```
3. **Open in browser** via Kimi WebBridge (`http://[::1]:4321`)
4. **Verify** with `evaluate` 鈥?check `document.title === 'Macondo'`

**Note:** The dev server binds to IPv6 `[::1]:4321`. Use `http://[::1]:4321` in the browser, not `localhost`.

## CodeGraph (Semantic Code Intelligence)

This project has **CodeGraph** initialized (`.codegraph/` directory, gitignored).
It provides MCP tools for structural code queries 鈥?significantly faster than grep/glob.

### When to Use CodeGraph

| Question | Tool |
|----------|------|
| "Where is X defined?" / "Find symbol X" | `codegraph_search` |
| "What calls Y?" / "What does Y call?" | `codegraph_callers` / `codegraph_callees` |
| "What would break if I changed Z?" | `codegraph_impact` |
| "Show me Y's source / signature" | `codegraph_node` |
| "Explain how X works" / architecture questions | `codegraph_context` 鈫?`codegraph_explore` |

### Rules

- **Answer structural questions directly** with codegraph 鈥?don't spawn sub-agents for exploration
- **Don't grep first** for symbol lookup 鈥?`codegraph_search` is faster and more accurate
- **Don't re-verify** codegraph results with grep; they come from full AST parse
- **One `codegraph_explore`** covers multiple symbols; don't loop `codegraph_node`

If the user wants to init CodeGraph in a new project: `codegraph init -i`

## Quality & Workflow Tools

This project is configured with an integrated workflow. The agent follows a structured process:

| Phase | Tool | Purpose |
|-------|------|---------|
| Understand | **CodeGraph** | Semantic code exploration (search, callers, context) |
| Plan | **Superpowers** | Brainstorming 鈫?design 鈫?implementation planning |
| Implement | **Superpowers** | Executing plans, subagent dispatch, TDD |
| Review | **Impeccable** | `audit` (technical), `critique` (UX), `polish` (final pass) |
| Enhance | **Impeccable** | Animate, colorize, typeset, layout, harden, optimize, adapt |

**Key rules:**
- Before creative work: brainstorm first (never jump to code)
- Before merging: run `audit` (technical quality check)
- Before exploration: use codegraph, not grep/glob loops
- Receiving review feedback: use `receiving-code-review` skill
- **When redesigning UI/interface: automatically invoke `impeccable` skill** for evaluation, design, implementation, and review (assess 鈫?plan 鈫?modify 鈫?audit). Never touch visual design without going through impeccable first.

## Code Style

### Formatting (Prettier)

| Rule | Value |
|------|-------|
| Semicolons | Never |
| Quotes | Single |
| Trailing commas | Always |
| Print width | 90 |
| Indent | 2 spaces |

### Imports

- Alias `~/` for all `src/` imports
- Explicit `type` imports: `import type { Foo } from '~/types'`
- `.astro` extension for component imports
- Group order: Astro core 鈫?Components 鈫?Utils 鈫?Types

```typescript
import { getCollection } from 'astro:content'
import Header from '~/components/Header.astro'
import { getSortedPosts } from '~/utils'
import type { CollectionEntry } from 'astro:content'
```

### Naming

| Category | Convention | Example |
|----------|------------|---------|
| Components | PascalCase | `Header.astro`, `INaturalistObservations.astro` |
| Plugins | camelCase | `remark-reading-time.ts` |
| Pages | lowercase | `[slug].astro`, `[...page].astro` |
| Icons | kebab-case | `chevrons-right.svg` |
| Types/Interfaces | PascalCase | `interface Props {}`, `type NavLink = {}` |

### Astro Component Template

```astro
---
import type { CollectionEntry } from 'astro:content'

interface Props {
  title: string
  posts: CollectionEntry<'posts'>[]
}

const { title, posts } = Astro.props
---

<section>
  <slot />
</section>
```

### Patterns

- **Optional chaining** for nullable config: `siteConfig.inaturalist?.limit`
- **Nullish coalescing** for defaults: `post.data.description ?? siteConfig.description`
- **SSG data fetching** (GitHub Calendar, iNaturalist): build-time `fetch()` in Astro frontmatter with `AbortController` timeout. On failure, render nothing 鈥?never block the build
- **Configuration-driven features**: Add config to `site.config.ts` 鈫?types in `types.ts` 鈫?consume in components. Use `siteConfig` for site-wide defaults, content frontmatter for per-page overrides
- **Error boundaries**: Fatal errors in plugins (`throw`), graceful degradation in components (empty render)

## Content Collections

Defined in `src/content.config.ts` with Zod schemas:

| Collection | Path | Key Fields |
|------------|------|------------|
| `posts` | `src/content/posts/` | `title`, `published`, `description`, `tags`, `series`, `draft` |
| `memos` | `src/content/memos/` | `published`, `tags` |
| `home` | `src/content/home.md` | `avatarImage`, `githubCalendar`, `inaturalist` |
| `addendum` | `src/content/addendum.md` | `avatarImage` |

**When modifying `content.config.ts`**, restart dev server. **When adding new content fields**, update types in `types.ts` first, then schema, then consumers.

## Component Catalog

Key components and their responsibilities:

| Component | Purpose |
|-----------|---------|
| `Layout.astro` | Base layout: meta tags, OG, JSON-LD, theme CSS vars, header/footer |
| `MarkdownLayout.astro` | Article layout: TOC, breadcrumb, post info, series nav, addendum |
| `HomeBanner.astro` | Home avatar + intro + iNaturalist widget |
| `INaturalistObservations.astro` | Build-time fetch from iNaturalist API, renders photo grid |
| `BlockHeader.astro` | Section title (`text-accent`, 1.6rem) + accent separator line |
| `PostPreview.astro` | Article card: title, date, reading time, description, tags, read link |
| `MemoPreview.astro` | Short memo card |
| `Search.astro` | Pagefind-powered search dialog (client-side, only in production) |
| `SelectTheme.astro` | Theme picker dropdown |
| `Pagination.astro` | Prev/next page navigation |
| `TableOfContents.astro` | Auto-generated heading hierarchy |
| `Tags.astro` / `TagsSection.astro` / `TagFilter.astro` | Tag display variants |
| `SeriesSection.astro` | Post series navigation |

## Plugins

| Plugin | Type | Purpose |
|--------|------|---------|
| `remark-reading-time` | Remark | Adds `minutesRead` to frontmatter |
| `remark-description` | Remark | Extracts first paragraph as description |
| `remark-admonitions` | Remark | `:::note` / `:::warning` etc. callout blocks |
| `remark-character-dialogue` | Remark | Character speech bubbles with images |
| `remark-gemoji` | Remark | `:smile:` 鈫?emoji |
| `remark-unknown-directives` | Remark | Graceful fallback for unsupported directives |
| `rehype-title-figure` | Rehype | Wraps image titles in `<figure>` |
| `rehype-pixelated` | Rehype | Adds `data-pixelated` to flagged images |
| `rehype-cdn-image` | Rehype | CDN image resolution (adds lazy loading for CDN images) |
| `remark-math` + `rehype-katex` | Both | LaTeX math rendering |

Plugins export default function, placed in `src/plugins/`, registered in `astro.config.mjs`.

### Markdown Pipeline

The same article flows through three export targets, each with a different plugin combination:

```
Markdown Source
  鈹?  鈹溾攢 Remark Phase
  鈹?  鈹溾攢鈹€ remark-reading-time     鈫?Web RSS
  鈹?  鈹溾攢鈹€ remark-description      鈫?Web RSS
  鈹?  鈹溾攢鈹€ remark-directive        鈫?Web RSS
  鈹?  鈹溾攢鈹€ remark-admonitions      鈫?Web RSS
  鈹?  鈹溾攢鈹€ remark-character-dialogue 鈫?Web
  鈹?  鈹溾攢鈹€ remark-unknown-directives 鈫?Web
  鈹?  鈹溾攢鈹€ remark-gemoji           鈫?Web RSS
  鈹?  鈹斺攢鈹€ remark-math             鈫?Web RSS
  鈹?  鈹溾攢 Rehype Phase
  鈹?  鈹溾攢鈹€ rehype-heading-ids      鈫?Web RSS
  鈹?  鈹溾攢鈹€ rehype-autolink-headings 鈫?Web RSS
  鈹?  鈹溾攢鈹€ rehype-title-figure     鈫?Web
  鈹?  鈹溾攢鈹€ rehype-external-links   鈫?Web RSS
  鈹?  鈹溾攢鈹€ rehype-unwrap-images    鈫?Web RSS
  鈹?  鈹溾攢鈹€ rehype-pixelated        鈫?Web
  鈹?  鈹溾攢鈹€ rehype-cdn-image        鈫?Web (auto lazy load CDN images)
  鈹?  鈹斺攢鈹€ rehype-katex            鈫?Web RSS
  鈹?  鈹斺攢 Exports
      鈹溾攢鈹€ Web HTML (all plugins)
      鈹溾攢鈹€ RSS XML (remarkReadingTime + basic markdown-it rendering)
      鈹斺攢鈹€ OG Social Cards (plain text, satori rendering)
```

**Rules**:
- Web uses all plugins registered in `astro.config.mjs`
- RSS manually calls `MarkdownIt` in `rss.xml.ts`, receiving only basic Markdown rendering
- OG cards render only the article title in `social-cards/[slug].png.ts`, bypassing the plugin pipeline
- When adding new plugins, verify whether they affect RSS and OG exports

## File Organization

```
src/
鈹溾攢鈹€ components/         # Reusable Astro components (27 files)
鈹溾攢鈹€ content/            # Markdown: posts/, memos/, home.md, addendum.md
鈹溾攢鈹€ layouts/            # Layout.astro, MarkdownLayout.astro
鈹溾攢鈹€ pages/              # File-based routes + RSS + social cards
鈹溾攢鈹€ plugins/            # Remark/Rehype plugins
鈹溾攢鈹€ styles/             # global.css (Tailwind + theme vars + prose)
鈹溾攢鈹€ icons/              # SVG icons (kebab-case)
鈹溾攢鈹€ templates/          # post-template.md, memo-template.md
鈹溾攢鈹€ types.ts            # All TypeScript types
鈹溾攢鈹€ utils.ts            # Sorting, collation groups, theme resolution
鈹斺攢鈹€ site.config.ts      # Central config: site meta, nav, themes, inaturalist
docs/                   # Plans, specs, QA docs (gitignored from GitHub)
```

**All plans, design docs, and specs go into `docs/`**, not `dev/`. The `dev/` directory is for analysis scripts only.

## Theming

- **Mode:** `select` (user-chosen from 14 bundled themes)
- **Default:** `vitesse-dark`
- **CSS variables** per-theme generated in `Layout.astro` from `resolveThemeColorStyles()`
- **Theme keys** defined in `themeKeys` array (`src/types.ts:76`), mapped to TextMate scopes in `src/utils.ts:48`
- **Overrides** via `site.config.ts` `themes.overrides` 鈥?map any theme key to a hex color or another theme key
- **Color tokens**: `foreground`, `background`, `accent`, `heading1-6`, `link`, `list`, `separator`, `note`, `tip`, `important`, `caution`, `warning`, and terminal ANSI colors

## Branch Strategy

| Branch | Purpose | Rules |
|--------|---------|-------|
| `main` | Upstream sync | **Never commit directly** |
| `dev` | Main development | All features merge here |
| `dev-*` | Feature branches | Create from `dev`, merge after user approval |

### Workflow

```bash
git checkout -b dev-<feature> dev    # Start feature
# ... develop, test ...
npm run format && npx astro build    # Verify
```

**鈿狅笍 Critical Rule:** After code completion and verification, **always ask for user approval before any git commit or merge**. Never auto-commit or auto-merge without explicit user consent.

```bash
# Only after user says "commit", "鎻愪氦", "merge", "骞跺叆" etc.:
git commit -m "feat: description"
git checkout dev && git merge dev-<feature>
```

### Merge Approval

**All branch merges and commits require explicit user approval.** Before committing or merging any changes, you must present the diff summary and ask for the user's consent. This applies to:
- `git commit` 鈥?never auto-commit
- `git merge` 鈥?never auto-merge
- `git push` 鈥?never auto-push

This workflow is already established and has been [codified in this project's chart](https://blog.macondo.cc).

## Pre-merge QA

AI-driven QA workflow based on [antirez' methodology](http://antirez.com/news/168).
Three layers, orchestrated by the agent before every merge:

| Layer | What | Who |
|-------|------|-----|
| **Automated** | Static analysis (hardcoded colors, ARIA) | `pnpm check` |
| **Build** | Compilation + output integrity | `pnpm build` + post-build steps |
| **Agent-driven** | Diff analysis, visual inspection, subjective UX | AI agent |

Full checklist is maintained in [`docs/QA.md`](./docs/QA.md).

### Workflow

```
git diff dev...HEAD 鈫?identify affected files by type (.astro/.ts/.css/.md)
       鈹?       鈻?Run automated checks 鈫?pnpm check + tsc --noEmit (if .ts changed)
       鈹?       鈻?pnpm build 鈫?verify success (exit 0, no "error"/"Error" in output)
       鈹?       鈻?Post-build: orphaned brackets, internal links, title uniqueness, external link rel
       鈹?       鈻?Agent inspection: route coverage, responsive, 14 themes, subjective UX
       鈹?       鈻?Report 鈫?structured pass/fail verdict
```

### Automated Checks

```powershell
pnpm check            # scripts/check-hardcoded.mjs + scripts/check-aria.mjs
npx tsc --noEmit      # if .ts files changed
```

After build, verify no orphaned template brackets (common Astro pitfall):
```powershell
Select-String -Path "dist/**/*.html" -Pattern "\)\s*\}" | Select-Object -First 5
```
Matches inside JavaScript (e.g. `}))` in bundled scripts) are fine. Matches in HTML = fix source.

### Post-Build Integrity

```powershell
# Internal links: verify all href targets exist
Get-ChildItem -Recurse -Filter "*.html" dist | Select-String -Pattern 'href="/([^"]+)"' | ForEach-Object {
  $link = $_.Matches[0].Groups[1].Value
  if (-not (Test-Path "dist/$link.html") -and -not (Test-Path "dist/$link/index.html")) {
    Write-Warning "Broken link: /$link"
  }
}

# Title uniqueness
Select-String -Path "dist/**/*.html" -Pattern '<title>(.+?)</title>' |
  Group-Object { $_.Matches[0].Groups[1].Value } |
  Where-Object { $_.Count -gt 1 }

# External link safety
Select-String -Path "dist/**/*.html" -Pattern 'target="_blank"' |
  Where-Object { $_ -notmatch 'rel="noreferrer noopener"' }
```

### Agent Visual Inspection

Open dev server (`http://[::1]:4321`) and verify:

| Route | Key Checks |
|-------|------------|
| `/` | Banner, GitHub calendar, iNaturalist widget |
| `/memos/` | Cards, gallery grid, lightbox, music/external link cards |
| `/archive/` | Timeline layout, stagger animation |
| `/tags/` | All tag pinyin slugs resolve 200 |
| A random post | Article layout, TOC, series nav, addendum |

Also: switch all 14 themes (no broken contrast), check mobile 375px / desktop 1440px (no overflow), verify iNaturalist fails gracefully (empty render, no build error).

### When to Run

| Event | Scope |
|-------|-------|
| New feature branch | Full QA (automated 鈫?build 鈫?post-build 鈫?visual) |
| Content-only change | Build + RSS XML metadata check only |
| Style/theme change | Full QA |
| Component/plugin change | Full QA |

## Troubleshooting & Lessons Learned

### Common Pitfalls

| # | Scenario | Symptom | Root Cause | Fix |
|---|----------|---------|------------|-----|
| 1 | Dev server | `localhost:4321` connection refused | Astro dev binds IPv6 `[::1]:4321` | Use `http://[::1]:4321` |
| 2 | Vercel deploy | `files should NOT have more than 15000 items` | node_modules uploaded | Ensure `.vercelignore` excludes `node_modules`, `.git`, `.codegraph` etc. |
| 3 | Vercel deploy | ~9 min deploy time | `.vercelignore` excludes `dist/`, Vercel rebuilds from source | Use `vercel build --prod` + `vercel deploy --prebuilt` |
| 4 | satori social cards | `ENOENT: @expo-google-fonts/jetbrains-mono/...` | satori requires `.ttf`, fontsource only has `.woff2` | Keep `@expo-google-fonts/jetbrains-mono` in deps |
| 5 | pnpm install | `ERR_PNPM_UNEXPECTED_STORE` store mismatch | pnpm major version upgrade | Use `.\nodeenv\Scripts\pnpm.cmd` (project's pnpm), not global |
| 6 | Scoped CSS | Component `<style>` not affecting rendered markdown | Astro scoped styles don't penetrate `set:html` content | Use `<style is:global>` with high-specificity selectors |
| 7 | CSS specificity | `.memo-content p` overrides not winning vs `.prose p` | `.prose p` has equal specificity but appears later | Use `.memo-content.prose p` (two-class selector) |
| 8 | tsconfig errors | `dev/themeData.ts: cannot find module` | `include: ["**/*"]` too broad | Use `include: [".astro/types.d.ts", "src/**/*"]` |
| 9 | tsconfig warning | `baseUrl is deprecated in TS 7.0` | TS 5.9+ deprecation | Add `"ignoreDeprecations": "6.0"` |
| 10 | Markdown images | Text and images rendered separately | Naive image extraction loses source order | Segment-based parsing: interleave text blocks and image groups |
| 11 | `article img` CSS | Gallery/music card images get unexpected border and rounding | `global.css:108` `article img` rule applies to ALL images inside `<article>` | Override with `.not-prose img, .memo-card img` using `!important` |
| 12 | Chinese tag paths | 404 on Vercel for Chinese-character tag URLs | Vercel URL encoding mismatch with route generation | Use `tagSlug()` (pinyin) in `utils.ts` for all tag path generation |
| 13 | Orphaned brackets | Literal `)}` rendered as visible text in HTML | Removed `{condition && (...)}` opening but not its closing `)}` | After template edit, `pnpm build` then grep `)\s*\}` in dist HTML |
| 14 | CDN images missing lazy loading | CDN images bypass Astro's built-in image optimization | No `loading="lazy"` applied to external CDN URLs | `rehype-cdn-image.ts` plugin auto-applies `loading="lazy" decoding="async"` |

### Development Patterns

**SSG Data Fetching (GitHub, iNaturalist, external links):**
```typescript
try {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  const response = await fetch(url, { signal: controller.signal })
  clearTimeout(timeout)
  // process data
} catch {
  // graceful degradation: render nothing, don't block build
}
```

**Configuration-Driven Features:**
```
site.config.ts 鈫?types.ts 鈫?content.config.ts (if content) 鈫?component consumer
```

**CSS Global Overrides for Prose Overrides:**
```css
/* Use .component.prose to override default prose spacing */
.component.prose p { margin: 0 0 0.5rem 0; }
.component.prose li { margin: 0; }
```

**Astro Image Component:**
```astro
<Image src={data.src} alt={data.alt} widths={[80]} height={40} width={40} />
```
Always use `Image` from `astro:assets` for build-time optimization. Raw `<img>` in markdown content bypasses optimization.

**CDN Image Abstraction:**
```typescript
// src/cdn.ts centralizes CDN domain config
// rehype-cdn-image.ts plugin auto-applies loading="lazy" decoding="async"
```
Add new CDN sources in `src/cdn.ts`, not scattered across components. The plugin handles lazy loading automatically.

**Music Metadata Detection:**
```typescript
// src/music-metadata.ts 鈥?two-step fallback:
// 1. Parse iTunes URL for song ID (?i=SONG_ID)
// 2. Call itunes.apple.com/lookup?id=SONG_ID for artwork + artist
```
Used by `MusicCard.astro`. Never embed Apple Music iframes 鈥?use link cards with metadata.

**Dialog/Lightbox Pattern:**
```typescript
// Shared pattern for search, theme picker, image lightbox:
dialog.showModal()
document.body.classList.add('overflow-hidden')  // lock scroll
// backdrop:bg-background/80 on dialog element
// Escape closes natively; click-outside via window click handler
```

**Edit Recovery Strategy:**
When an edit accidentally removes surrounding code:
1. `git diff` to see exact changes
2. Identify lost structures (conditionals, closing brackets, template wrappers)
3. Restore from the old code
4. `pnpm build` to verify 鈥?don't rely on visual review alone

### Git Remote Strategy

| Remote | URL | Visibility | Push Command |
|--------|-----|------------|-------------|
| origin | `github.com/Bokovsky/multiterm-astro` (fork) | Public | `git push origin dev` |
| homelab | `192.168.31.11:3309/homelab/blog` (LAN) | Private | `.\forge.ps1` |

**Content separation**: Personal content (`src/content/posts/`, `src/content/memos/`) is gitignored on GitHub; only synced to homelab via `forge.ps1`. Vercel auto-deploy is disabled via `vercel.json`.

### Homelab Sync (forge)

```powershell
.\forge.ps1    # Creates temp branch 鈫?force-adds gitignored content 鈫?pushes to homelab dev
```

`forge.ps1` pushes all personal content (posts, memos, avatar, about, docs) to `homelab/dev` while keeping GitHub `origin/dev` skeleton-only.

### Vercel Deploy Pipeline

```
dev.ps1:
  node scripts/qa.mjs    鈫?source checks + Vercel build + post-build checks (single pass)
  vercel deploy --prebuilt 鈫?upload pre-built output (624KB, no remote build)
```

No duplicate builds 鈥?QA inspects `.vercel/output/static/` (same output deployed to production).

- [ ] Responsive: mobile and desktop layouts verified
- [ ] External links: `target="_blank" rel="noreferrer noopener"`
