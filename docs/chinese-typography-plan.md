# Chinese Typography Enhancement Plan

## Overview

Improve Chinese text readability on the blog by addressing three issues:

1. **CJK+Latin spacing** — auto-insert space between Chinese and English/digits/symbols
2. **Punctuation/line-breaking** — CSS for hanging punctuation, line-break rules
3. **First-line indent** — `text-indent: 2em` for prose paragraphs

---

## Phase 1: Build-time Spacing (remark-cjk-spacing)

### File: `src/plugins/remark-cjk-spacing.ts`

```typescript
import pangu from 'pangu'
import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Text } from 'mdast'

const remarkCjkSpacing: Plugin = () => {
  return (tree) => {
    visit(tree, 'text', (node: Text) => {
      if (node.value.trim()) {
        node.value = pangu.spacingText(node.value)
      }
    })
  }
}

export default remarkCjkSpacing
```

**Why using `text` nodes only is safe:**
- `inlineCode` nodes → not visited by `visit(tree, 'text')`
- `code` nodes (fenced code blocks) → not visited
- `link` / `image` alt text → these are properties on their respective nodes, not `text` children
- Math nodes → not `text` nodes
- Heading anchor text → rendered as HTML, not affected

### Dependencies

- `pnpm add pangu` (7.2.1, ~50KB, pure ESM)

### Registration

In `astro.config.mjs`, add to `remarkPlugins` array, placed before description/reading-time:

```js
remarkPlugins: [
  remarkCjkSpacing,
  [remarkDescription, { maxChars: 200 }],
  remarkReadingTime,
  ...
]
```

### What it does (per text node)

| Before | After |
|--------|-------|
| `中文English混排` | `中文 English 混排` |
| `测试123数字` | `测试 123 数字` |
| `Hello世界` | `Hello 世界` |
| `版本v2.0发布` | `版本 v2.0 发布` |
| `` `code`中文 `` | `` `code` 中文 `` (outside inlineCode) |
| 代码块内 | 不变（不访问 code 节点） |

---

## Phase 2: CSS Progressive Enhancement

### File: `src/styles/global.css`

Add to `.prose` block:

```css
.prose {
  /* existing: @apply text-lg/7 */
  
  text-indent: 2em;                    /* 段落首行缩进两字符 */
  hanging-punctuation: first last;     /* 标点悬挂（支持有限，渐进增强）*/
  line-break: strict;                  /* 避头尾严格规则 */
}
```

Also add under the existing `p, ul, ol, ...` block:

```css
p { text-indent: 2em; }
```

To reset indent on first paragraph inside blockquotes/admonitions (already handled):

```css
blockquote p:first-child { text-indent: 0; }
aside p:first-child { text-indent: 0; }
```

### Modern CSS (for future browsers)

```css
/* Chrome 123+, Safari TP — auto spacing CJK+Latin */
@supports (text-autospace: normal) {
  .prose { text-autospace: normal; }
}

/* 标点压缩（需要 LXGW WenKai 支持 halt 特性）*/
.prose {
  font-feature-settings: "halt" on;
  font-variant-east-asian: proportional-width;
}
```

---

## Phase 3: MPE style.less (VS Code preview)

Update `C:\Users\Lin\.crossnote\style.less`:

```less
p { text-indent: 2em; margin: 0.5em 0; }
```

(Already done in the last edit — just needs verification)

---

## Verification

```powershell
pnpm build
# Check dist HTML for spacing in Chinese text
Select-String -Path "dist/**/*.html" -Pattern "中文\s+English|\s+测试" | Select-Object -First 5
# Visual: pnpm dev and check prose page
```

---

## Risk & Edge Cases

| Risk | Mitigation |
|------|-----------|
| pangu spacing inside `title`/`description` frontmatter | Not affected — frontmatter fields are consumed as string props, not passed through remark |
| Double-spacing on already-spaced text | `pangu.spacingText()` is idempotent — won't insert extra spaces |
| First-line indent in lists | `ul li`, `ol li` don't inherit `p` text-indent — only `<p>` in prose gets it |
| pangu destroys Markdown syntax | It processes AST text nodes, not raw Markdown — already parsed |
