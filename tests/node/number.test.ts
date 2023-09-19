import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  createClamp,
  createDetermine,
  createGreater,
  createGreaterOrEqual,
  createLessOrEqual,
  createLess,
} from '../../src/pipes/number'

type Context = {
  number: number,
}

const suite = createSuite<Context>('number pipes')

suite.before(context => {
  context.number = 42
})

suite('createClamp({ min, max }) handles number between min and max', ({ number }) => {
  const value = createClamp(0, 100)(number)

  assert.is(value, 42)
})

suite('createClamp({ min, max }) handles number below min', ({ number }) => {
  const value = createClamp(50, 100)(number)

  assert.is(value, 50)
})

suite('createClamp({ min, max }) handles number above max', ({ number }) => {
  const value = createClamp(0, 36)(number)

  assert.is(value, 36)
})

suite('createDetermine(...) determines outcome', () => {
  const potentialities = [
    { outcome: 1, probability: 1 },
    { outcome: 2, probability: 1 },
    { outcome: 3, probability: 1 },
    { outcome: 4, probability: 1 },
  ]
  
  {
    const value = createDetermine(potentialities)(0),
          expected = 1

    assert.is(value, expected)
  }

  {
    const value = createDetermine(potentialities)(1),
          expected = 2

    assert.is(value, expected)
  }

  {
    const value = createDetermine(potentialities)(2),
          expected = 3

    assert.is(value, expected)
  }

  {
    const value = createDetermine(potentialities)(3),
          expected = 4

    assert.is(value, expected)
  }
})

suite('createDetermine(...) falls back to final potentiality if determinant is greater than or equal to total probability', () => {
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

suite('createDetermine(...) falls back to first potentiality if determinant is lower than 0', () => {
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

suite('createGreater(...) determines if number is greater than threshold', ({ number }) => {
  {
    const value = createGreater(0)(number)
    assert.ok(value)
  }

  {
    const value = createGreater(100)(number)
    assert.not.ok(value)
  }
})

suite('createGreaterOrEqual(...) determines if number is greater than or equal to threshold', ({ number }) => {
  {
    const value = createGreaterOrEqual(0)(number)
    assert.ok(value)
  }

  {
    const value = createGreaterOrEqual(42)(number)
    assert.ok(value)
  }

  {
    const value = createGreaterOrEqual(100)(number)
    assert.not.ok(value)
  }
})

suite('createLess(...) determines if number is greater than threshold', ({ number }) => {
  {
    const value = createLess(0)(number)
    assert.not.ok(value)
  }

  {
    const value = createLess(100)(number)
    assert.ok(value)
  }
})

suite('createLessOrEqual(...) determines if number is greater than or equal to threshold', ({ number }) => {
  {
    const value = createLessOrEqual(0)(number)
    assert.not.ok(value)
  }

  {
    const value = createLessOrEqual(42)(number)
    assert.ok(value)
  }

  {
    const value = createLessOrEqual(100)(number)
    assert.ok(value)
  }
})

suite.run()
