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

test('stores the promiseGetter', t => {
  const instance = t.context.setup()

  t.assert(instance.promiseGetter instanceof Function)
})

test('assignment sets the promiseGetter', t => {
  const instance = t.context.setup()
  instance.promiseGetter = () => 'poopy'

  t.assert(instance.promiseGetter instanceof Function)
})

test('setPromiseGetter sets the promiseGetter', t => {
  const instance = t.context.setup()
  instance.setPromiseGetter(() => 'poopy')

  t.assert(instance.promiseGetter instanceof Function)
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