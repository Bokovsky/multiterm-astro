import { execSync } from 'child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const DIST = '.vercel/output/static'

const BLUE = '\x1b[34m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

function info(msg) { console.log(`\n${BLUE}▶${RESET} ${msg}`) }
function pass(msg) { console.log(`  ${GREEN}✓${RESET} ${msg}`) }

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit', shell: true })
  } catch {
    process.exit(1)
  }
}

// Step 1: Source-level static analysis
info('Static analysis (hardcoded colors, ARIA)')
run('pnpm check')
pass('Static analysis')

// Step 2: TypeScript type check (informational — pre-existing errors don't block build)
info('TypeScript type check')
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit', shell: true })
  pass('TypeScript type check')
} catch {
  console.log(`  ${BLUE}⚠${RESET} TypeScript errors found (non-blocking)`)
}

// Step 3: Build (Vercel build — produces .vercel/output/static/)
info('Build (Vercel build)')
run('npx vercel build --prod')
pass('Build')

// Step 4: Post-build checks
info('Post-build checks')

const htmlFiles = collectFiles(DIST, '.html')
if (htmlFiles.length === 0) {
  console.error(`  No .html files found in ${DIST}/`)
  process.exit(1)
}

const errors = [
  ...checkOrphanedBrackets(htmlFiles),
  ...checkInternalLinks(htmlFiles),
  ...checkTitleUniqueness(htmlFiles),
  ...checkExternalLinkRel(htmlFiles),
]

if (errors.length > 0) {
  console.error(`\n${RED}✗ ${errors.length} QA error(s) found:${RESET}`)
  for (const err of errors) {
    console.error(`  ${RED}•${RESET} ${err}`)
  }
  process.exit(1)
}

pass('Post-build checks')
console.log(`\n${GREEN}✓ All QA checks passed${RESET}`)
process.exit(0)

// --- Helper functions ---

function collectFiles(dir, ext) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...collectFiles(full, ext))
    } else if (full.endsWith(ext)) {
      results.push(full)
    }
  }
  return results
}

function buildBlockRanges(content, tagName) {
  const ranges = []
  const re = new RegExp(`<\\/?${tagName}[\\s>]`, 'gi')
  let m
  while ((m = re.exec(content)) !== null) {
    if (m[0][1] === '/') {
      if (ranges.length > 0 && ranges.at(-1).end === -1) {
        ranges.at(-1).end = m.index
      }
    } else {
      ranges.push({ start: m.index, end: -1 })
    }
  }
  return ranges
}

function inRanges(pos, ranges) {
  return ranges.some(r => pos >= r.start && pos < (r.end === -1 ? Infinity : r.end))
}

function checkOrphanedBrackets(files) {
  const errs = []
  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const scriptRanges = buildBlockRanges(content, 'script')
    const styleRanges = buildBlockRanges(content, 'style')
    const allRanges = [...scriptRanges, ...styleRanges]
    const bracketRe = /\)\s*\}/g
    let m
    while ((m = bracketRe.exec(content)) !== null) {
      if (inRanges(m.index, allRanges)) continue
      const line = content.slice(0, m.index).split('\n').length
      errs.push(`${file}:${line} — orphaned bracket )}`)
    }
  }
  return errs
}

function checkInternalLinks(files) {
  const errs = []
  // Skip resource URLs: starts with _astro/ or has a file extension
  const assetRe = /^_astro\//i
  const extRe = /\.\w+$/
  const hrefRe = /href="\/([^"]+)"/g
  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    let match
    while ((match = hrefRe.exec(content)) !== null) {
      let path = match[1].split('#')[0].split('?')[0].replace(/\/+$/, '')
      if (!path || assetRe.test(path) || extRe.test(path)) continue
      if (!existsSync(join(DIST, path + '.html')) && !existsSync(join(DIST, path, 'index.html'))) {
        errs.push(`${file} — broken link: /${path}`)
      }
    }
  }
  return errs
}

function checkTitleUniqueness(files) {
  const titles = {}
  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const m = content.match(/<title>(.+?)<\/title>/)
    if (!m) continue
    const title = m[1]
    if (!titles[title]) titles[title] = []
    titles[title].push(file)
  }
  const errs = []
  for (const [title, paths] of Object.entries(titles)) {
    if (paths.length > 1) {
      errs.push(`Duplicate title "${title}": ${paths.join(', ')}`)
    }
  }
  return errs
}

function checkExternalLinkRel(files) {
  const errs = []
  const relRe = /rel="[^"]*(?:noreferrer[^"]*noopener|noopener[^"]*noreferrer)[^"]*"/
  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const targetRe = /target="_blank"/g
    let match
    while ((match = targetRe.exec(content)) !== null) {
      const before = content.slice(0, match.index)
      const linkStart = before.lastIndexOf('<a')
      if (linkStart === -1) continue
      const after = content.slice(match.index)
      const linkEnd = after.indexOf('>')
      if (linkEnd === -1) continue
      const tag = content.slice(linkStart, match.index + linkEnd)
      if (!relRe.test(tag)) {
        const line = before.split('\n').length
        errs.push(`${file}:${line} — target="_blank" missing rel="noreferrer noopener"`)
      }
    }
  }
  return errs
}
