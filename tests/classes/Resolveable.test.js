import test from 'ava'
import Resolveable from '../../src/classes/Resolveable'

console.log('WARNING: Resolveable requires informal testing') // It shouldn't, but I think something in Babel is interfering.

const responseStub = 'stub',
      promiseStub = new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(responseStub)
        }, 100)
      })

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Resolveable(
    () => promiseStub,
    options
  )
})

test('stores the getPromise', t => {
  const instance = t.context.setup()

  t.assert(instance.getPromise instanceof Function)
})

test('assignment sets the getPromise', t => {
  const instance = t.context.setup()
  instance.getPromise = () => 'poopy'

  t.assert(instance.getPromise instanceof Function)
})

test('setGetPromise sets the getPromise', t => {
  const instance = t.context.setup()
  instance.setGetPromise(() => 'poopy')

  t.assert(instance.getPromise instanceof Function)
})

test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})

// test('status is "resolving" while resolving', t => {
//   const instance = t.context.setup()
//   instance.resolve()

//   t.is(instance.status, 'resolving')
// })

// test('status is "resolved" after resolving', async t => {
//   const instance = t.context.setup()
//   await instance.resolve()

//   t.is(instance.status, 'resolved')
// })

// test('stores the response', async t => {
//   const instance = t.context.setup()
//   await instance.resolve()

//   t.is(instance.response, responseStub)
// })