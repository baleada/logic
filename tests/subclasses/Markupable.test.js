import test from 'ava'
import Markupable from '../../src/subclasses/Markupable'

test.beforeEach(t => {
  t.context.setup = (options) => new Markupable('# Baleada\n\nA **toolkit**\nfor building _web apps_.', options)
})

test('markup() returns markup', t => {
  const instance = t.context.setup(),
        result = instance.markup()

  t.deepEqual(result, new Markupable('<h1>Baleada</h1>\n<p>A <strong>toolkit</strong>\nfor building <em>web apps</em>.</p>\n'))
})

test('markup() respects markdownit option', t => {
  const instance = t.context.setup({ markdownit: { breaks: true } }),
        result = instance.markup()

  t.deepEqual(result, new Markupable('<h1>Baleada</h1>\n<p>A <strong>toolkit</strong><br>\nfor building <em>web apps</em>.</p>\n'))
})

test('markup() returns Markupable', t => {
  const instance = t.context.setup(),
        result = instance.markup()

  t.assert(result instanceof Markupable)
})
