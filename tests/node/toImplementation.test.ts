import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toImplementation } from '../../src/classes/Listenable'
import { keys, leftclicks, modifierAliases, modifiers, pointers, rightclicks } from '../fixtures/comboMeta'

const suite = createSuite('toImplementation')

suite(`identifies recognizeable`, () => {
  const value = toImplementation('recognizeable'),
        expected = 'recognizeable'

  assert.is(value, expected)
})

suite(`identifies intersection`, () => {
  const value = toImplementation('intersect'),
        expected = 'intersection'

  assert.is(value, expected)
})

suite(`identifies mutation`, () => {
  const value = toImplementation('mutate'),
        expected = 'mutation'

  assert.is(value, expected)
})

suite(`identifies resize`, () => {
  const value = toImplementation('resize'),
        expected = 'resize'

  assert.is(value, expected)
})

suite(`identifies mediaquery`, () => {
  const value1 = toImplementation('(min-width: 600px)'),
        expected1 = 'mediaquery'

  assert.is(value1, expected1)

  // It's naive
  const value2 = toImplementation('(anything in parentheses)'),
        expected2 = 'mediaquery'

  assert.is(value2, expected2)
})

suite(`identifies idle`, () => {
  const value = toImplementation('idle'),
        expected = 'idle'

  assert.is(value, expected)
})

suite(`identifies documentevent`, () => {
  (() => {
    const value = toImplementation('fullscreenchange'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('fullscreenerror'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('pointerlockchange'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('pointerlockerror'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('readystatechange'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('visibilitychange'),
          expected = 'documentevent'
    
    assert.is(value, expected)
  })();
})

suite(`identifies core keycombo events`, () => {
  for (const key of keys) {
    const value = toImplementation(key),
          expected = 'keycombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies delimited keycombos`, () => {
  (() => {
    const value = toImplementation('shift+cmd+b'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  // Naively allows unlimited keycombo length with repeated keys
  (() => {
    const value = toImplementation('supercalifragilisticexpialidocious'.split('').join('+')),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  // Handles double plus
  (() => {
    const value = toImplementation('shift++'),
          expected = 'keycombo'

    assert.is(value, expected)
  })()
})

suite(`identifies negated keys in keycombos`, () => {
  (() => {
    const value = toImplementation('!b'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('!shift+cmd+b'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('!' + 'supercalifragilisticexpialidocious'.split('').join('+!')),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  // Handles double exclamation
  (() => {
    const value = toImplementation('shift+!!'),
          expected = 'keycombo'

    assert.is(value, expected)
  })()
})

suite(`identifies core leftclickcombo events`, () => {
  for (const leftclick of leftclicks) {
    const value = toImplementation(leftclick),
          expected = 'leftclickcombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies up to 4 modifiers as leftclickcombo`, () => {
  for (let i = 0; i < modifiers.length; i++) {
    const value = toImplementation(modifiers.slice(0, i + 1).join('+') + '+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  }
})

suite(`identifies negated core leftclickcombo events`, () => {
  for (const leftclick of leftclicks) {
    const value = toImplementation('!' + leftclick),
          expected = 'leftclickcombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies negated modifiers as leftclickcombo`, () => {
  const value = toImplementation('!shift+click'),
        expected = 'leftclickcombo'

  assert.is(value, expected)
})

suite(`identifies aliased modifiers in leftclickcombo`, () => {
  for (const alias of modifierAliases) {
    const value = toImplementation(alias + '+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  }
})

suite(`identifies core rightclickcombo events`, () => {
  for (const rightclick of rightclicks) {
    const value = toImplementation(rightclick),
          expected = 'rightclickcombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies up to 4 modifiers as rightclickcombo`, () => {
  for (let i = 0; i < modifiers.length; i++) {
    const value = toImplementation(modifiers.slice(0, i + 1).join('+') + '+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  }
})

suite(`identifies negated core rightclickcombo events`, () => {
  for (const rightclick of rightclicks) {
    const value = toImplementation('!' + rightclick),
          expected = 'rightclickcombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies negated modifiers as rightclickcombo`, () => {
  const value = toImplementation('!shift+rightclick'),
        expected = 'rightclickcombo'

  assert.is(value, expected)
})

suite(`identifies aliased modifiers in rightclickcombo`, () => {
  for (const alias of modifierAliases) {
    const value = toImplementation(alias + '+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  }
})

suite(`identifies core pointercombo events`, () => {
  for (const pointer of pointers) {
    const value = toImplementation(pointer),
          expected = 'pointercombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies up to 4 modifiers as pointercombo`, () => {
  for (let i = 0; i < modifiers.length; i++) {
    const value = toImplementation(modifiers.slice(0, i + 1).join('+') + '+pointerdown'),
          expected = 'pointercombo'

    assert.is(value, expected)
  }
})

suite(`identifies negated core pointercombo events`, () => {
  for (const pointer of pointers) {
    const value = toImplementation('!' + pointer),
          expected = 'pointercombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies negated modifiers as pointercombo`, () => {
  const value = toImplementation('!shift+pointerdown'),
        expected = 'pointercombo'

  assert.is(value, expected)
})

suite(`identifies aliased modifiers in pointercombo`, () => {
  for (const alias of modifierAliases) {
    const value = toImplementation(alias + '+pointerdown'),
          expected = 'pointercombo'

    assert.is(value, expected)
  }
})

suite(`identifies everything else as a custom event`, () => {
  const value = toImplementation('poop'),
        expected = 'event'

  assert.is(value, expected)
})

suite.run()
