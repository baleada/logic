import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import slugable from '../../src/factories/slugable.js'

const suite = createSuite('slugable (node)')

suite(`slugs strings`, context => {
  assert.is(slugable('I ♥ Dogs').slug().value, 'i-love-dogs')
  assert.is(slugable('  Déjà Vu!  ').slug().value, 'deja-vu')
  assert.is(slugable('fooBar 123 $#%').slug().value, 'foo-bar-123')
  assert.is(slugable('я люблю единорогов').slug().value, 'ya-lyublyu-edinorogov')
})

suite(`respects options`, context => {
  const value = slugable('Foo@unicorn').slug({
    customReplacements: [
      ['@', 'at']
    ]
  }).value
  
  assert.is(value, 'fooatunicorn')
})

suite.run()
