import test from 'ava'
import Completable from '../src/libraries/Completable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Completable('Baleada: a toolkit for building web apps', options)
})

test('it stores the string', t => {
  const completable = t.context.setup()

  t.is(
    completable.string,
    'Baleada: a toolkit for building web apps'
  )
})

test('it sets the string', t => {
  const completable = t.context.setup()

  completable.setString('Baleada')

  t.is(
    completable.string,
    'Baleada'
  )
})

test('its starting position is the length of the string', t => {
  const completable = t.context.setup()

  t.is(
    completable.position,
    completable.string.length
  )
})

test('it sets the position', t => {
  const completable = t.context.setup()

  completable.setPosition('Baleada: a toolkit'.length)

  t.is(
    completable.position,
    'Baleada: a toolkit'.length
  )
})

test('it segments the full string by default', t => {
  const completable = t.context.setup()

  t.is(
    completable.segment,
    completable.string
  )
})

test('it segments FROM the last whitespace before the current position TO the end of the string when segmentsFromDivider is true and other options have default values', t => {
  const completable = t.context.setup({
    segmentsFromDivider: true,
  })

  completable.setPosition('Baleada: a toolkit'.length)

  t.is(
    completable.segment,
    'toolkit for building web apps'
  )
})

test('it segments FROM the start of the string TO the current position when segmentsToPosition is true and other options have default values', t => {
  const completable = t.context.setup({
    segmentsToPosition: true,
  })

  completable.setPosition('Baleada: a toolkit'.length)

  t.is(
    completable.segment,
    'Baleada: a toolkit'
  )
})

test('it segments FROM the last whitespace before the current position TO the current position when segmentsFromDivider and segmentsToPosition are true and other options have default values', t => {
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
