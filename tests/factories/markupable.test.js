import test from 'ava'
import markupable from '../../src/factories/markupable'

test.beforeEach(t => {
  t.context.setup = (options) => markupable('# Baleada\n\nA **toolkit**\nfor building _web apps_.', options)
})

test('markup() returns markup', t => {
  const instance = t.context.setup(),
        result = `${instance.markup()}`

  t.is(result, '<h1>Baleada</h1>\n<p>A <strong>toolkit</strong>\nfor building <em>web apps</em>.</p>\n')
})

test('markup() respects markdownIt option', t => {
  const instance = t.context.setup({ markdownIt: { breaks: true } }),
        result = `${instance.markup()}`

  t.is(result, '<h1>Baleada</h1>\n<p>A <strong>toolkit</strong><br>\nfor building <em>web apps</em>.</p>\n')
})

test('markup() returns markupable', t => {
  const instance = t.context.setup(),
        result = instance.markup()

  t.assert(typeof result.markup === 'function')
})
