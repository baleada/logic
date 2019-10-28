import test from 'ava'
import Completable from '../../src/classes/Completable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Completable(
    'Baleada: a toolkit for building web apps',
    options
  )
})

/* Basic */
test('stores the string', t => {
  const instance = t.context.setup()

  t.is(instance.string, 'Baleada: a toolkit for building web apps')
})

test('setString sets the string', t => {
  const instance = t.context.setup()
  instance.setString('Baleada')

  t.is(instance.string, 'Baleada')
})

test('initial location is the length of the string', t => {
  const instance = t.context.setup()

  t.is(instance.location, instance.string.length)
})

test('setLocation sets the location', t => {
  const instance = t.context.setup()

  instance.setLocation('Baleada: a toolkit'.length)

  t.is(instance.location, 'Baleada: a toolkit'.length)
})

/* segment */
test('correctly segments when all options are defaults', t => {
  const instance = t.context.setup()

  t.is(instance.segment, instance.string)
})

test('correctly segments when segmentsFromDivider is true', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
  })

  instance.setLocation('Baleada: a toolkit'.length)

  t.is(instance.segment, 'toolkit for building web apps')
})

test('correctly segments when segmentsToLocation is true', t => {
  const instance = t.context.setup({
    segmentsToLocation: true,
  })

  instance.setLocation('Baleada: a toolkit'.length)

  t.is(instance.segment, 'Baleada: a toolkit')
})

test('correctly segments when segmentsFromDivider and segmentsToLocation are true', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
    segmentsToLocation: true,
  })

  instance.setLocation('Baleada: a toolkit'.length)

  t.is(instance.segment, 'toolkit')
})

test('correctly segments when segmentsFromDivider is true AND divider is set to /:/', t => {
  const instance = t.context.setup({
    divider: /:/,
    segmentsFromDivider: true
  })

  t.is(instance.segment, ' a toolkit for building web apps')
})

/* complete(completion) string */
test('complete(completion) correctly inserts completion when all options are defaults', t => {
  const instance = t.context.setup()

  instance.complete('Baleada')

  t.is(instance.string, 'Baleada')
})

test('complete(completion) correctly inserts completion when segmentsFromDivider is true', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
  })

  instance.complete('applications')

  t.is(instance.string, 'Baleada: a toolkit for building web applications')
})

test('complete(completion) correctly inserts completion when segmentsToLocation is true', t => {
  const instance = t.context.setup({
    segmentsToLocation: true,
  })

  instance.setLocation('Baleada: a toolkit'.length)
  instance.complete('Buena Baleada: a toolkit')

  t.is(instance.string, 'Buena Baleada: a toolkit for building web apps')
})

test('complete(completion) correctly inserts completion when segmentsFromDivider is true AND segmentsToLocation is true', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
    segmentsToLocation: true
  })

  instance.complete('Baleada')

  t.is(instance.string, 'Baleada: a toolkit for building web Baleada')
})

/* complete location */
test('complete(completion) correctly updates location when all options are defaults', t => {
  const instance = t.context.setup()
  instance.complete('Baleada')

  t.is(instance.location, 'Baleada'.length)
})

test('complete(completion) correctly updates location when segmentsFromDivider is true', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
  })
  instance.complete('applications')

  t.is(instance.location, 'Baleada: a toolkit for building web applications'.length)
})

test('complete(completion) correctly updates location when segmentsToLocation is true', t => {
  const instance = t.context.setup({
    segmentsToLocation: true,
  })
  instance.setLocation('Baleada: a toolkit'.length)
  instance.complete('Buena Baleada: a toolkit')

  t.is(instance.location, 'Buena Baleada: a toolkit'.length)
})

test('complete(completion) correctly updates location when segmentsFromDivider is true AND segmentsToLocation is true', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
    segmentsToLocation: true
  })
  instance.complete('Baleada')

  t.is(instance.location, 'Baleada: a toolkit for building web Baleada'.length)
})

test('complete(completion, options) does not update location when locatesAfterCompletion is false', t => {
  const instance = t.context.setup(),
        originalLocation = instance.location
  instance.complete('Baleada', { locatesAfterCompletion: false })

  t.is(instance.location, originalLocation)
})

/* method chaining */
test('can chain its public methods', t => {
  const instance = t.context.setup(),
        chained = instance
          .setString('Baleada: a toolkit')
          .setLocation(instance.string.length)
          .complete('Baleada: a toolkit for building web apps')

  t.assert(chained instanceof Completable)
})
