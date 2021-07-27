import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toImplementation } from '../../src/classes/Listenable'
import { keys, leftclicks, modifierAliases, modifiers, rightclicks } from '../fixtures/comboMeta'

const suite = createSuite('toImplementation')

suite(`identifies recognizeable`, context => {
  const value = toImplementation('recognizeable'),
        expected = 'recognizeable'

  assert.is(value, expected)
})

suite(`identifies intersection`, context => {
  const value = toImplementation('intersect'),
        expected = 'intersection'

  assert.is(value, expected)
})

suite(`identifies mutation`, context => {
  const value = toImplementation('mutate'),
        expected = 'mutation'

  assert.is(value, expected)
})

suite(`identifies resize`, context => {
  const value = toImplementation('resize'),
        expected = 'resize'

  assert.is(value, expected)
})

suite(`identifies mediaquery`, context => {
  const value1 = toImplementation('(min-width: 600px)'),
        expected1 = 'mediaquery'

  assert.is(value1, expected1)

  // It's naive
  const value2 = toImplementation('(anything in parentheses)'),
        expected2 = 'mediaquery'

  assert.is(value2, expected2)
})

suite(`identifies idle`, context => {
  const value = toImplementation('idle'),
        expected = 'idle'

  assert.is(value, expected)
})

suite(`identifies visibilitychange`, context => {
  const value = toImplementation('visibilitychange'),
        expected = 'visibilitychange'

  assert.is(value, expected)
})

suite(`identifies core keycombo events`, context => {
  for (const key of keys) {
    const value = toImplementation(key),
          expected = 'keycombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies delimited keycombos`, context => {
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

suite(`identifies negated keys in keycombos`, context => {
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

suite(`identifies core leftclickcombo events`, context => {
  for (const leftclick of leftclicks) {
    const value = toImplementation(leftclick),
          expected = 'leftclickcombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies up to 4 modifiers as leftclickcombo`, context => {
  for (let i = 0; i < modifiers.length; i++) {
    const value = toImplementation(modifiers.slice(0, i + 1).join('+') + '+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  }
})

suite(`identifies negated core leftclickcombo events`, context => {
  for (const leftclick of leftclicks) {
    const value = toImplementation('!' + leftclick),
          expected = 'leftclickcombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies negated modifiers as leftclickcombo`, context => {
  const value = toImplementation('!shift+click'),
        expected = 'leftclickcombo'

  assert.is(value, expected)
})

suite(`identifies aliased modifiers in leftclickcombo`, context => {
  for (const alias of modifierAliases) {
    const value = toImplementation(alias + '+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  }
})

suite(`identifies core rightclickcombo events`, context => {
  for (const rightclick of rightclicks) {
    const value = toImplementation(rightclick),
          expected = 'rightclickcombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies up to 4 modifiers as rightclickcombo`, context => {
  for (let i = 0; i < modifiers.length; i++) {
    const value = toImplementation(modifiers.slice(0, i + 1).join('+') + '+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  }
})

suite(`identifies negated core rightclickcombo events`, context => {
  for (const rightclick of rightclicks) {
    const value = toImplementation('!' + rightclick),
          expected = 'rightclickcombo'
    
    assert.is(value, expected)
  }
})

suite(`identifies negated modifiers as rightclickcombo`, context => {
  const value = toImplementation('!shift+rightclick'),
        expected = 'rightclickcombo'

  assert.is(value, expected)
})

suite(`identifies aliased modifiers in rightclickcombo`, context => {
  for (const alias of modifierAliases) {
    const value = toImplementation(alias + '+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  }
})

suite(`identifies everything else as a custom event`, context => {
  const value = toImplementation('poop'),
        expected = 'event'

  assert.is(value, expected)
})

suite.run()
