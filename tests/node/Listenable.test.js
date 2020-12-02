import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Listenable } from '../../lib/index.js'

const suite = createSuite('Listenable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Listenable('click', options)
})

suite('stores the eventType', context => {
  const instance = context.setup()

  assert.is(instance.eventType, 'click')
})

suite('assignment sets the eventType', context => {
  const instance = context.setup()
  instance.eventType = 'keydown'

  assert.is(instance.eventType, 'keydown')
})

suite('setEventType sets the eventType', context => {
  const instance = context.setup()
  instance.setEventType('keydown')

  assert.is(instance.eventType, 'keydown')
})

suite('activeListeners is empty after construction', context => {
  const instance = context.setup()

  assert.equal(instance.activeListeners, [])
})

/* guess type */
suite('guesses recognizeable type', context => {
  const instance = new Listenable('recognizeable', { recognizeable: { handlers: {} } })

  assert.is(instance._type, 'recognizeable')
})

suite('guesses observation type', context => {
  const intersect = new Listenable('intersect'),
        mutate = new Listenable('mutate'),
        resize = new Listenable('resize')
  
  assert.ok([intersect, mutate, resize].every(instance => instance._type === 'observation'))
})

suite('guesses mediaquery type', context => {
  const instance = new Listenable('(min-width: 600px)')
  
  assert.is(instance._type, 'mediaquery')
})

suite('guesses idle type', context => {
  const instance = new Listenable('idle')
  
  assert.is(instance._type, 'idle')
})

suite('guesses visibilitychange type', context => {
  const instance = new Listenable('visibilitychange')
  
  assert.is(instance._type, 'visibilitychange')
})

suite('guesses keycombo type', context => {
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
  
  assert.ok(instances.every(instance => instance._type === 'keycombo'))
})

suite('guesses leftclickcombo type', context => {
  const leftclick = new Listenable('click'),
        mousedown = new Listenable('mousedown'),
        mouseup = new Listenable('mouseup'),
        oneModifier = new Listenable('cmd+click'),
        twoModifier = new Listenable('shift+cmd+click'),
        threeModifier = new Listenable('shift+alt+cmd+click'),
        fourModifier = new Listenable('shift+ctrl+alt+cmd+click'),
        negatedModifier = new Listenable('!shift+click')
  
  assert.ok([leftclick, mousedown, mouseup, oneModifier, twoModifier, threeModifier, fourModifier, negatedModifier].every(instance => instance._type === 'leftclickcombo'))
})

suite('guesses rightclickcombo type', context => {
  const rightclick = new Listenable('cmd+rightclick'),
        oneModifier = new Listenable('cmd+rightclick'),
        twoModifier = new Listenable('shift+cmd+rightclick'),
        threeModifier = new Listenable('shift+alt+cmd+rightclick'),
        fourModifier = new Listenable('shift+ctrl+alt+cmd+rightclick'),
        negatedModifier = new Listenable('!shift+rightclick')
  
  assert.ok([rightclick, oneModifier, twoModifier, threeModifier, fourModifier, negatedModifier].every(instance => instance._type === 'rightclickcombo'))
})


/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
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

suite.run()
