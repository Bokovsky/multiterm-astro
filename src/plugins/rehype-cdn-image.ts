import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'hast'
import { resolveImageUrl } from '../cdn'

const plugin: Plugin<[], Root> = () => {
  return function transformer(tree) {
    visit(tree, 'element', (el) => {
      if (el.tagName === 'img' && el.properties) {
        const src = el.properties.src
        if (typeof src === 'string') {
          const { url, isCdn } = resolveImageUrl(src)
          if (isCdn) {
            el.properties.src = url
            el.properties.loading = 'lazy'
            el.properties.decoding = 'async'
          }
        }
      }
    })
  }
}

export default plugin
