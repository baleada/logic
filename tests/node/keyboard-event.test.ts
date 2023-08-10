import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createPredicateKeycomboMatch } from '../../src/pipes/keyboard-event'

const suite = createSuite('keyboard event')

suite('createPredicateKeycomboMatch predicates keys', () => {
  {
    const event = { code: 'KeyA' } as KeyboardEvent,
          value = createPredicateKeycomboMatch('a')(event),
          expected = true

    assert.is(value, expected)
  }

  {
    const event = { code: 'KeyB' } as KeyboardEvent,
          value = createPredicateKeycomboMatch('a')(event),
          expected = false

    assert.is(value, expected)
  }
  
  {
    const event = { code: 'KeyA', shiftKey: true } as KeyboardEvent,
          value = createPredicateKeycomboMatch('a')(event),
          expected = false

    assert.is(value, expected)
  }

  {
    const event = { code: 'KeyA', shiftKey: true, metaKey: true } as KeyboardEvent,
          value = createPredicateKeycomboMatch('shift+cmd+a')(event),
          expected = true

    assert.is(value, expected)
  }

  {
    const event = { code: 'KeyA', shiftKey: true, metaKey: false } as KeyboardEvent,
          value = createPredicateKeycomboMatch('shift+cmd+a')(event),
          expected = false

    assert.is(value, expected)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: false } as KeyboardEvent,
          value = createPredicateKeycomboMatch('`')(event),
          expected = true

    assert.is(value, expected, `\`: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: true } as KeyboardEvent,
          value = createPredicateKeycomboMatch('`')(event),
          expected = false

    assert.is(value, expected, `\`: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: false } as KeyboardEvent,
          value = createPredicateKeycomboMatch('~')(event),
          expected = false

    assert.is(value, expected, `\~: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: true } as KeyboardEvent,
          value = createPredicateKeycomboMatch('~')(event),
          expected = true

    assert.is(value, expected, `\~: ${JSON.stringify(event)}`)
  }
})

suite('createPredicateKeycomboMatch predicates modifiers', () => {
  {
    const value = createPredicateKeycomboMatch('cmd')({ key: 'Meta' } as KeyboardEvent),
          expected = true

    assert.is(value, expected)
  }

  {
    const value = createPredicateKeycomboMatch('cmd')({ key: 'Shift' } as KeyboardEvent),
          expected = false

    assert.is(value, expected)
  }
  
  {
    const value = createPredicateKeycomboMatch('shift+cmd')({ key: 'Meta', shiftKey: true } as KeyboardEvent),
          expected = true

    assert.is(value, expected)
  }

  {
    const value = createPredicateKeycomboMatch('shift+cmd')({ key: 'Meta', shiftKey: false } as KeyboardEvent),
          expected = false

    assert.is(value, expected)
  }
})


suite.run()
