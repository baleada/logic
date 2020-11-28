import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Fetchable } from '../fixtures/index.js'

console.log('WARNING: Fetchable requires browser testing')

const suite = createSuite('Fetchable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Fetchable(
    'http://httpbin.org/get',
    options
  )
})

suite('stores the resource', context => {
  const instance = context.setup()

  assert.is(instance.resource, 'http://httpbin.org/get')
})

suite('assignment sets the resource', context => {
  const instance = context.setup()
  instance.resource = 'http://httpbin.org/post'

  assert.is(instance.resource, 'http://httpbin.org/post')
})

suite('setResource sets the resource', context => {
  const instance = context.setup()
  instance.setResource('http://httpbin.org/post')

  assert.is(instance.resource, 'http://httpbin.org/post')
})

suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

/* INFORMAL */

// response
// arrayBuffer
// blob
// formData
// json
// text

// fetch
// get
// patch
// post
// put
// delete

// abort

suite.run()
