import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toImplementation } from '../../src/classes/Listenable'

const suite = createSuite('toImplementation (node)')

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
  (() => {
    const value = toImplementation('a'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('A'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('0'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation(','),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('<'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('.'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('>'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('/'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('?'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation(';'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation(':'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('\''),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('"'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('['),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('{'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation(']'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('}'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('\\'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('|'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('`'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('~'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('!'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('@'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('#'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('$'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('%'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('^'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('&'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('*'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('('),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation(')'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('-'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('_'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('='),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('+'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('tab'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('space'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('arrow'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('vertical'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('horizontal'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('up'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('right'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('down'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('left'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('enter'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('backspace'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('esc'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('home'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('end'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('pagedown'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('pageup'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('capslock'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('f1'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('f11'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('camera'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('delete'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('cmd'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('command'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('meta'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('shift'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('ctrl'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('control'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('alt'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('option'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();
})

suite(`identifies delimited keycombos`, context => {
  (() => {
    const value = toImplementation('shift+cmd+b'),
          expected = 'keycombo'

    assert.is(value, expected)
  })();

  // Naively allows unlimited keycombo length with repeated keys
  (() => {
    const value = toImplementation('s+u+p+e+r+c+a+l+i+f+r+a+g+i+l+i+s+t+i+c+e+x+p+i+a+l+i+d+o+c+i+o+u+s'),
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
    const value = toImplementation('!s+!u+!p+!e+!r+!c+!a+!l+!i+!f+!r+!a+!g+!i+!l+!i+!s+!t+!i+!c+!e+!x+!p+!i+!a+!l+!i+!d+!o+!c+!i+!o+!u+!s'),
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
  (() => {
    const value = toImplementation('click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
  
  (() => {
    const value = toImplementation('mousedown'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
  
  (() => {
    const value = toImplementation('mouseup'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
  
  (() => {
    const value = toImplementation('dblclick'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
})

suite(`identifies up to 4 modifiers as leftclickcombo`, context => {
  (() => {
    const value = toImplementation('shift+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('meta+shift+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('option+meta+shift+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('control+option+shift+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
})

suite(`identifies negated core leftclickcombo events`, context => {
  (() => {
    const value = toImplementation('!click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
  
  (() => {
    const value = toImplementation('!mousedown'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
  
  (() => {
    const value = toImplementation('!mouseup'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
  
  (() => {
    const value = toImplementation('!dblclick'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
})

suite(`identifies negated modifiers as leftclickcombo`, context => {
  const value = toImplementation('!shift+click'),
        expected = 'leftclickcombo'

  assert.is(value, expected)
})

suite(`identifies aliased modifiers in leftclickcombo`, context => {
  (() => {
    const value = toImplementation('command+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('cmd+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('opt+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('alt+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('ctrl+click'),
          expected = 'leftclickcombo'

    assert.is(value, expected)
  })();
})

suite(`identifies core rightclickcombo events`, context => {
  (() => {
    const value = toImplementation('rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('contextmenu'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();
})

suite(`identifies up to 4 modifiers as rightclickcombo`, context => {
  (() => {
    const value = toImplementation('shift+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('meta+shift+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('option+meta+shift+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('control+option+shift+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();
})

suite(`identifies negated core rightclickcombo events`, context => {
  (() => {
    const value = toImplementation('!rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('!contextmenu'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();
})

suite(`identifies negated modifiers as rightclickcombo`, context => {
  const value = toImplementation('!shift+rightclick'),
        expected = 'rightclickcombo'

  assert.is(value, expected)
})

suite(`identifies aliased modifiers in rightclickcombo`, context => {
  (() => {
    const value = toImplementation('command+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('cmd+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('opt+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('alt+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();

  (() => {
    const value = toImplementation('ctrl+rightclick'),
          expected = 'rightclickcombo'

    assert.is(value, expected)
  })();
})

suite(`identifies everything else as a custom event`, context => {
  (() => {
    const value = toImplementation('poop'),
          expected = 'event'

    assert.is(value, expected)
  })();
})

suite.run()
