import test from 'ava'
import Completable from '../src/libraries/Completable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Completable('Baleada: a toolkit for building web apps', options)
})

/* Basic tests */
test('stores the string', t => {
  const completable = t.context.setup()

  t.is(
    completable.string,
    'Baleada: a toolkit for building web apps'
  )
})

test('sets the string', t => {
  const completable = t.context.setup()

  completable.setString('Baleada')

  t.is(
    completable.string,
    'Baleada'
  )
})

test('starting position is the length of the string', t => {
  const completable = t.context.setup()

  t.is(
    completable.position,
    completable.string.length
  )
})

test('sets the position', t => {
  const completable = t.context.setup()

  completable.setPosition('Baleada: a toolkit'.length)

  t.is(
    completable.position,
    'Baleada: a toolkit'.length
  )
})

/* segment tests */
test('correctly segments when all options are defaults', t => {
  const completable = t.context.setup()

  t.is(
    completable.segment,
    completable.string
  )
})

test('correctly segments when segmentsFromDivider is true AND other options are defaults', t => {
  const completable = t.context.setup({
    segmentsFromDivider: true,
  })

  completable.setPosition('Baleada: a toolkit'.length)

  t.is(
    completable.segment,
    'toolkit for building web apps'
  )
})

test('correctly segments when segmentsToPosition is true AND other options are defaults', t => {
  const completable = t.context.setup({
    segmentsToPosition: true,
  })

  completable.setPosition('Baleada: a toolkit'.length)

  t.is(
    completable.segment,
    'Baleada: a toolkit'
  )
})

test('correctly segments when segmentsFromDivider and segmentsToPosition are true AND other options are defaults', t => {
  const completable = t.context.setup({
    segmentsFromDivider: true,
    segmentsToPosition: true,
  })

  completable.setPosition('Baleada: a toolkit'.length)

  t.is(
    completable.segment,
    'toolkit'
  )
})

test('correctly segments when segmentsFromDivider is true AND divider is set to /:/ AND other options are defaults', t => {
  const completable = t.context.setup({
    divider: /:/,
    segmentsFromDivider: true
  })

  t.is(
    completable.segment,
    ' a toolkit for building web apps'
  )
})

/* complete tests (string) */
test('correctly completes the string when all options are defaults', t => {
  const completable = t.context.setup()
  completable.complete('Baleada')

  t.is(
    completable.string,
    'Baleada'
  )
})

test('correctly completes the string when segmentsFromDivider is true AND other options are defaults', t => {
  const completable = t.context.setup({
    segmentsFromDivider: true,
  })
  completable.complete('applications')

  t.is(
    completable.string,
    'Baleada: a toolkit for building web applications'
  )
})

test('correctly completes the string when segmentsToPosition is true AND other options are defaults', t => {
  const completable = t.context.setup({
    segmentsToPosition: true,
  })
  completable.setPosition('Baleada: a toolkit'.length)
  completable.complete('Buena Baleada: a toolkit')

  t.is(
    completable.string,
    'Buena Baleada: a toolkit for building web apps'
  )
})

test('correctly completes the string when segmentsFromDivider is true AND segmentsToPosition is true AND other options are defaults', t => {
  const completable = t.context.setup({
    segmentsFromDivider: true,
    segmentsToPosition: true
  })
  completable.complete('Baleada')

  t.is(
    completable.string,
    'Baleada: a toolkit for building web Baleada'
  )
})

/* complete tests (position) */
test('correctly updates position when all options are defaults', t => {
  const completable = t.context.setup()
  completable.complete('Baleada')

  t.is(
    completable.position,
    'Baleada'.length
  )
})

test('correctly updates position when segmentsFromDivider is true AND other options are defaults', t => {
  const completable = t.context.setup({
    segmentsFromDivider: true,
  })
  completable.complete('applications')

  t.is(
    completable.position,
    'Baleada: a toolkit for building web applications'.length
  )
})

test('correctly updates position when segmentsToPosition is true AND other options are defaults', t => {
  const completable = t.context.setup({
    segmentsToPosition: true,
  })
  completable.setPosition('Baleada: a toolkit'.length)
  completable.complete('Buena Baleada: a toolkit')

  t.is(
    completable.position,
    'Buena Baleada: a toolkit'.length
  )
})

test('correctly updates position when segmentsFromDivider is true AND segmentsToPosition is true AND other options are defaults', t => {
  const completable = t.context.setup({
    segmentsFromDivider: true,
    segmentsToPosition: true
  })
  completable.complete('Baleada')

  t.is(
    completable.position,
    'Baleada: a toolkit for building web Baleada'.length
  )
})

test('does not update position when positionsAfterCompletion is false', t => {
  const completable = t.context.setup({
    positionsAfterCompletion: false
  })
  const originalPosition = completable.position
  completable.complete('Baleada')

  t.is(
    completable.position,
    originalPosition
  )
})
