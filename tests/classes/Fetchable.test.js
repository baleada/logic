import test from 'ava'
import Fetchable from '../../src/classes/Fetchable'

console.log('WARNING: Fetchable requires informal testing')

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Fetchable(
    'http://httpbin.org/get',
    options
  )
})

test('stores the resource', t => {
  const instance = t.context.setup()

  t.is(instance.resource, 'http://httpbin.org/get')
})

test('assignment sets the resource', t => {
  const instance = t.context.setup()
  instance.resource = 'http://httpbin.org/post'

  t.is(instance.resource, 'http://httpbin.org/post')
})

test('setResource sets the resource', t => {
  const instance = t.context.setup()
  instance.setResource('http://httpbin.org/post')

  t.is(instance.resource, 'http://httpbin.org/post')
})

test('status.response is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status.response, 'ready')
})

test('status.responseJson is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status.responseJson, 'ready')
})

/* INFORMAL */

// response
// responseJson

// fetch

