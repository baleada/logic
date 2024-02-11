import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createKeycomboMatch } from '../../src/pipes/keyboard-event-descriptor'

const suite = createSuite('keyboard event')

suite('createKeycomboMatch predicates keys', () => {
  {
    const event = { code: 'KeyA' },
          value = createKeycomboMatch('a')(event),
          expected = true

    assert.is(value, expected)
  }

  {
    const event = { code: 'KeyB' },
          value = createKeycomboMatch('a')(event),
          expected = false

    assert.is(value, expected)
  }
  
  {
    const event = { code: 'KeyA', shiftKey: true },
          value = createKeycomboMatch('a')(event),
          expected = false

    assert.is(value, expected)
  }

  {
    const event = { code: 'KeyA', shiftKey: true, metaKey: true },
          value = createKeycomboMatch('shift+cmd+a')(event),
          expected = true

    assert.is(value, expected)
  }

  {
    const event = { code: 'KeyA', shiftKey: true, metaKey: false },
          value = createKeycomboMatch('shift+cmd+a')(event),
          expected = false

    assert.is(value, expected)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: false },
          value = createKeycomboMatch('`')(event),
          expected = true

    assert.is(value, expected, `\`: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: true },
          value = createKeycomboMatch('`')(event),
          expected = false

    assert.is(value, expected, `\`: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: false },
          value = createKeycomboMatch('~')(event),
          expected = false

    assert.is(value, expected, `~: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'Backquote', shiftKey: true },
          value = createKeycomboMatch('~')(event),
          expected = true

    assert.is(value, expected, `~: ${JSON.stringify(event)}`)
  }
  
  {
    const event = { code: 'KeyA', shiftKey: true },
          value = createKeycomboMatch('A')(event),
          expected = true

    assert.is(value, expected, `~: ${JSON.stringify(event)}`)
  }

  {
    const value = createKeycomboMatch('ctrl+opt+left')({ code: 'ArrowLeft', ctrlKey: true, altKey: true }),
          expected = true

    assert.is(value, expected)
  }
})

suite('createKeycomboMatch predicates modifiers', () => {
  {
    const value = createKeycomboMatch('cmd')({ code: 'MetaLeft' }),
          expected = true

    assert.is(value, expected)
  }

  {
    const value = createKeycomboMatch('cmd')({ code: 'ShiftLeft' }),
          expected = false

    assert.is(value, expected)
  }
  
  {
    const value = createKeycomboMatch('shift+cmd')({ code: 'MetaLeft', shiftKey: true }),
          expected = true

    assert.is(value, expected)
  }

  {
    const value = createKeycomboMatch('shift+cmd')({ code: 'MetaLeft', shiftKey: false }),
          expected = false

    assert.is(value, expected)
  }
})

suite.only('createKeycomboMatch predicates modifiers when code is not present', () => {
  {
    const value = createKeycomboMatch('cmd')({}),
        expected = false

    assert.is(value, expected)
  }

  {
    const value = createKeycomboMatch('shift+cmd')({ shiftKey: true }),
        expected = false

    assert.is(value, expected)
  }

  {
    const value = createKeycomboMatch('shift+cmd')({ shiftKey: true, metaKey: true }),
        expected = true

    assert.is(value, expected)
  }
})


suite.run()
