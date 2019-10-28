import test from 'ava'
import Markupable from '../../src/subclasses/Markupable'

test.beforeEach(t => {
  t.context.setup = (options) => new Markupable('# Baleada\n\nA **toolkit**\nfor building _web apps_.', options)
})

test('invoke() returns markup', t => {
  const instance = t.context.setup(),
        result = instance.invoke()

  t.deepEqual(result, new Markupable('<h1>Baleada</h1>\n<p>A <strong>toolkit</strong>\nfor building <em>web apps</em>.</p>\n'))
})

test('invoke() respects markdownit option', t => {
  const instance = t.context.setup({ markdownit: { breaks: true } }),
        result = instance.invoke()

  t.deepEqual(result, new Markupable('<h1>Baleada</h1>\n<p>A <strong>toolkit</strong><br>\nfor building <em>web apps</em>.</p>\n'))
})

test('invoke() returns Markupable', t => {
  const instance = t.context.setup(),
        result = instance.invoke()

  t.assert(result instanceof Markupable)
})
