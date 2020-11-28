import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Resolveable } from '../fixtures/index.js'

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
  instance.getPromise = () => 'poopy'

  assert.ok(instance.getPromise instanceof Function)
})

suite('setGetPromise sets the getPromise', context => {
  const instance = context.setup()
  instance.setGetPromise(() => 'poopy')

  assert.ok(instance.getPromise instanceof Function)
})

suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

// test('status is "resolving" while resolving', context => {
//   const instance = context.setup()
//   instance.resolve()

//   assert.is(instance.status, 'resolving')
// })

// test('status is "resolved" after resolving', async t => {
//   const instance = context.setup()
//   await instance.resolve()

//   assert.is(instance.status, 'resolved')
// })

// test('stores the response', async t => {
//   const instance = context.setup()
//   await instance.resolve()

//   assert.is(instance.response, responseStub)
// })

suite.run()
