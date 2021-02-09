import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import string from '../../src/factories/string.js'

const suite = createSuite('clampable (node)')

suite.before.each(context => {
  context.setup = () => string('Baleada: a toolkit for building web apps')
})

suite(`normalizes`, context => {
  const instance = context.setup(),
        value = instance.normalize()

  assert.is(value, 'Baleada: a toolkit for building web apps')
})

suite(`clip(text) clips text from a string`, context => {
  const instance = context.setup(),
        value = instance.clip('Baleada: ').normalize(),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite(`clip(regularExpression) clips regularExpression from a string`, context => {
  const instance = context.setup(),
        value = instance.clip(/^Baleada: /).normalize(),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite(`slug(...) slugs strings`, context => {
  assert.is(string('I ♥ Dogs').slug().normalize(), 'i-love-dogs')
  assert.is(string('  Déjà Vu!  ').slug().normalize(), 'deja-vu')
  assert.is(string('fooBar 123 $#%').slug().normalize(), 'foo-bar-123')
  assert.is(string('я люблю единорогов').slug().normalize(), 'ya-lyublyu-edinorogov')
})

suite(`slug(...) respects options`, context => {
  const value = string('Foo@unicorn').slug({
    customReplacements: [
      ['@', 'at']
    ]
  }).normalize()
  
  assert.is(value, 'fooatunicorn')
})

suite.run()
