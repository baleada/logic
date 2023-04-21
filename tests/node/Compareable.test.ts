import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Compareable } from '../../src/classes/Compareable'

const suite = createSuite('Compareable')

suite.before.each(context => {
  context.setup = (options = {}) => new Compareable(
    'Baleada: a toolkit for building web apps',
    options
  )
})

suite('stores the string', context => {
  const instance = context.setup()

  assert.is(instance.string, 'Baleada: a toolkit for building web apps')
})

suite('assignment sets the string', context => {
  const instance = context.setup()
  instance.string = 'Baleada'

  assert.is(instance.string, 'Baleada')
})

suite('setString sets the string', context => {
  const instance = context.setup()
  instance.setString('Baleada')

  assert.is(instance.string, 'Baleada')
})


// COLLATOR
suite('stores collator', context => {
  const instance = context.setup()

  assert.instance(instance.collator, Intl.Collator)
})

suite('reuses cached collator when locales and options are the same', context => {
  const instance1 = context.setup(),
        instance2 = context.setup(),
        instance3 = context.setup({ locales: ['en-US'], options: { sensitivity: 'base' } })

  assert.ok(instance1.collator === instance2.collator)
  assert.not(instance1.collator === instance3.collator)
})


// COMPARE + RESULT
suite('compare(b) updates comparison', context => {
  const instance = context.setup()

  instance.string = 'a'
  instance.compare('b')

  assert.is(instance.comparison, -1)
})


// STATUS
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite('status is "compared" after compare(...) is called at least once', context => {
  const instance = context.setup()

  instance.compare('Baleada')

  assert.is(instance.status, 'compared')
})


// CHAINING
suite('can chain its public methods', context => {
  const instance = context.setup(),
        chained = instance
          .setString('Baleada: a toolkit')
          .compare('Baleada: a toolkit for building web apps')

  assert.ok(chained instanceof Compareable)
})

suite.run()
