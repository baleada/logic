import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Recognizeable } from '../../lib/index.js'

const suite = createSuite('Recognizeable (node)')

const eventTypeStub = 'example',
      eventStub = { type: eventTypeStub }

suite.before.each(context => {
  context.setup = (options = {}) => new Recognizeable(
    [],
    options
  )
})

/* Basic */
suite('stores the sequence', context => {
  const instance = context.setup()

  assert.equal(instance.sequence, [])
})

suite('assignment sets the sequence', context => {
  const instance = context.setup()
  instance.sequence = [eventStub]

  assert.equal(instance.sequence, [eventStub])
})

suite('setSequence sets the sequence', context => {
  const instance = context.setup()
  instance.setSequence([eventStub])

  assert.equal(instance.sequence, [eventStub])
})

/* recognize */
suite('first recognize(event) sets status to recognizing', context => {
  const instance = context.setup()

  instance.recognize(eventStub)

  assert.is(instance.status, 'recognizing')
})

suite('recognize(event) calls handler', context => {
  let handlerWasCalled = false

  const instance = context.setup({
    handlers: {
      [eventTypeStub]: () => (handlerWasCalled = true)
    }
  })

  instance.recognize(eventStub)

  assert.is(handlerWasCalled, true)
})

suite('handler API recognized() sets status', context => {
  const instance = context.setup({
    handlers: {
      [eventTypeStub]: ({ recognized }) => recognized()
    }
  })

  instance.recognize(eventStub)

  assert.is(instance.status, 'recognized')
})

suite('handler API denied() sets status', context => {
  const instance = context.setup({
    handlers: {
      [eventTypeStub]: ({ denied }) => denied()
    }
  })

  instance.recognize(eventStub)

  assert.is(instance.status, 'denied')
})

suite('handler API getSequence() gets new sequence', context => {
  let value

  const instance = context.setup({
    handlers: {
      [eventTypeStub]: ({ getSequence }) => (value = getSequence())
    }
  })

  instance.recognize(eventStub)

  assert.equal(value, [eventStub])
})

suite('handler API getStatus() gets status', context => {
  let value

  const instance = context.setup({
    handlers: {
      [eventTypeStub]: ({ getStatus }) => (value = getStatus())
    }
  })

  instance.recognize(eventStub)

  assert.is(value, instance.status)
})

suite('handler API getMetadata() gets metadata', context => {
  let value

  const instance = context.setup({
    handlers: {
      [eventTypeStub]: ({ getMetadata }) => (value = getMetadata())
    }
  })

  instance.recognize(eventStub)

  assert.equal(value, instance.metadata)
})

suite('handler API setMetadata() sets metadata', context => {
  const instance = context.setup({
    handlers: {
      [eventTypeStub]: ({ setMetadata }) => (setMetadata({ path: 'example.path', value: 'baleada' }))
    }
  })

  instance.recognize(eventStub)

  assert.is('baleada', instance.metadata.example.path)
})

suite('handler API pushMetadata() pushes metadata', context => {
  const instance = context.setup({
    handlers: {
      [eventTypeStub]: ({ pushMetadata }) => (pushMetadata({ path: 'example.path', value: 'baleada' }))
    }
  })

  instance.recognize(eventStub)

  assert.equal(['baleada'], instance.metadata.example.path)
})

suite('handler API insertMetadata() inserts metadata', context => {
  const instance = context.setup({
    handlers: {
      [eventTypeStub]: ({ pushMetadata, insertMetadata }) => {
        pushMetadata({ path: 'example.path', value: 'toolkit' })
        insertMetadata({ path: 'example.path', value: 'baleada', index: 0 })
      }
    }
  })

  instance.recognize(eventStub)

  assert.equal(['baleada', 'toolkit'], instance.metadata.example.path)
})

/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite('status is "recognizing" after recognize(...) is called at least once and handlers did not call recognized or denied', context => {
  const instance = context.setup()

  instance.recognize(eventStub)

  assert.is(instance.status, 'recognizing')
})

/* method chaining */
suite('can method chain', context => {
  const instance = context.setup(),
        chained = instance
          .setSequence(['Baleada'])
          .recognize(eventStub)
          .recognize(eventStub)

  assert.ok(chained instanceof Recognizeable)
})

suite.run()
