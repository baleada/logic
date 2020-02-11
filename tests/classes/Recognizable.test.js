import test from 'ava'
import Recognizable from '../../src/classes/Recognizable'

const eventTypeStub = 'example'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Recognizable(
    [],
    options
  )
})

/* Basic */
test('stores the sequence', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.sequence, [])
})

test('setSequence sets the sequence', t => {
  const instance = t.context.setup()
  instance.setSequence([{ type: eventTypeStub }])

  t.deepEqual(instance.sequence, [{ type: eventTypeStub }])
})

/* recognize */
test('first recognize(event) sets status to recognizing', t => {
  const instance = t.context.setup()

  instance.recognize({ type: eventTypeStub })

  t.is(instance.status, 'recognizing')
})

test('recognize(event) calls handler', t => {
  let handlerWasCalled = false

  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: () => (handlerWasCalled = true)
    }
  })

  instance.recognize({ type: eventTypeStub })

  t.is(handlerWasCalled, true)
})

test('handler API recognized() sets status', t => {
  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { recognized }) => recognized()
    }
  })

  instance.recognize({ type: eventTypeStub })

  t.is(instance.status, 'recognized')
})

test('handler API denied() sets status', t => {
  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { denied }) => denied()
    }
  })

  instance.recognize({ type: eventTypeStub })

  t.is(instance.status, 'denied')
})

test('handler API getStatus() gets status', t => {
  let value

  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { getStatus }) => (value = getStatus())
    }
  })

  instance.recognize({ type: eventTypeStub })

  t.is(value, instance.status)
})

test('handler API getLastEvent() gets last event', t => {
  let value

  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { getLastEvent }) => (value = getLastEvent())
    }
  })

  instance.recognize({ type: eventTypeStub })

  t.deepEqual(value, instance.lastEvent)
})

test('handler API getMetadata() gets metadata', t => {
  let value

  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { getMetadata }) => (value = getMetadata())
    }
  })

  instance.recognize({ type: eventTypeStub })

  t.deepEqual(value, instance.metadata)
})

test('handler API setMetadata() sets metadata', t => {
  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { setMetadata }) => (setMetadata({ path: 'example.path', value: 'baleada' }))
    }
  })

  instance.recognize({ type: eventTypeStub })

  t.is('baleada', instance.metadata.example.path)
})

test('handler API pushMetadata() pushes metadata', t => {
  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { pushMetadata }) => (pushMetadata({ path: 'example.path', value: 'baleada' }))
    }
  })

  instance.recognize({ type: eventTypeStub })

  t.deepEqual(['baleada'], instance.metadata.example.path)
})

test('handler API insertMetadata() inserts metadata', t => {
  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { pushMetadata, insertMetadata }) => {
        pushMetadata({ path: 'example.path', value: 'toolkit' })
        insertMetadata({ path: 'example.path', value: 'baleada', index: 0 })
      }
    }
  })

  instance.recognize({ type: eventTypeStub })

  t.deepEqual(['baleada', 'toolkit'], instance.metadata.example.path)
})




test('emitters correctly emit', t => {
  let onDeny = 0,
      onRecognize = 0

  const instance = t.context.setup({
    onRecognize: () => (onRecognize += 1),
    onDeny: () => (onDeny += 1),
    handlers: {
      recognize: (event, { recognized }) => recognized(),
      deny: (event, { denied }) => denied()
    }
  })

  instance.recognize({ type: 'recognize' })
  instance.recognize({ type: 'deny' })

  t.deepEqual({ onRecognize, onDeny }, { onRecognize: 1, onDeny: 1 })
})

/* method chaining */
test('can method chain', t => {
  const instance = t.context.setup(),
        chained = instance
          .setSequence(['Baleada'])
          .recognize({ type: eventTypeStub })
          .recognize({ type: eventTypeStub })

  t.assert(chained instanceof Recognizable)
})
