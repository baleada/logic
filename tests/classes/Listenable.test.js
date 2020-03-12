import test from 'ava'
import Listenable from '../../src/classes/Listenable'

console.log('WARNING: Listenable requires informal testing')

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
  const instance = new Listenable('anything', { recognizeable: { handlers: {} } })

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
        up = new Listenable('up'),
        down = new Listenable('down'),
        left = new Listenable('left'),
        right = new Listenable('right'),
        enter = new Listenable('enter'),
        backspace = new Listenable('backspace'),
        tab = new Listenable('tab'),
        number = new Listenable('1'),
        letter = new Listenable('b')

  const instances = [
    oneModifier, twoModifier, threeModifier, fourModifier,
    up, down, left, right,
    enter, backspace, tab,
    number, letter,
  ]
  
  t.assert(instances.every(instance => instance._type === 'keycombo'))
})

test('guesses leftclickcombo type', t => {
  const leftclick = new Listenable('click'),
        oneModifier = new Listenable('cmd+click'),
        twoModifier = new Listenable('shift+cmd+click'),
        threeModifier = new Listenable('shift+alt+cmd+click'),
        fourModifier = new Listenable('shift+ctrl+alt+cmd+click')
  
  t.assert([leftclick, oneModifier, twoModifier, threeModifier, fourModifier].every(instance => instance._type === 'leftclickcombo'))
})

test('guesses rightclickcombo type', t => {
  const rightclick = new Listenable('cmd+rightclick'),
        oneModifier = new Listenable('cmd+rightclick'),
        twoModifier = new Listenable('shift+cmd+rightclick'),
        threeModifier = new Listenable('shift+alt+cmd+rightclick'),
        fourModifier = new Listenable('shift+ctrl+alt+cmd+rightclick')
  
  t.assert([rightclick, oneModifier, twoModifier, threeModifier, fourModifier].every(instance => instance._type === 'rightclickcombo'))
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