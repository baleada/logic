import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toImplementation } from '../../src/classes/Listenable'
import { keys, leftclicks, modifierAliases, modifiers, pointers, rightclicks } from '../fixtures/comboMeta'

const suite = createSuite('toImplementation')

suite(`identifies recognizeable`, () => {
  const value = toImplementation('recognizeable'),
        expected = 'recognizeable'

  assert.is(value, expected)
})

suite(`identifies intersection`, () => {
  const value = toImplementation('intersect'),
        expected = 'intersection'

  assert.is(value, expected)
})

suite(`identifies mutation`, () => {
  const value = toImplementation('mutate'),
        expected = 'mutation'

  assert.is(value, expected)
})

suite(`identifies resize`, () => {
  const value = toImplementation('resize'),
        expected = 'resize'

  assert.is(value, expected)
})

suite(`identifies mediaquery`, () => {
  const value1 = toImplementation('(min-width: 600px)'),
        expected1 = 'mediaquery'

  assert.is(value1, expected1)

  // It's naive
  const value2 = toImplementation('(anything in parentheses)'),
        expected2 = 'mediaquery'

  assert.is(value2, expected2)
})

suite(`identifies idle`, () => {
  const value = toImplementation('idle'),
        expected = 'idle'

  assert.is(value, expected)
})

suite(`identifies documentevent`, () => {
  (() => {
    const value = toImplementation('fullscreenchange'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('fullscreenerror'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('pointerlockchange'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('pointerlockerror'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('readystatechange'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('visibilitychange'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();
})

suite(`identifies everything else as a custom event`, () => {
  const value = toImplementation('poop'),
        expected = 'event'

  assert.is(value, expected)
})

suite.run()
