import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createKeycomboDown } from '../../src/extracted/createKeycomboDown'
import type { KeyStatuses } from '../../src/extracted/key-statuses'

const suite = createSuite('createKeycomboDown')

suite('predicates arrows', () => {
  {
    const statuses: KeyStatuses = [
            ['ArrowUp', 'down'],
          ],
          value = createKeycomboDown('up')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            ['ArrowRight', 'down'],
          ],
          value = createKeycomboDown('right')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            ['ArrowDown', 'down'],
          ],
          value = createKeycomboDown('down')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            ['ArrowLeft', 'down'],
          ],
          value = createKeycomboDown('left')(statuses)

    assert.ok(value)
  }
})

suite('predicates digits', () => {
  const statuses: KeyStatuses = [
          ['Digit0', 'down'],
        ],
        value = createKeycomboDown('0')(statuses)

  assert.ok(value)
})

suite('predicates lowercase letters', () => {
  const statuses: KeyStatuses = [
          ['KeyA', 'down'],
        ],
        value = createKeycomboDown('a')(statuses)

  assert.ok(value)
})

suite('predicates uppercase letters', () => {
  const statuses: KeyStatuses = [
          ['KeyA', 'down'],
          ['Shift', 'down'],
        ],
        value = createKeycomboDown('A')(statuses)

  assert.ok(value)
})

suite('predicate shifted special characters', () => {
  const statuses: KeyStatuses = [
          ['Backquote', 'down'],
          ['Shift', 'down'],
        ],
        value = createKeycomboDown('~')(statuses)

  assert.ok(value)
})

suite('predicates alt', () => {
  for (const direction of ['', 'Left', 'Right']) {
    const statuses: KeyStatuses = [
      [`Alt${direction}`, 'down'],
    ]
  
    for (const alias of ['alt', 'opt', 'option']) {
      const value = createKeycomboDown(alias)(statuses)
      assert.ok(value, alias)
    }
  }
})

suite('predicates control', () => {
  for (const direction of ['', 'Left', 'Right']) {
    const statuses: KeyStatuses = [
      [`Control${direction}`, 'down'],
    ]
  
    for (const alias of ['ctrl', 'control']) {
      const value = createKeycomboDown(alias)(statuses)
      assert.ok(value, alias)
    }
  }
})

suite('predicates meta', () => {
  for (const direction of ['', 'Left', 'Right']) {
    const statuses: KeyStatuses = [
      [`Meta${direction}`, 'down'],
    ]
  
    for (const alias of ['meta', 'cmd', 'command']) {
      const value = createKeycomboDown(alias)(statuses)
      assert.ok(value, alias)
    }
  }
})

suite('predicates shift', () => {
  for (const direction of ['', 'Left', 'Right']) {
    const statuses: KeyStatuses = [
      [`Shift${direction}`, 'down'],
    ]
  
    for (const alias of ['shift']) {
      const value = createKeycomboDown(alias)(statuses)
      assert.ok(value, alias)
    }
  }
})

suite('predicates fn', () => {
  const statuses: KeyStatuses = [
          ['F1', 'down'],
        ],
        value = createKeycomboDown('f1')(statuses)

  assert.ok(value)
})

suite('supports custom alias and key transformers', () => {
  const toLonghand = alias => {
    switch (alias) {
      case 'å': return 'alt+a'
      default: return alias
    }
  }

  const toCode = alias => {
    switch (alias) {
      case 'a': return 'KeyA'
      case 'alt': return 'AltLeft'
      default: return ''
    }
  }

  {
    const statuses: KeyStatuses = [
      ['KeyA', 'down'],
      ['AltLeft', 'down'],
    ]

    {
      const value = createKeycomboDown('å', { toLonghand, toCode })(statuses)
      assert.ok(value)
    }
    
    {
      const value = createKeycomboDown('a', { toLonghand, toCode })(statuses)
      assert.ok(value)
    }

    {
      const value = createKeycomboDown('alt', { toLonghand, toCode })(statuses)
      assert.ok(value)
    }
  }

  {
    const statuses: KeyStatuses = [
      ['KeyA', 'down'],
    ]

    {
      const value = createKeycomboDown('å', { toLonghand, toCode })(statuses)
      assert.not.ok(value)
    }

    {
      const value = createKeycomboDown('a', { toLonghand, toCode })(statuses)
      assert.ok(value)
    }

    {
      const value = createKeycomboDown('alt', { toLonghand, toCode })(statuses)
      assert.not.ok(value)
    }
  }
  
  {
    const statuses: KeyStatuses = [
      ['AltLeft', 'down'],
    ]

    {
      const value = createKeycomboDown('å', { toLonghand, toCode })(statuses)
      assert.not.ok(value)
    }

    {
      const value = createKeycomboDown('a', { toLonghand, toCode })(statuses)
      assert.not.ok(value)
    }

    {
      const value = createKeycomboDown('alt', { toLonghand, toCode })(statuses)
      assert.ok(value)
    }
  }
})

suite.run()
