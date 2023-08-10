import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createPredicateKeycomboDown } from '../../src/extracted/createPredicateKeycomboDown'
import type { KeyStatuses } from '../../src/extracted/key-statuses'

const suite = createSuite('createPredicateKeycomboDown')

suite('predicates arrows', () => {
  {
    const statuses: KeyStatuses = [
            [{ code: 'ArrowUp' }, 'down'],
          ],
          value = createPredicateKeycomboDown('up')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            [{ code: 'ArrowRight' }, 'down'],
          ],
          value = createPredicateKeycomboDown('right')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            [{ code: 'ArrowDown' }, 'down'],
          ],
          value = createPredicateKeycomboDown('down')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            [{ code: 'ArrowLeft' }, 'down'],
          ],
          value = createPredicateKeycomboDown('left')(statuses)

    assert.ok(value)
  }
})

suite('predicates digits', () => {
  const statuses: KeyStatuses = [
          [{ code: 'Digit0' }, 'down'],
        ],
        value = createPredicateKeycomboDown('0')(statuses)

  assert.ok(value)
})

suite('predicates lowercase letters', () => {
  const statuses: KeyStatuses = [
          [{ code: 'KeyA' }, 'down'],
        ],
        value = createPredicateKeycomboDown('a')(statuses)

  assert.ok(value)
})

suite('predicates uppercase letters', () => {
  const statuses: KeyStatuses = [
          [{ code: 'KeyA' }, 'down'],
        ],
        value = createPredicateKeycomboDown('A')(statuses)

  assert.ok(value)
})

suite('predicates alt', () => {
  const statuses: KeyStatuses = [
    [{ key: 'Alt' }, 'down'],
  ]

  for (const alias of ['alt', 'opt', 'option']) {
    const value = createPredicateKeycomboDown(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates control', () => {
  const statuses: KeyStatuses = [
    [{ key: 'Control' }, 'down'],
  ]

  for (const alias of ['ctrl', 'control']) {
    const value = createPredicateKeycomboDown(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates meta', () => {
  const statuses: KeyStatuses = [
    [{ key: 'Meta' }, 'down'],
  ]

  for (const alias of ['meta', 'cmd', 'command']) {
    const value = createPredicateKeycomboDown(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates shift', () => {
  const statuses: KeyStatuses = [
    [{ key: 'Shift' }, 'down'],
  ]

  for (const alias of ['shift']) {
    const value = createPredicateKeycomboDown(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates fn', () => {
  const statuses: KeyStatuses = [
          [{ code: 'F1' }, 'down'],
        ],
        value = createPredicateKeycomboDown('f1')(statuses)

  assert.ok(value)
})

suite('supports custom alias transformer', () => {
  const statuses: KeyStatuses = [
          [{ key: 'å', code: 'KeyA' }, 'down'],
          [{ key: 'Alt', code: 'AltLeft' }, 'down'],
        ],
        value = createPredicateKeycomboDown(
          'å',
          {
            toDownKeys: alias => {
              return alias === 'å'
                ? [{ code: 'KeyA' }]
                : []
            },
          }
        )(statuses)

  assert.ok(value)
})

suite.run()
