import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Resolveable } from '../../lib/index.js'

const suite = createSuite('Resolveable (node)')

const responseStub = 'stub',
      promiseStub = new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(responseStub)
        }, 100)
      })

suite.before.each(context => {
  context.setup = (options = {}) => new Resolveable(
    () => promiseStub,
    options
  )
})

suite('stores the getPromise', context => {
  const instance = context.setup()

  assert.ok(instance.getPromise instanceof Function)
})

suite('assignment sets the getPromise', context => {
  const instance = context.setup()
  instance.getPromise = () => 'stub'

  assert.ok(typeof instance.getPromise === 'function')
})

suite('setGetPromise sets the getPromise', context => {
  const instance = context.setup()
  instance.setGetPromise(() => 'stub')

  assert.ok(typeof instance.getPromise === 'function')
})

suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite('status is "resolving" while resolving', context => {
  const instance = context.setup()
  instance.resolve()

  assert.is(instance.status, 'resolving')
})

suite('status is "resolved" after resolving', async context => {
  const instance = context.setup()
  await instance.resolve()

  assert.is(instance.status, 'resolved')
})

suite('stores the response', async context => {
  const instance = context.setup()
  await instance.resolve()

  assert.is(instance.response, responseStub)
})

suite.run()
