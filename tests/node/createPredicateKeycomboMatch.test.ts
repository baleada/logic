import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createPredicateKeycomboMatch } from '../../src/extracted/createPredicateKeycomboMatch'
import type { KeyStatuses } from '../../src/extracted/key-statuses'

const suite = createSuite('createPredicateKeycomboMatch')

suite('predicates arrows', () => {
  {
    const statuses: KeyStatuses = [
            [{ code: 'ArrowUp' }, 'down'],
          ],
          value = createPredicateKeycomboMatch('up')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            [{ code: 'ArrowRight' }, 'down'],
          ],
          value = createPredicateKeycomboMatch('right')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            [{ code: 'ArrowDown' }, 'down'],
          ],
          value = createPredicateKeycomboMatch('down')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            [{ code: 'ArrowLeft' }, 'down'],
          ],
          value = createPredicateKeycomboMatch('left')(statuses)

    assert.ok(value)
  }
})

suite('predicates digits', () => {
  const statuses: KeyStatuses = [
          [{ code: 'Digit0' }, 'down'],
        ],
        value = createPredicateKeycomboMatch('0')(statuses)

  assert.ok(value)
})

suite('predicates lowercase letters', () => {
  const statuses: KeyStatuses = [
          [{ code: 'KeyA' }, 'down'],
        ],
        value = createPredicateKeycomboMatch('a')(statuses)

  assert.ok(value)
})

suite('predicates uppercase letters', () => {
  const statuses: KeyStatuses = [
          [{ code: 'KeyA' }, 'down'],
        ],
        value = createPredicateKeycomboMatch('A')(statuses)

  assert.ok(value)
})

suite('predicates alt', () => {
  const statuses: KeyStatuses = [
    [{ key: 'Alt' }, 'down'],
  ]

  for (const alias of ['alt', 'opt', 'option']) {
    const value = createPredicateKeycomboMatch(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates control', () => {
  const statuses: KeyStatuses = [
    [{ key: 'Control' }, 'down'],
  ]

  for (const alias of ['ctrl', 'control']) {
    const value = createPredicateKeycomboMatch(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates meta', () => {
  const statuses: KeyStatuses = [
    [{ key: 'Meta' }, 'down'],
  ]

  for (const alias of ['meta', 'cmd', 'command']) {
    const value = createPredicateKeycomboMatch(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates shift', () => {
  const statuses: KeyStatuses = [
    [{ key: 'Shift' }, 'down'],
  ]

  for (const alias of ['shift']) {
    const value = createPredicateKeycomboMatch(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates fn', () => {
  const statuses: KeyStatuses = [
          [{ code: 'F1' }, 'down'],
        ],
        value = createPredicateKeycomboMatch('f1')(statuses)

  assert.ok(value)
})

// Not sure of the best way to allow certain extra keys to be pressed
suite.skip('supports custom alias and key transformer', () => {
  const statuses: KeyStatuses = [
          [{ key: 'å', code: 'KeyA' }, 'down'],
          [{ key: 'Alt', code: 'AltLeft' }, 'down'],
        ],
        value = createPredicateKeycomboMatch(
          'å',
          {
            toDownKeys: alias => {
              return alias === 'å'
                ? [{ code: 'KeyA' }]
                : []
            },
            toAliases: key => {
              return key.code === 'KeyA'
                ? ['å']
                : []
            },
          }
        )(statuses)

  assert.ok(value)
})

suite.run()
