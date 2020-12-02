import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { clipable } from '../../lib/index.js'

const suite = createSuite('clipable (node)')

suite.before.each(context => {
  context.setup = () => clipable('Baleada: a toolkit for building web apps')
})

suite('clip(text) clips text from a string', context => {
  const instance = context.setup(),
        result = instance.clip('Baleada: '),
        expected = 'a toolkit for building web apps'

  assert.is(`${result}`, expected)
})

suite('clip(regularExpression) clips regularExpression from a string', context => {
  const instance = context.setup(),
        result = instance.clip(/^Baleada: /),
        expected = 'a toolkit for building web apps'

  assert.is(`${result}`, expected)
})

suite('clip(...) returns clipable', context => {
  const instance = context.setup(),
        result = instance.clip('Baleada: ')

  assert.ok(typeof result.clip === 'function')
})

suite.run()
