import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toAddEventListenerParams } from '../../src/classes/Listenable'

const suite = createSuite('toAddEventListenerParams')

suite(`listener options prefers addEventListener options object`, context => {
  const { effectOptions: { 0: value } } = toAddEventListenerParams(
          () => {},
          { addEventListener: {}, useCapture: true }
        ),
        expected = {}

  assert.equal(value, expected)
})

suite(`listener options includes useCapture when addEventListener is falsy`, context => {
  const { effectOptions: { 0: value } } = toAddEventListenerParams(
          () => {},
          { useCapture: true }
        ),
        expected = true

  assert.is(value, expected)
})

// Decided not to support wantsUntrusted for now, due to type safety issues.
// Will support again if I find an addEventListener type definition with wantsUntrusted support. 
// suite.skip(`listener options includes wantsUntrusted`, context => {
//   const { effectOptions: { 1: value } } = toAddEventListenerParams(
//           () => {},
//           { wantsUntrusted: true }
//         ),
//         expected = true

//   assert.is(value, expected)
// })

suite.run()
