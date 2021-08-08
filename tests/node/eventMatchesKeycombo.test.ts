import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { eventMatchesKeycombo } from '../../src/classes/Listenable'
import { toKey } from '../../src/extracted'
import { singleCharacters, arrows, others, modifiers, modifierAliases } from '../fixtures/comboMeta'

const suite = createSuite('eventMatchesKeycombo')

suite(`predicates single characters`, () => {
  for (const singleCharacter of singleCharacters) {
    assert.ok(
      eventMatchesKeycombo({
        event: { key: singleCharacter } as KeyboardEvent,
        keycombo: [{ name: singleCharacter, type: 'singleCharacter' }],
      })
    )

    assert.not.ok(
      eventMatchesKeycombo({
        event: { key: 'Enter' } as KeyboardEvent,
        keycombo: [{ name: singleCharacter, type: 'singleCharacter' }],
      })
    )
    
    assert.ok(
      eventMatchesKeycombo({
        event: { key: 'Enter' } as KeyboardEvent,
        keycombo: [{ name: '!' + singleCharacter, type: 'singleCharacter' }],
      })
    )
    
    assert.not.ok(
      eventMatchesKeycombo({
        event: { key: singleCharacter } as KeyboardEvent,
        keycombo: [{ name: '!' + singleCharacter, type: 'singleCharacter' }],
      })
    )
  }
})

suite(`predicates others`, () => {
  for (const other of others) {
    assert.ok(
      eventMatchesKeycombo({
        event: { key: toKey(other) } as KeyboardEvent,
        keycombo: [{ name: other, type: 'other' }],
      })
    )

    assert.not.ok(
      eventMatchesKeycombo({
        event: { key: 'B' } as KeyboardEvent,
        keycombo: [{ name: other, type: 'other' }],
      })
    )
    
    assert.ok(
      eventMatchesKeycombo({
        event: { key: 'B' } as KeyboardEvent,
        keycombo: [{ name: '!' + other, type: 'other' }],
      })
    )
    
    assert.not.ok(
      eventMatchesKeycombo({
        event: { key: toKey(other) } as KeyboardEvent,
        keycombo: [{ name: '!' + other, type: 'other' }],
      })
    )
  }
})

suite(`predicates modifiers as keys`, () => {
  const modifiersAndAliases = (modifiers as string[]).concat(modifierAliases)

  for (const modifier of modifiersAndAliases) {
    assert.ok(
      eventMatchesKeycombo({
        event: { key: toKey(modifier) } as KeyboardEvent,
        keycombo: [{ name: modifier, type: 'modifier' }],
      })
    )

    assert.not.ok(
      eventMatchesKeycombo({
        event: { key: 'B' } as KeyboardEvent,
        keycombo: [{ name: modifier, type: 'modifier' }],
      })
    )
    
    assert.ok(
      eventMatchesKeycombo({
        event: { key: 'B' } as KeyboardEvent,
        keycombo: [{ name: '!' + modifier, type: 'modifier' }],
      })
    )
    
    assert.not.ok(
      eventMatchesKeycombo({
        event: { key: toKey(modifier) } as KeyboardEvent,
        keycombo: [{ name: '!' + modifier, type: 'modifier' }],
      })
    )
  }
})

suite(`predicates modifiers`, () => {
  const modifiersAndAliases = (modifiers as string[]).concat(modifierAliases),
        event = {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
          key: 'B',
        } as KeyboardEvent,
        modifiedEvent = {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
          key: 'B',
        } as KeyboardEvent

  for (const modifier of modifiersAndAliases) {
    assert.ok(
      eventMatchesKeycombo({
        event: modifiedEvent,
        keycombo: [{ name: modifier, type: 'modifier' }, { name: 'B', type: 'singleCharacter' }],
      })
    )

    assert.not.ok(
      eventMatchesKeycombo({
        event,
        keycombo: [{ name: modifier, type: 'modifier' }, { name: 'B', type: 'singleCharacter' }],
      })
    )
    
    assert.ok(
      eventMatchesKeycombo({
        event,
        keycombo: [{ name: '!' + modifier, type: 'modifier' }, { name: 'B', type: 'singleCharacter' }],
      })
    )
    
    assert.not.ok(
      eventMatchesKeycombo({
        event: modifiedEvent,
        keycombo: [{ name: '!' + modifier, type: 'modifier' }, { name: 'B', type: 'singleCharacter' }],
      })
    )
  }
})

suite(`predicates arrows`, () => {
  // arrow
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!arrow', type: 'arrow' }]
  }))
  
  // vertical
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: 'vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: 'vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: '!vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: '!vertical', type: 'arrow' }]
  }))
  
  // horizontal
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: 'horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: 'horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: '!horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: '!horizontal', type: 'arrow' }]
  }))
  
  // up
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: 'up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: '!up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: '!up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: '!up', type: 'arrow' }]
  }))
  
  // right
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: '!right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: 'right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: '!right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: '!right', type: 'arrow' }]
  }))
  
  // down
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: '!down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: '!down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: 'down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: '!down', type: 'arrow' }]
  }))
  
  // left
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: 'left', type: 'arrow' }]
  }))
})

suite.run()
