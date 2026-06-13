import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Text, Parent } from 'mdast'

const remarkChemicalSubscript: Plugin = () => {
  return (tree) => {
    visit(tree, 'text', (node: Text, index: number | null, parent: Parent | null) => {
      if (!node.value.trim() || parent === null || index === null) return

      const parts: (Text | { type: 'html'; value: string })[] = []
      let lastIndex = 0
      const re = /([A-Z][a-z]{0,2}|[)\]\]\}])_(\d+)/g
      let m: RegExpExecArray | null

      while ((m = re.exec(node.value)) !== null) {
        if (m.index > lastIndex) {
          parts.push({ type: 'text', value: node.value.slice(lastIndex, m.index) })
        }
        parts.push({ type: 'text', value: m[1] })
        parts.push({ type: 'html', value: `<sub>${m[2]}</sub>` })
        lastIndex = m.index + m[0].length
      }

      if (parts.length === 0) return

      if (lastIndex < node.value.length) {
        parts.push({ type: 'text', value: node.value.slice(lastIndex) })
      }

      parent.children.splice(index, 1, ...parts)
    })
  }
}

export default remarkChemicalSubscript
