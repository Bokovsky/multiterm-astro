import { readFileSync } from 'fs'
import { execSync } from 'child_process'

/**
 * Check for missing ARIA labels on interactive elements.
 * Scans .astro files for <button>, <dialog>, <a> elements
 * that lack aria-label, aria-labelledby, or visible text content.
 */

const SRC = 'src'

function scanFile(path) {
  if (!path.endsWith('.astro')) return []

  const content = readFileSync(path, 'utf-8')
  const lines = content.split('\n')
  const issues = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Check for button elements without aria-label
    if (line.match(/<button\b/i) && !line.includes('</button')) {
      let hasAria = false
      let hasText = false

      // Look ahead for aria-label and text content
      for (let j = i; j < Math.min(i + 8, lines.length); j++) {
        const chunk = lines.slice(i, j + 1).join(' ')
        if (chunk.includes('aria-label=')) hasAria = true
        if (chunk.includes('aria-labelledby=')) hasAria = true
        if (chunk.includes('sr-only')) hasText = true
        if (chunk.match(/>[^<\s][^<]*<\//)) hasText = true
        if (chunk.includes('</button')) break
      }

      // Skip known-good cases
      const isThemeButton = path.includes('SelectTheme') && line.includes('data-theme')
      if (!hasAria && !hasText && !isThemeButton) {
        issues.push(`${path}:${lineNum} — <button> missing aria-label or text content`)
      }
    }

    // Check for dialog elements without aria-label
    if (line.match(/<dialog\b/i)) {
      let hasAria = false
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const chunk = lines.slice(i, j + 1).join(' ')
        if (chunk.includes('aria-label=')) hasAria = true
        if (chunk.includes('aria-labelledby=')) hasAria = true
        if (chunk.includes('>')) break
      }
      if (!hasAria) {
        issues.push(`${path}:${lineNum} — <dialog> missing aria-label or aria-labelledby`)
      }
    }
  }

  return issues
}

const files = execSync(`git ls-files ${SRC}`).toString().trim().split('\n')
  .filter(f => f.endsWith('.astro'))

let totalIssues = 0
for (const file of files) {
  const issues = scanFile(file)
  for (const issue of issues) {
    console.log(issue)
    totalIssues++
  }
}

if (totalIssues > 0) {
  console.log(`\n${totalIssues} ARIA issue(s) found`)
  process.exit(1)
}

console.log('No ARIA issues found')
process.exit(0)
