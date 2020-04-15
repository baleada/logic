/*
 * markupable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import MarkdownIt from 'markdown-it'
// METADATA: EXTERNAL markdown-it

import is from '../util/is'

export default function markupable (markdown, options = {}) {
  const markdownItOptions = (({ plugins, ...rest }) => rest)(options),
        markdownItPlugins = options.plugins || [],
        markdownIt = new MarkdownIt(markdownItOptions)

  // Resolve Function and [Function, Param1[, Param2, ...]] into { plugin: Function, params: Array }
  // Then use each plugin
  markdownItPlugins
    .map(plugin => {
      return (is.function(plugin) && { plugin, params: [] }) ||
        (is.array(plugin) && { plugin: plugin[0], params: plugin.slice(1) }) ||
        {}
    })
    .forEach(({ plugin, params }) => {
      markdownIt.use(plugin, ...params)
    })

  const object = new String(markdown)
  object.markup = () => markupable(markdownIt.render(markdown), options)

  return object
}
