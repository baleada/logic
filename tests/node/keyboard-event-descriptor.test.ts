import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createKeycomboMatch } from '../../src/pipes/keyboard-event-descriptor'

const suite = createSuite('keyboard event')

suite('createKeycomboMatch predicates keys', () => {
  {
    const event = { code: 'KeyA' } as KeyboardEvent,
          value = createKeycomboMatch('a')(event),
          expected = true

    assert.is(value, expected)
  }

  {
    const event = { code: 'KeyB' } as KeyboardEvent,
          value = createKeycomboMatch('a')(event),
          expected = false

    assert.is(value, expected)
  }
  
  {
    const event = { code: 'KeyA', shiftKey: true } as KeyboardEvent,
          value = createKeycomboMatch('a')(event),
          expected = false

    assert.is(value, expected)
  }

  {
    const event = { code: 'KeyA', shiftKey: true, metaKey: true } as KeyboardEvent,
          value = createKeycomboMatch('shift+cmd+a')(event),
          expected = true

    assert.is(value, expected)
  }

  {
    const event = { code: 'KeyA', shiftKey: true, metaKey: false } as KeyboardEvent,
          value = createKeycomboMatch('shift+cmd+a')(event),
          expected = false

    assert.is(value, expected)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: false } as KeyboardEvent,
          value = createKeycomboMatch('`')(event),
          expected = true

    assert.is(value, expected, `\`: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: true } as KeyboardEvent,
          value = createKeycomboMatch('`')(event),
          expected = false

    assert.is(value, expected, `\`: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: false } as KeyboardEvent,
          value = createKeycomboMatch('~')(event),
          expected = false

    assert.is(value, expected, `~: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: true } as KeyboardEvent,
          value = createKeycomboMatch('~')(event),
          expected = true

    assert.is(value, expected, `~: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'KeyA', shiftKey: true } as KeyboardEvent,
          value = createKeycomboMatch('A')(event),
          expected = true

    assert.is(value, expected, `~: ${JSON.stringify(event)}`)
  }

  {
    const value = createKeycomboMatch('ctrl+opt+left')({ code: 'ArrowLeft', ctrlKey: true, altKey: true } as KeyboardEvent),
          expected = true

    assert.is(value, expected)
  }
})

suite('createKeycomboMatch predicates modifiers', () => {
  {
    const value = createKeycomboMatch('cmd')({ code: 'MetaLeft' } as KeyboardEvent),
          expected = true

    assert.is(value, expected)
  }

  {
    const value = createKeycomboMatch('cmd')({ code: 'ShiftLeft' } as KeyboardEvent),
          expected = false

    assert.is(value, expected)
  }
  
  {
    const value = createKeycomboMatch('shift+cmd')({ code: 'MetaLeft', shiftKey: true } as KeyboardEvent),
          expected = true

    assert.is(value, expected)
  }

  {
    const value = createKeycomboMatch('shift+cmd')({ code: 'MetaLeft', shiftKey: false } as KeyboardEvent),
          expected = false

    assert.is(value, expected)
  }
})

suite('createKeycomboMatch predicates modifiers when code is not present', () => {
  {
    const value = createKeycomboMatch('cmd')({} as KeyboardEvent),
        expected = false

    assert.is(value, expected)
  }

  {
    const value = createKeycomboMatch('shift+cmd')({ shiftKey: true } as MouseEvent),
        expected = false

    assert.is(value, expected)
  }

  {
    const value = createKeycomboMatch('shift+cmd')({ shiftKey: true, metaKey: true } as MouseEvent),
        expected = true

    assert.is(value, expected)
  }
})


suite.run()
