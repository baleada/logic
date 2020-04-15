import test from 'ava'
import markupable from '../../src/factories/markupable'
import MarkdownItLinkAttributes from 'markdown-it-link-attributes'

test.beforeEach(t => {
  t.context.setup = (options) => markupable('# Baleada\n\nA **toolkit**\nfor [building](/) _web apps_.', options)
})

test('markup() returns markup', t => {
  const instance = t.context.setup(),
        result = `${instance.markup()}`

  t.is(result, '<h1>Baleada</h1>\n<p>A <strong>toolkit</strong>\nfor <a href="/">building</a> <em>web apps</em>.</p>\n')
})

test('markup() respects markdownIt options', t => {
  const instance = t.context.setup({ breaks: true }),
        result = `${instance.markup()}`

  t.is(result, '<h1>Baleada</h1>\n<p>A <strong>toolkit</strong><br>\nfor <a href="/">building</a> <em>web apps</em>.</p>\n')
})

test('markup() respects plugins', t => {
  const instance = t.context.setup({
          breaks: true,
          plugins: [
            [MarkdownItLinkAttributes, { attrs: { rel: 'noopener' } }]
          ]
        }),
        result = `${instance.markup()}`

  t.is(result, '<h1>Baleada</h1>\n<p>A <strong>toolkit</strong><br>\nfor <a href="/" rel="noopener">building</a> <em>web apps</em>.</p>\n')
})

test('markup() returns markupable', t => {
  const instance = t.context.setup(),
        result = instance.markup()

  t.assert(typeof result.markup === 'function')
})
