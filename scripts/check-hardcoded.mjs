import { readFileSync } from 'fs'
import { execSync } from 'child_process'

/**
 * Check for hardcoded colors outside of design tokens.
 *
 * Reads the theme token definitions first, then scans all source files
 * for hex/rgb/hsl colors that are NOT part of the token system.
 */

const SRC = 'src'

// Read theme tokens from the source of truth
function loadThemeTokens() {
  const tokens = new Set()
  const utilsRaw = readFileSync(`${SRC}/utils.ts`, 'utf-8')
  // Extract all hex colors used in theme resolution
  const hexRegex = /#[0-9a-fA-F]{6,8}/g
  let m
  while ((m = hexRegex.exec(utilsRaw)) !== null) {
    tokens.add(m[0].toLowerCase())
  }
  return tokens
}

const allowedColors = loadThemeTokens()
// Sunset/sunrise transition colors (intentional animation intermediates, not design tokens)
for (const c of ['#fffdfa', '#fccc83', '#db7a2a', '#16132b', '#0f131c', '#9fb3bf']) {
  allowedColors.add(c)
}
const cssVarColor = /var\(--theme-[\w-]+\)/

// Files to skip (configs with documented examples, comments)
const skipFiles = ['site.config.ts', 'types.ts', 'env.d.ts']

function scanFile(path) {
  let content
  try {
    content = readFileSync(path, 'utf-8')
  } catch {
    return [] // File no longer on disk (deleted but not yet committed)
  }
  const lines = content.split('\n')
  const issues = []

  // Only check .astro, .ts, .css
  if (!path.match(/\.(astro|ts|css)$/)) return issues

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Skip comment lines
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) continue

    // Find hex colors
    const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![-\w])/g
    let hm
    while ((hm = hexRegex.exec(line)) !== null) {
      const color = hm[0].toLowerCase()
      if (!allowedColors.has(color)) {
        issues.push(`${path}:${lineNum} — hardcoded color ${color}`)
      }
    }

    // Find rgb(a) colors that are NOT inside var()
    const rgbRegex = /(?<!var\()rgb\([^)]+\)/g
    let rm
    while ((rm = rgbRegex.exec(line)) !== null) {
      // Check if followed by 'transparent' or similar token pattern
      if (!line.includes('var(--theme-')) {
        issues.push(`${path}:${lineNum} — hardcoded color ${rm[0]}`)
      }
    }
  }

  return issues
}

// Get all source files
const files = execSync(`git ls-files ${SRC}`).toString().trim().split('\n')
  .filter(f => f.match(/\.(astro|ts|css)$/))
  .filter(f => !skipFiles.includes(f.replace(/^src\//, '')))

let totalIssues = 0
for (const file of files) {
  const issues = scanFile(file)
  for (const issue of issues) {
    console.log(issue)
    totalIssues++
  }
}

if (totalIssues > 0) {
  console.log(`\n${totalIssues} hardcoded color(s) found`)
  process.exit(1)
}

console.log('No hardcoded colors found')
process.exit(0)
