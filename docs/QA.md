# QA Checklist

AI-driven quality assurance workflow for multiterm-astro.
Based on the methodology described in [antirez' "A new era for software testing"](http://antirez.com/news/168).

---

## Overview

Three layers working together:

| Layer | What | Who |
|-------|------|-----|
| **Automated** | Static analysis scripts for hardcoded colors, ARIA, template syntax | `pnpm check` + helpers |
| **Build** | Compilation, output integrity, link verification | `pnpm build` + post-build scripts |
| **Agent-driven** | Diff analysis, visual inspection, subjective UX judgment | AI agent reading this doc |

The agent orchestrates all three: read the diff, pick relevant checks, run them, inspect the result, and report.

---

## Prerequisites

```powershell
.\activate-dev.ps1           # Activate conda + nodeenv
pnpm install                 # Ensure dependencies
```

## Workflow

```
git diff dev...HEAD → identify affected files
         │
         ▼
Read QA.md → select relevant checks by file type
         │
         ▼
Run automated checks → pnpm check + template syntax
         │
         ▼
pnpm build → verify success
         │
         ▼
Post-build checks → links, RSS, title uniqueness
         │
         ▼
Agent-driven inspection → dev server, visual, UX
         │
         ▼
Report → pass / fail items
```

---

## Step 1: Diff Analysis

Run this to understand what changed:

```bash
git log dev..HEAD --oneline
git diff dev...HEAD --stat
git diff dev...HEAD --name-only | Select-String '\.(astro|ts|css|md)$'
```

Categorize changed files:

| Extension | Affects |
|-----------|---------|
| `.astro` | Template rendering, component logic, layout |
| `.ts` | Business logic, types, config, plugins |
| `.css` | Styling, theme tokens, responsive layout |
| `.md` | Content, frontmatter metadata, tags |

---

## Step 2: Automated Checks

### 2a. Static Analysis

```powershell
pnpm check
```

This runs:
- `scripts/check-hardcoded.mjs` — flags any hex/rgb color not in theme token system
- `scripts/check-aria.mjs` — flags interactive elements missing ARIA labels

**If either fails**, fix before proceeding.

### 2b. Per-File-Type Checks

| Changed | Run | Purpose |
|---------|-----|---------|
| `.astro` | `pnpm check` + manual inspection | Template syntax, scoped CSS, bracket hygiene |
| `.ts` | `npx tsc --noEmit` | Type errors, import resolution |
| `.css` | `pnpm check` | Color tokens intact, no hardcoded values |
| `.md` | RSS + link checks (Step 4) | Metadata completeness |

### 2c. Template Syntax Check

Astro's `{condition && (...)}` pattern leaves orphaned `)` or `}` when outer wrappers are removed without updating the close. These render as literal text.

After build, verify no residual template syntax in output:

```powershell
Select-String -Path "dist/**/*.html" -Pattern "\)\s*\}" | Select-Object -First 5
```

If any match outside of JavaScript (e.g. `}))` in bundled scripts is fine), fix the `.astro` source.

---

## Step 3: Build Verification

```powershell
pnpm build 2>&1 | Select-String "error|Error|fail|Fail"
```

**Pass criteria:**
- Build exits with code 0
- No lines matching `error` or `Error` in output
- Final line says `Complete!`

---

## Step 4: Content Integrity

### 4a. RSS XML

Open `dist/rss.xml` and verify:
- Each `<item>` has `<title>`, `<pubDate>`, `<description>`
- No empty `<description>` tags
- All internal links use absolute URLs (`https://blog.macondo.cc/...`)

### 4b. Internal Links

Scan all HTML files for internal hrefs and verify they resolve:

```powershell
# Quick check: grep for /tags/ routes and confirm by file existence
Get-ChildItem -Recurse -Filter "*.html" dist | Select-String -Pattern 'href="/([^"]+)"' | ForEach-Object {
  $link = $_.Matches[0].Groups[1].Value
  if (-not (Test-Path "dist/$link.html") -and -not (Test-Path "dist/$link/index.html")) {
    Write-Warning "Broken link: /$link"
  }
}
```

### 4c. Title Uniqueness

Every page should have a unique `<title>` for SEO:

```powershell
Select-String -Path "dist/**/*.html" -Pattern '<title>(.+?)</title>' |
  Group-Object { $_.Matches[0].Groups[1].Value } |
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object { Write-Warning "Duplicate title: $($_.Name)" }
```

### 4d. External Links

All `target="_blank"` links must have `rel="noreferrer noopener"`:

```powershell
Select-String -Path "dist/**/*.html" -Pattern 'target="_blank"' |
  Where-Object { $_ -notmatch 'rel="noreferrer noopener"' } |
  ForEach-Object { Write-Warning "Missing rel: $($_.Path)" }
```

---

## Step 5: Agent-Driven Visual/UX Inspection

Start the dev server and open the browser:

```powershell
Start-Process pwsh -WorkingDirectory "D:\project\blog" -ArgumentList "-NoExit", "-Command", ".\activate-dev.ps1; pnpm dev"
# Wait for port 4321, then open http://[::1]:4321
```

### 5a. Route Coverage

Visit these pages and verify each renders without errors:

| Route | Key Checks |
|-------|------------|
| `/` | Banner, GitHub calendar, iNaturalist widget |
| `/posts/` | Post list, pagination |
| `/memos/` | Memo cards, image gallery, lightbox, external link/music cards |
| `/archive/` | Timeline layout, stagger animation |
| `/tags/` | Tag list, each tag links to correct pinyin slug |
| `/rss.xml` | Valid XML, browser renders as feed |
| A random post | Article layout, TOC, series nav, addendum |
| A 404 page | Custom 404, navigation back to home |

### 5b. Responsive Layout

Check at two viewport sizes:

| Viewport | Width | How |
|----------|-------|-----|
| Mobile | 375px | Browser dev tools device emulation |
| Desktop | 1440px | Normal window |

Items to inspect:
- No horizontal scrollbar
- Text not overflowing containers
- Memo gallery grid collapses correctly (1→2→3 cols)
- Navigation hamburger appears on mobile
- Touch targets ≥ 44px

### 5c. Theme Switching

Switch through all 14 themes using the theme picker:

```javascript
// In browser console
const themes = document.querySelectorAll('[data-theme]')
themes.forEach(t => { document.documentElement.setAttribute('data-theme', t.getAttribute('data-theme')) })
```

Check:
- All text remains readable on light and dark themes
- No broken contrast (e.g. light text on light background)
- Active theme highlighted in picker
- Theme persists on page reload (localStorage)

### 5d. Memo Content

For each memo card:
- Text content renders as paragraphs, not raw HTML
- Image gallery respects source order (text→gallery→text)
- Lightbox opens on click, closes on backdrop click / Escape
- Music card shows artwork thumbnail + platform label
- External link card shows URL + title

### 5e. iNaturalist Widget

- If iNaturalist data is available: photo grid renders, click opens iNaturalist
- If API fails (simulate by disabling network): widget is absent, no console errors, build succeeds

### 5f. Subjective Quality

Ask yourself:

- Does any feature look unfinished or surprising?
- Is there inconsistent spacing or typography?
- Are any animations jarring or too slow?
- Is the navigation intuitive?
- Does the 404 page help the user recover?

---

## Step 6: Report

Log results in a structured format:

```markdown
## QA Report — <branch-name>

### Automated Checks
- [x] pnpm check (hardcoded colors, ARIA)
- [x] tsc --noEmit (if .ts changed)
- [x] Template syntax (no orphaned brackets)
- [ ] _failed item here with details_

### Build
- [x] pnpm build succeeds (N.Ns)

### Content Integrity
- [x] RSS XML valid
- [x] Internal links resolve
- [x] Title uniqueness
- [x] External links have rel

### Visual/UX
- [x] All routes render
- [x] Responsive (mobile + desktop)
- [x] All 14 themes readable
- [x] Memo cards correct
- [x] iNaturalist graceful

### Subjective
- [x] No surprising UX
- [ ] _issue here_

### Verdict
- [ ] PASS — ready to merge
- [ ] FAIL — must fix before merge
```

---

## Quick Reference

### When to Run Full QA

| Event | Full QA | Minimal QA |
|-------|---------|------------|
| New feature branch | ✓ | — |
| Content-only change (posts, memos) | — | Steps 3 + 4a |
| Dependency update | — | Step 3 |
| Style/theme change | ✓ | — |
| Component/plugin change | ✓ | — |
| Config change | ✓ | — |

### Minimal QA (for content-only changes)

```
pnpm build → verify success → verify RSS XML
```
