import test from 'ava'
import Completable from '../../src/libraries/Completable'
import enumerable from '../fixtures/enumerable.json'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Completable('Baleada: a toolkit for building web apps', options)
})

/* Basic */
test('enumerables match intended enumerables', t => {
  const instance = t.context.setup()

  t.is(enumerable.Completable.every(key => Object.keys(instance).includes(key)), true)
})

test('stores the string', t => {
  const instance = t.context.setup()

  t.is(instance.string, 'Baleada: a toolkit for building web apps')
})

test('setString sets the string', t => {
  const instance = t.context.setup()

  instance.setString('Baleada')

  t.is(instance.string, 'Baleada')
})

test('initial position is the length of the string', t => {
  const instance = t.context.setup()

  t.is(instance.position, instance.string.length)
})

test('setPosition sets the position', t => {
  const instance = t.context.setup()

  instance.setPosition('Baleada: a toolkit'.length)

  t.is(instance.position, 'Baleada: a toolkit'.length)
})

/* segment */
test('correctly segments when all options are defaults', t => {
  const instance = t.context.setup()

  t.is(instance.segment, instance.string)
})

test('correctly segments when segmentsFromDivider is true AND other options are defaults', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
  })

  instance.setPosition('Baleada: a toolkit'.length)

  t.is(instance.segment, 'toolkit for building web apps')
})

test('correctly segments when segmentsToPosition is true AND other options are defaults', t => {
  const instance = t.context.setup({
    segmentsToPosition: true,
  })

  instance.setPosition('Baleada: a toolkit'.length)

  t.is(instance.segment, 'Baleada: a toolkit')
})

test('correctly segments when segmentsFromDivider and segmentsToPosition are true AND other options are defaults', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
    segmentsToPosition: true,
  })

  instance.setPosition('Baleada: a toolkit'.length)

  t.is(instance.segment, 'toolkit')
})

test('correctly segments when segmentsFromDivider is true AND divider is set to /:/ AND other options are defaults', t => {
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

test('complete(completion) correctly inserts completion when segmentsFromDivider is true AND other options are defaults', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
  })
  instance.complete('applications')

  t.is(instance.string, 'Baleada: a toolkit for building web applications')
})

test('complete(completion) correctly inserts completion when segmentsToPosition is true AND other options are defaults', t => {
  const instance = t.context.setup({
    segmentsToPosition: true,
  })
  instance.setPosition('Baleada: a toolkit'.length)
  instance.complete('Buena Baleada: a toolkit')

  t.is(instance.string, 'Buena Baleada: a toolkit for building web apps')
})

test('complete(completion) correctly inserts completion when segmentsFromDivider is true AND segmentsToPosition is true AND other options are defaults', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
    segmentsToPosition: true
  })
  instance.complete('Baleada')

  t.is(instance.string, 'Baleada: a toolkit for building web Baleada')
})

/* complete position */
test('complete(completion) correctly updates position when all options are defaults', t => {
  const instance = t.context.setup()
  instance.complete('Baleada')

  t.is(instance.position, 'Baleada'.length)
})

test('complete(completion) correctly updates position when segmentsFromDivider is true AND other options are defaults', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
  })
  instance.complete('applications')

  t.is(instance.position, 'Baleada: a toolkit for building web applications'.length)
})

test('complete(completion) correctly updates position when segmentsToPosition is true AND other options are defaults', t => {
  const instance = t.context.setup({
    segmentsToPosition: true,
  })
  instance.setPosition('Baleada: a toolkit'.length)
  instance.complete('Buena Baleada: a toolkit')

  t.is(instance.position, 'Buena Baleada: a toolkit'.length)
})

test('complete(completion) correctly updates position when segmentsFromDivider is true AND segmentsToPosition is true AND other options are defaults', t => {
  const instance = t.context.setup({
    segmentsFromDivider: true,
    segmentsToPosition: true
  })
  instance.complete('Baleada')

  t.is(instance.position, 'Baleada: a toolkit for building web Baleada'.length)
})

test('complete(completion) does not update position when positionsAfterCompletion is false', t => {
  const instance = t.context.setup({
    positionsAfterCompletion: false
  })
  const originalPosition = instance.position
  instance.complete('Baleada')

  t.is(instance.position, originalPosition)
})
