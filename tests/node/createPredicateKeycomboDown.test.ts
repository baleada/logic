import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createPredicateKeycomboDown } from '../../src/extracted/createPredicateKeycomboDown'
import { createKeyStatuses } from '../../src/extracted/createKeyStatuses'

const suite = createSuite('createPredicateKeycomboDown')

suite('predicates arrows', () => {
  {
    const statuses = createKeyStatuses({
            initial: [
              [{ code: 'ArrowUp' }, 'down'],
            ],
          }),
          value = createPredicateKeycomboDown('up')(statuses)

    assert.ok(value)
  }

  {
    const statuses = createKeyStatuses({
            initial: [
              [{ code: 'ArrowRight' }, 'down'],
            ],
          }),
          value = createPredicateKeycomboDown('right')(statuses)

    assert.ok(value)
  }

  {
    const statuses = createKeyStatuses({
            initial: [
              [{ code: 'ArrowDown' }, 'down'],
            ],
          }),
          value = createPredicateKeycomboDown('down')(statuses)

    assert.ok(value)
  }

  {
    const statuses = createKeyStatuses({
            initial: [
              [{ code: 'ArrowLeft' }, 'down'],
            ],
          }),
          value = createPredicateKeycomboDown('left')(statuses)

    assert.ok(value)
  }
})

suite('predicates digits', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ code: 'Digit0' }, 'down'],
          ],
        }),
        value = createPredicateKeycomboDown('0')(statuses)

  assert.ok(value)
})

suite('predicates lowercase letters', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ code: 'KeyA' }, 'down'],
          ],
        }),
        value = createPredicateKeycomboDown('a')(statuses)

  assert.ok(value)
})

suite('predicates uppercase letters', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ code: 'KeyA' }, 'down'],
          ],
        }),
        value = createPredicateKeycomboDown('A')(statuses)

  assert.ok(value)
})

suite('predicates alt', () => {
  const statuses = createKeyStatuses({
    initial: [
      [{ altKey: true }, 'down'],
    ],
  })

  for (const alias of ['alt', 'opt', 'option']) {
    const value = createPredicateKeycomboDown(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates control', () => {
  const statuses = createKeyStatuses({
    initial: [
      [{ ctrlKey: true }, 'down'],
    ],
  })

  for (const alias of ['ctrl', 'control']) {
    const value = createPredicateKeycomboDown(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates meta', () => {
  const statuses = createKeyStatuses({
    initial: [
      [{ metaKey: true }, 'down'],
    ],
  })

  for (const alias of ['meta', 'cmd', 'command']) {
    const value = createPredicateKeycomboDown(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates shift', () => {
  const statuses = createKeyStatuses({
    initial: [
      [{ shiftKey: true }, 'down'],
    ],
  })

  for (const alias of ['shift']) {
    const value = createPredicateKeycomboDown(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates fn', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ code: 'F1' }, 'down'],
          ],
        }),
        value = createPredicateKeycomboDown('f1')(statuses)

  assert.ok(value)
})

suite('supports custom alias transformer', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ key: 'á', code: 'KeyA', altKey: true }, 'down'],
          ],
        }),
        value = createPredicateKeycomboDown(
          'å',
          {
            toKey: alias => {
              return alias === 'å'
                ? { key: 'á', code: 'KeyA', altKey: true }
                : {}
            },
          }
        )(statuses)

  assert.ok(value)
})

suite.run()
