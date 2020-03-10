import test from 'ava'
import Listenable from '../../src/classes/Listenable'

console.log('WARNING: Listenable requires informal testing')

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Listenable('click', options)
})

test('stores the eventName', t => {
  const instance = t.context.setup()

  t.is(instance.eventName, 'click')
})

test('assignment sets the eventName', t => {
  const instance = t.context.setup()
  instance.eventName = 'keydown'

  t.is(instance.eventName, 'keydown')
})

test('setEventName sets the eventName', t => {
  const instance = t.context.setup()
  instance.setEventName('keydown')

  t.is(instance.eventName, 'keydown')
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
  const oneModifier = new Listenable('cmd+m'),
        twoModifier = new Listenable('shift+cmd+m'),
        threeModifier = new Listenable('shift+alt+cmd+m'),
        fourModifier = new Listenable('shift+ctrl+alt+cmd+m')
  
  t.assert([oneModifier, twoModifier, threeModifier, fourModifier].every(instance => instance._type === 'keycombo'))
})

test('guesses clickcombo type', t => {
  const oneModifier = new Listenable('cmd+click'),
        twoModifier = new Listenable('shift+cmd+click'),
        threeModifier = new Listenable('shift+alt+cmd+click'),
        fourModifier = new Listenable('shift+ctrl+alt+cmd+click')
  
  t.assert([oneModifier, twoModifier, threeModifier, fourModifier].every(instance => instance._type === 'clickcombo'))
})


/* status */
test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})

/* INFORMAL */



// status is "listening" after listen(...) is called at least once
// status is "listening" after some active listeners are stopped
// status is "stopped" after all active listeners are stopped