/*
 * markupable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import MarkdownIt from 'markdown-it'
// METADATA: EXTERNAL markdown-it

export default function markupable (markdown, options = {}) {
  const markdownItOptions = options.markdownIt,
        markdownIt = new MarkdownIt(markdownItOptions),
        object = new String(markdown)

  object.markup = () => markupable(markdownIt.render(markdown))

  return object
}
