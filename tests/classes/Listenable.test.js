import test from 'ava'
import { Listenable } from '../../lib/index.esm.js'

console.log('WARNING: Listenable requires browser testing')

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Listenable('click', options)
})

test('stores the eventType', t => {
  const instance = t.context.setup()

  t.is(instance.eventType, 'click')
})

test('assignment sets the eventType', t => {
  const instance = t.context.setup()
  instance.eventType = 'keydown'

  t.is(instance.eventType, 'keydown')
})

test('setEventType sets the eventType', t => {
  const instance = t.context.setup()
  instance.setEventType('keydown')

  t.is(instance.eventType, 'keydown')
})

test('activeListeners is empty after construction', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.activeListeners, [])
})

/* guess type */
test('guesses recognizeable type', t => {
  const instance = new Listenable('recognizeable', { recognizeable: { handlers: {} } })

  t.is(instance._type, 'recognizeable')
})

test('guesses observation type', t => {
  const intersect = new Listenable('intersect'),
        mutate = new Listenable('mutate'),
        resize = new Listenable('resize')
  
  t.assert([intersect, mutate, resize].every(instance => instance._type === 'observation'))
})

test('guesses mediaquery type', t => {
  const instance = new Listenable('(min-width: 600px)')
  
  t.is(instance._type, 'mediaquery')
})

test('guesses idle type', t => {
  const instance = new Listenable('idle')
  
  t.is(instance._type, 'idle')
})

test('guesses visibilitychange type', t => {
  const instance = new Listenable('visibilitychange')
  
  t.is(instance._type, 'visibilitychange')
})

test('guesses keycombo type', t => {
  const oneModifier = new Listenable('cmd+b'),
        twoModifier = new Listenable('shift+cmd+b'),
        threeModifier = new Listenable('shift+alt+cmd+b'),
        fourModifier = new Listenable('shift+ctrl+alt+cmd+b'),
        arrow = new Listenable('arrow'),
        horizontal = new Listenable('horizontal'),
        vertical = new Listenable('vertical'),
        up = new Listenable('up'),
        down = new Listenable('down'),
        left = new Listenable('left'),
        right = new Listenable('right'),
        enter = new Listenable('enter'),
        backspace = new Listenable('backspace'),
        tab = new Listenable('tab'),
        space = new Listenable('space'),
        number = new Listenable('1'),
        letter = new Listenable('b'),
        loneModifier = new Listenable('cmd'),
        multipleNonModifiers = new Listenable('1+a+enter'),
        punctuation = new Listenable('/'),
        plus = new Listenable('+'),
        negatedLetter = new Listenable('!a'),
        negatedNumber = new Listenable('!1'),
        negatedSpecial = new Listenable('!enter'),
        negatedModifier = new Listenable('!shift'),
        negatedArrow = new Listenable('!up'),
        negatedPunctuation = new Listenable('!/'),
        negatedExclamation = new Listenable('!!')

  const instances = [
    oneModifier, twoModifier, threeModifier, fourModifier,
    arrow, horizontal, vertical, up, down, left, right,
    enter, backspace, tab, space,
    number, letter,
    multipleNonModifiers,
    loneModifier,
    punctuation, plus,
    negatedModifier, negatedArrow, negatedSpecial, negatedNumber, negatedLetter, negatedPunctuation, negatedExclamation
  ]
  
  t.assert(instances.every(instance => instance._type === 'keycombo'))
})

test('guesses leftclickcombo type', t => {
  const leftclick = new Listenable('click'),
        mousedown = new Listenable('mousedown'),
        mouseup = new Listenable('mouseup'),
        oneModifier = new Listenable('cmd+click'),
        twoModifier = new Listenable('shift+cmd+click'),
        threeModifier = new Listenable('shift+alt+cmd+click'),
        fourModifier = new Listenable('shift+ctrl+alt+cmd+click'),
        negatedModifier = new Listenable('!shift+click')
  
  t.assert([leftclick, mousedown, mouseup, oneModifier, twoModifier, threeModifier, fourModifier, negatedModifier].every(instance => instance._type === 'leftclickcombo'))
})

test('guesses rightclickcombo type', t => {
  const rightclick = new Listenable('cmd+rightclick'),
        oneModifier = new Listenable('cmd+rightclick'),
        twoModifier = new Listenable('shift+cmd+rightclick'),
        threeModifier = new Listenable('shift+alt+cmd+rightclick'),
        fourModifier = new Listenable('shift+ctrl+alt+cmd+rightclick'),
        negatedModifier = new Listenable('!shift+rightclick')
  
  t.assert([rightclick, oneModifier, twoModifier, threeModifier, fourModifier, negatedModifier].every(instance => instance._type === 'rightclickcombo'))
})


/* status */
test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})

/* INFORMAL */


// keycombo
//   zero modifiers
//   one modifier
//   two modifiers
//   three modifiers
//   four modifiers
//   up
//   down
//   left
//   right
//   enter
//   backspace
//   tab
//   number


// status is "listening" after listen(...) is called at least once
// status is "listening" after some active listeners are stopped
// status is "stopped" after all active listeners are stopped
