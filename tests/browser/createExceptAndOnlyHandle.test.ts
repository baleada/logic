import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createExceptAndOnlyHandle } from '../../src/classes/Listenable'

type Context = {
  eventStub: {
    target: {
      matches: (selector: string) => boolean,
    },
  }
}

const suite = createSuite<Context>('createExceptAndOnlyHandle (node)')

suite.before(context => {
  context.eventStub = {
    target: { matches: selector => selector === 'stub' }
  }
})

suite(`doesn't guard when except and only are empty`, ({ eventStub }) => {
  let value = 0
  createExceptAndOnlyHandle<KeyboardEvent>(
    () => value++,
    {}
  )(eventStub)
  
  assert.is(value, 1)
})

suite(`guards against except when only is empty`, ({ eventStub }) => {
  let value = 0
  createExceptAndOnlyHandle<KeyboardEvent>(
    () => value++,
    { except: ['stub'] }
  )(eventStub)
  
  assert.is(value, 0)
})

suite(`guards against mismatches when only is not empty`, ({ eventStub }) => {
  let value = 0
  createExceptAndOnlyHandle<KeyboardEvent>(
    () => value++,
    { only: ['example'] }
  )(eventStub)
  
  assert.is(value, 0)
})

suite(`ignores except when only matches`, ({ eventStub }) => {
  let value = 0
  createExceptAndOnlyHandle<KeyboardEvent>(
    () => value++,
    { only: ['stub'], except: ['stub'] }
  )(eventStub)
  
  assert.is(value, 1)
})

suite.run()
