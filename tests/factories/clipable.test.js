import test from 'ava'
import { clipable } from '../../lib/index.esm.js'

test.beforeEach(t => {
  t.context.setup = () => clipable('Baleada: a toolkit for building web apps')
})

test('clip(text) clips text from a string', t => {
  const instance = t.context.setup(),
        result = instance.clip('Baleada: '),
        expected = 'a toolkit for building web apps'

  t.is(`${result}`, expected)
})

test('clip(regularExpression) clips regularExpression from a string', t => {
  const instance = t.context.setup(),
        result = instance.clip(/^Baleada: /),
        expected = 'a toolkit for building web apps'

  t.is(`${result}`, expected)
})

test('clip(...) returns clipable', t => {
  const instance = t.context.setup(),
        result = instance.clip('Baleada: ')

  t.assert(typeof result.clip === 'function')
})
