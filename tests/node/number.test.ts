import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createClamp } from '../../src/pipes/number'
import { createDetermine } from '../../src/pipes/number'

type Context = {
  number: number,
}

const suite = createSuite<Context>('number pipes')

suite.before(context => {
  context.number = 42
})

suite('createClamp({ min, max }) handles number between min and max', ({ number }) => {
  const value = (number => {
    return createClamp(0, 100)(number)
  })(number)

  assert.is(value, 42)
})

suite('createClamp({ min, max }) handles number below min', ({ number }) => {
  const value = (number => {
    return createClamp(50, 100)(number)
  })(number)

  assert.is(value, 50)
})

suite('createClamp({ min, max }) handles number above max', ({ number }) => {
  const value = (number => {
    return createClamp(0, 36)(number)
  })(number)

  assert.is(value, 36)
})

suite('createDetermine(...) determines outcome', () => {
  const potentialities = [
    { outcome: 1, probability: 1 },
    { outcome: 2, probability: 1 },
    { outcome: 3, probability: 1 },
    { outcome: 4, probability: 1 },
  ]
  
  ;(() => {
    const value = createDetermine(potentialities)(0),
          expected = 1

    assert.is(value, expected)
  })()

  ;(() => {
    const value = createDetermine(potentialities)(1),
          expected = 2

    assert.is(value, expected)
  })()

  ;(() => {
    const value = createDetermine(potentialities)(2),
          expected = 3

    assert.is(value, expected)
  })()

  ;(() => {
    const value = createDetermine(potentialities)(3),
          expected = 4

    assert.is(value, expected)
  })()
})

suite('createDetermine(...) falls back to final potentiality if chance is greater than or equal to total probability', () => {
  const potentialities = [
    { outcome: 1, probability: 1 },
    { outcome: 2, probability: 1 },
    { outcome: 3, probability: 1 },
    { outcome: 4, probability: 1 },
  ]
  
  const value = createDetermine(potentialities)(4),
        expected = 4

  assert.is(value, expected)
})

suite('createDetermine(...) falls back to first potentiality if chance is lower than 0', () => {
  const potentialities = [
    { outcome: 1, probability: 1 },
    { outcome: 2, probability: 1 },
    { outcome: 3, probability: 1 },
    { outcome: 4, probability: 1 },
  ]
  
  const value = createDetermine(potentialities)(-1),
        expected = 1

  assert.is(value, expected)
})

suite.run()
