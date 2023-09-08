import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createKeycomboMatch } from '../../src/extracted/createKeycomboMatch'
import type { KeyStatuses } from '../../src/extracted/key-statuses'

const suite = createSuite('createKeycomboMatch')

suite('predicates arrows', () => {
  {
    const statuses: KeyStatuses = [
            ['ArrowUp', 'down'],
          ],
          value = createKeycomboMatch('up')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            ['ArrowRight', 'down'],
          ],
          value = createKeycomboMatch('right')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            ['ArrowDown', 'down'],
          ],
          value = createKeycomboMatch('down')(statuses)

    assert.ok(value)
  }

  {
    const statuses: KeyStatuses = [
            ['ArrowLeft', 'down'],
          ],
          value = createKeycomboMatch('left')(statuses)

    assert.ok(value)
  }
})

suite('predicates digits', () => {
  const statuses: KeyStatuses = [
          ['Digit0', 'down'],
        ],
        value = createKeycomboMatch('0')(statuses)

  assert.ok(value)
})

suite('predicates lowercase letters', () => {
  const statuses: KeyStatuses = [
          ['KeyA', 'down'],
        ],
        value = createKeycomboMatch('a')(statuses)

  assert.ok(value)
})

suite('predicates uppercase letters', () => {
  const statuses: KeyStatuses = [
          ['KeyA', 'down'],
        ],
        value = createKeycomboMatch('A')(statuses)

  assert.ok(value)
})

suite('predicates alt', () => {
  for (const direction of ['', 'Left', 'Right']) {
    const statuses: KeyStatuses = [
      [`Alt${direction}`, 'down'],
    ]
  
    for (const alias of ['alt', 'opt', 'option']) {
      const value = createKeycomboMatch(alias)(statuses)
      
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
      const value = createKeycomboMatch(alias)(statuses)
      
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
      const value = createKeycomboMatch(alias)(statuses)
      
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
      const value = createKeycomboMatch(alias)(statuses)
      
      assert.ok(value, alias)
    }
  }
})

suite('predicates fn', () => {
  const statuses: KeyStatuses = [
          ['F1', 'down'],
        ],
        value = createKeycomboMatch('f1')(statuses)

  assert.ok(value)
})

suite('supports custom alias and key transformers', () => {
  const toDownCodes = alias => {
    switch (alias) {
      case 'å': return ['KeyA', 'AltLeft']
      case 'a': return ['KeyA']
      case 'alt': return ['AltLeft']
      default: return []
    }
  }

  const toAliases = key => {
    switch (key) {
      case 'KeyA': return ['å', 'a']
      case 'AltLeft': return ['å', 'alt']
      default: return []
    }
  }

  {
    const statuses: KeyStatuses = [
      ['KeyA', 'down'],
      ['AltLeft', 'down'],
    ]

    {
      const value = createKeycomboMatch('å', { toDownCodes, toAliases })(statuses)
      assert.ok(value)
    }
    
    {
      const value = createKeycomboMatch('a', { toDownCodes, toAliases })(statuses)
      assert.not.ok(value)
    }

    {
      const value = createKeycomboMatch('alt', { toDownCodes, toAliases })(statuses)
      assert.not.ok(value)
    }
  }

  {
    const statuses: KeyStatuses = [
      ['KeyA', 'down'],
    ]

    {
      const value = createKeycomboMatch('å', { toDownCodes, toAliases })(statuses)
      assert.not.ok(value)
    }

    {
      const value = createKeycomboMatch('a', { toDownCodes, toAliases })(statuses)
      assert.ok(value)
    }

    {
      const value = createKeycomboMatch('alt', { toDownCodes, toAliases })(statuses)
      assert.not.ok(value)
    }
  }
  
  {
    const statuses: KeyStatuses = [
      ['AltLeft', 'down'],
    ]

    {
      const value = createKeycomboMatch('å', { toDownCodes, toAliases })(statuses)
      assert.not.ok(value)
    }

    {
      const value = createKeycomboMatch('a', { toDownCodes, toAliases })(statuses)
      assert.not.ok(value)
    }

    {
      const value = createKeycomboMatch('alt', { toDownCodes, toAliases })(statuses)
      assert.ok(value)
    }
  }
})

suite.run()
