import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createExceptAndOnlyListener } from '../../src/classes/Listenable'

const suite = createSuite('createExceptAndOnlyListener (node)')

suite.before(context => {
  context.eventStub = {
    target: { matches: selector => selector === 'stub' }
  }
})

suite(`doesn't guard when except and only are empty`, ({ eventStub }) => {
  let value = 0
  createExceptAndOnlyListener<KeyboardEvent>(
    () => value++,
    {}
  )(eventStub)
  
  assert.is(value, 1)
})

suite(`guards against except when only is empty`, ({ eventStub }) => {
  let value = 0
  createExceptAndOnlyListener<KeyboardEvent>(
    () => value++,
    { except: ['stub'] }
  )(eventStub)
  
  assert.is(value, 0)
})

suite(`guards against mismatches when only is not empty`, ({ eventStub }) => {
  let value = 0
  createExceptAndOnlyListener<KeyboardEvent>(
    () => value++,
    { only: ['example'] }
  )(eventStub)
  
  assert.is(value, 0)
})

suite(`ignores except when only matches`, ({ eventStub }) => {
  let value = 0
  createExceptAndOnlyListener<KeyboardEvent>(
    () => value++,
    { only: ['stub'], except: ['stub'] }
  )(eventStub)
  
  assert.is(value, 1)
})

suite.run()
