import test from 'ava'
import Fetchable from '../../src/classes/Fetchable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Fetchable(
    'http://httpbin.org/get',
    options
  )
})

/* Basic */
test('stores the resource', t => {
  const instance = t.context.setup()

  t.is(instance.resource, 'http://httpbin.org/get')
})

test('setResource sets the resource', t => {
  const instance = t.context.setup()
  instance.setResource('http://httpbin.org/post')

  t.is(instance.resource, 'http://httpbin.org/post')
})

test('setResponse sets the response', t => {
  const instance = t.context.setup()
  instance.setResponse({ test: true })

  t.deepEqual(instance.response, { test: true })
})
