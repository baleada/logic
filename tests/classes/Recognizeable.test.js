import test from 'ava'
import Recognizeable from '../../src/classes/Recognizeable'

const eventTypeStub = 'example',
      eventStub = { type: eventTypeStub }

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Recognizeable(
    [],
    options
  )
})

/* Basic */
test('stores the sequence', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.sequence, [])
})

test('assignment sets the sequence', t => {
  const instance = t.context.setup()
  instance.sequence = [eventStub]

  t.deepEqual(instance.sequence, [eventStub])
})

test('setSequence sets the sequence', t => {
  const instance = t.context.setup()
  instance.setSequence([eventStub])

  t.deepEqual(instance.sequence, [eventStub])
})

/* recognize */
test('first recognize(event) sets status to recognizing', t => {
  const instance = t.context.setup()

  instance.recognize(eventStub)

  t.is(instance.status, 'recognizing')
})

test('recognize(event) calls handler', t => {
  let handlerWasCalled = false

  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: () => (handlerWasCalled = true)
    }
  })

  instance.recognize(eventStub)

  t.is(handlerWasCalled, true)
})

test('handler API recognized() sets status', t => {
  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { recognized }) => recognized()
    }
  })

  instance.recognize(eventStub)

  t.is(instance.status, 'recognized')
})

test('handler API denied() sets status', t => {
  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { denied }) => denied()
    }
  })

  instance.recognize(eventStub)

  t.is(instance.status, 'denied')
})

test('handler API getSequence() gets new sequence', t => {
  let value

  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { getSequence }) => (value = getSequence())
    }
  })

  instance.recognize(eventStub)

  t.deepEqual(value, [eventStub])
})

test('handler API getStatus() gets status', t => {
  let value

  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { getStatus }) => (value = getStatus())
    }
  })

  instance.recognize(eventStub)

  t.is(value, instance.status)
})

test('handler API getLastEvent() gets new last event', t => {
  let value

  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { getLastEvent }) => (value = getLastEvent())
    }
  })

  instance.recognize(eventStub)

  t.deepEqual(value, instance.lastEvent)
})

test('handler API getMetadata() gets metadata', t => {
  let value

  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { getMetadata }) => (value = getMetadata())
    }
  })

  instance.recognize(eventStub)

  t.deepEqual(value, instance.metadata)
})

test('handler API setMetadata() sets metadata', t => {
  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { setMetadata }) => (setMetadata({ path: 'example.path', value: 'baleada' }))
    }
  })

  instance.recognize(eventStub)

  t.is('baleada', instance.metadata.example.path)
})

test('handler API pushMetadata() pushes metadata', t => {
  const instance = t.context.setup({
    handlers: {
      [eventTypeStub]: (event, { pushMetadata }) => (pushMetadata({ path: 'example.path', value: 'baleada' }))
    }
  })

  instance.recognize(eventStub)

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

  instance.recognize(eventStub)

  t.deepEqual(['baleada', 'toolkit'], instance.metadata.example.path)
})

/* status */
test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})

test('status is "recognizing" after recognize(...) is called at least once and handlers did not call recognized or denied', t => {
  const instance = t.context.setup()

  instance.recognize(eventStub)

  t.is(instance.status, 'recognizing')
})

/* method chaining */
test('can method chain', t => {
  const instance = t.context.setup(),
        chained = instance
          .setSequence(['Baleada'])
          .recognize(eventStub)
          .recognize(eventStub)

  t.assert(chained instanceof Recognizeable)
})
