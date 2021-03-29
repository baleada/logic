import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Resolveable } from '../../src/classes/Resolveable'

const suite = createSuite('Resolveable (node)')

const responseStub = 'stub',
      errorMessageStub = 'error',
      withSuccessStub = () => new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(responseStub)
        }, 10)
      }),
      withErrorStub = () => new Promise(function(resolve, reject) {
        setTimeout(function() {
          reject(new Error(errorMessageStub))
        }, 10)
      })

suite.before.each(context => {
  context.setup = (options = {}) => new Resolveable(
    () => withSuccessStub(),
    options
  )
})

suite(`stores the getPromise`, context => {
  const instance = context.setup()

  assert.ok(instance.getPromise instanceof Function)
})

suite(`assignment sets the getPromise`, context => {
  const instance = context.setup()
  instance.getPromise = () => 'stub'

  assert.ok(typeof instance.getPromise === 'function')
})

suite(`setGetPromise sets the getPromise`, context => {
  const instance = context.setup()
  instance.setGetPromise(() => 'stub')

  assert.ok(typeof instance.getPromise === 'function')
})

suite(`status is 'ready' after construction`, context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite(`status is 'resolving' while resolving`, context => {
  const instance = context.setup()
  instance.resolve()

  assert.is(instance.status, 'resolving')
})

suite(`status is 'resolved' after resolving`, async context => {
  const instance = context.setup()
  await instance.resolve()

  assert.is(instance.status, 'resolved')
})

suite(`status is 'errored' after resolving`, async context => {
  const instance = new Resolveable(() => withErrorStub())
  await instance.resolve()

  assert.is(instance.status, 'errored')
})

suite(`stores the response`, async context => {
  const instance = context.setup()
  await instance.resolve()

  assert.is(instance.response, responseStub)
})

suite(`stores the error`, async context => {
  const instance = new Resolveable(() => withErrorStub())
  await instance.resolve()

  assert.equal(instance.response.message, errorMessageStub)
})

suite(`stores the response from promise arrays`, async context => {
  const instance = new Resolveable(() => (new Array(5)).fill(withSuccessStub()))
  await instance.resolve()

  assert.equal(instance.response, (new Array(5)).fill(responseStub))
})

suite(`stores the error from promise arrays`, async context => {
  const instance = new Resolveable(() => [...(new Array(4)).fill(withSuccessStub()), withErrorStub()])
  await instance.resolve()

  assert.equal(instance.response.message, errorMessageStub)
})

suite.run()
