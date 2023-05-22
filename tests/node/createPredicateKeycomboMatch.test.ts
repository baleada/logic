import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createPredicateKeycomboMatch } from '../../src/extracted/createPredicateKeycomboMatch'
import { createKeyStatuses } from '../../src/extracted/createKeyStatuses'

const suite = createSuite('createPredicateKeycomboMatch')

suite('predicates arrows', () => {
  {
    const statuses = createKeyStatuses({
            initial: [
              [{ code: 'ArrowUp' }, 'down'],
            ],
          }),
          value = createPredicateKeycomboMatch('up')(statuses)

    assert.ok(value)
  }

  {
    const statuses = createKeyStatuses({
            initial: [
              [{ code: 'ArrowRight' }, 'down'],
            ],
          }),
          value = createPredicateKeycomboMatch('right')(statuses)

    assert.ok(value)
  }

  {
    const statuses = createKeyStatuses({
            initial: [
              [{ code: 'ArrowDown' }, 'down'],
            ],
          }),
          value = createPredicateKeycomboMatch('down')(statuses)

    assert.ok(value)
  }

  {
    const statuses = createKeyStatuses({
            initial: [
              [{ code: 'ArrowLeft' }, 'down'],
            ],
          }),
          value = createPredicateKeycomboMatch('left')(statuses)

    assert.ok(value)
  }
})

suite('predicates digits', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ code: 'Digit0' }, 'down'],
          ],
        }),
        value = createPredicateKeycomboMatch('0')(statuses)

  assert.ok(value)
})

suite('predicates lowercase letters', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ code: 'KeyA' }, 'down'],
          ],
        }),
        value = createPredicateKeycomboMatch('a')(statuses)

  assert.ok(value)
})

suite('predicates uppercase letters', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ code: 'KeyA' }, 'down'],
          ],
        }),
        value = createPredicateKeycomboMatch('A')(statuses)

  assert.ok(value)
})

suite('predicates alt', () => {
  const statuses = createKeyStatuses({
    initial: [
      [{ key: 'Alt' }, 'down'],
    ],
  })

  for (const alias of ['alt', 'opt', 'option']) {
    const value = createPredicateKeycomboMatch(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates control', () => {
  const statuses = createKeyStatuses({
    initial: [
      [{ key: 'Control' }, 'down'],
    ],
  })

  for (const alias of ['ctrl', 'control']) {
    const value = createPredicateKeycomboMatch(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates meta', () => {
  const statuses = createKeyStatuses({
    initial: [
      [{ key: 'Meta' }, 'down'],
    ],
  })

  for (const alias of ['meta', 'cmd', 'command']) {
    const value = createPredicateKeycomboMatch(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates shift', () => {
  const statuses = createKeyStatuses({
    initial: [
      [{ key: 'Shift' }, 'down'],
    ],
  })

  for (const alias of ['shift']) {
    const value = createPredicateKeycomboMatch(alias)(statuses)
    
    assert.ok(value, alias)
  }
})

suite('predicates fn', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ code: 'F1' }, 'down'],
          ],
        }),
        value = createPredicateKeycomboMatch('f1')(statuses)

  assert.ok(value)
})

// Not sure of the best way to allow certain extra keys to be pressed
suite.skip('supports custom alias and key transformer', () => {
  const statuses = createKeyStatuses({
          initial: [
            [{ key: 'å', code: 'KeyA' }, 'down'],
            [{ key: 'Alt', code: 'AltLeft' }, 'down'],
          ],
        }),
        value = createPredicateKeycomboMatch(
          'å',
          {
            toKey: alias => {
              return alias === 'å'
                ? { code: 'KeyA' }
                : {}
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
