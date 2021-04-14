import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toAddEventListenerParams } from '../../src/classes/Listenable'

const suite = createSuite('toAddEventListenerParams (node)')

suite(`listener options prefers addEventListener options object`, context => {
  const { listenerOptions: { 0: value } } = toAddEventListenerParams(
          () => {},
          { addEventListener: {}, useCapture: true }
        ),
        expected = {}

  assert.equal(value, expected)
})

suite(`listener options includes useCapture when addEventListener is falsy`, context => {
  const { listenerOptions: { 0: value } } = toAddEventListenerParams(
          () => {},
          { useCapture: true }
        ),
        expected = true

  assert.is(value, expected)
})

suite.skip(`listener options includes wantsUntrusted`, context => {
  const { listenerOptions: { 1: value } } = toAddEventListenerParams(
          () => {},
          { wantsUntrusted: true }
        ),
        expected = true

  assert.is(value, expected)
})

suite.run()
