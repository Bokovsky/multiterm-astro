import pangu from 'pangu'
import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Text } from 'mdast'

// Patterns to protect from CJK spacing (substituted with placeholders before pangu)
const protectedPatterns = [
  /[A-Z]{2,}\s*\/\s*[A-Z]\s+\d+(?:-\d+)?/g,                                     // GB/T 535-2020, JB/T 1234
  /\d[\d.]*(?:[a-zA-Z%°]+[\d.]*)*(?:[+\-*/=×≈]\d[\d.]*(?:[a-zA-Z%°]+[\d.]*)*)+/g,  // 9.15+3.18=12.33g
]

const remarkCjkSpacing: Plugin = () => {
  return (tree) => {
    visit(tree, 'text', (node: Text) => {
      if (!node.value.trim()) return

      let text = node.value
      const placeholders: string[] = []

      for (const pattern of protectedPatterns) {
        text = text.replace(pattern, (match) => {
          placeholders.push(match)
          return `\x00PH${placeholders.length - 1}\x00`
        })
      }

      text = pangu.spacingText(text)

      text = text.replace(/\x00PH(\d+)\x00/g, (_, i) => placeholders[parseInt(i, 10)] ?? '')

      node.value = text
    })
  }
}

export default remarkCjkSpacing
