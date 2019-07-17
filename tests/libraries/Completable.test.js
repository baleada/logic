import test from 'ava'
import Completable from '../../src/libraries/Completable'
import enumerable from '../fixtures/enumerable.json'
import isExceptMethods from '../helpers/isExceptMethods'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Completable(
    'Baleada: a toolkit for building web apps',
    {
      onComplete: (string, instance) => t.context.completed = instance.set(string),
      onPosition: (position, instance) => instance.setPosition(position),
      ...options
    }
  )
})

/* Basic */
test('enumerables match intended enumerables', t => {
  const options = {}
  const instance = t.context.setup(options)

  t.is(enumerable.Completable.every(key => Object.keys(instance).includes(key)), true)
})

test('stores the string', t => {
  const options = {}
  const instance = t.context.setup(options)

  t.assert(isExceptMethods(instance, new Completable('Baleada: a toolkit for building web apps', options)))
})

test('set sets the completable instance', t => {
  const options = {}
  let instance = t.context.setup(options)

  instance = instance.set('Baleada')

  t.assert(isExceptMethods(instance, new Completable('Baleada', options)))
})

test('initial position is the length of the string', t => {
  const options = {}
  const instance = t.context.setup(options)

  t.is(instance.position, instance.length)
})

test('setPosition sets the position', t => {
  const options = {}
  const instance = t.context.setup(options)

  instance.setPosition('Baleada: a toolkit'.length)

  t.is(instance.position, 'Baleada: a toolkit'.length)
})

/* segment */
test('correctly segments when all options are defaults', t => {
  const options = {}
  const instance = t.context.setup(options)

  t.is(instance.segment, instance.slice(0, instance.length))
})

test('correctly segments when segmentsFromDivider is true', t => {
  const options = {
    segmentsFromDivider: true,
  }
  const instance = t.context.setup(options)

  instance.setPosition('Baleada: a toolkit'.length)

  t.is(instance.segment, 'toolkit for building web apps')
})

test('correctly segments when segmentsToPosition is true', t => {
  const options = {
    segmentsToPosition: true,
  }
  const instance = t.context.setup(options)

  instance.setPosition('Baleada: a toolkit'.length)

  t.is(instance.segment, 'Baleada: a toolkit')
})

test('correctly segments when segmentsFromDivider and segmentsToPosition are true', t => {
  const options = {
    segmentsFromDivider: true,
    segmentsToPosition: true,
  }
  const instance = t.context.setup(options)

  instance.setPosition('Baleada: a toolkit'.length)

  t.is(instance.segment, 'toolkit')
})

test('correctly segments when segmentsFromDivider is true AND divider is set to /:/', t => {
  const options = {
    divider: /:/,
    segmentsFromDivider: true
  }
  const instance = t.context.setup(options)

  t.is(instance.segment, ' a toolkit for building web apps')
})

/* complete(completion) string */
test('complete(completion) correctly inserts completion when all options are defaults', t => {
  const options = {}
  const instance = t.context.setup(options)
  instance.complete('Baleada')

  t.assert(isExceptMethods(t.context.completed, new Completable('Baleada', options)))
})

test('complete(completion) correctly inserts completion when segmentsFromDivider is true', t => {
  const options = {
    segmentsFromDivider: true,
  }
  const instance = t.context.setup(options)
  instance.complete('applications')

  t.assert(isExceptMethods(t.context.completed, new Completable('Baleada: a toolkit for building web applications', options)))
})

test('complete(completion) correctly inserts completion when segmentsToPosition is true', t => {
  const options = {
    segmentsToPosition: true,
  }
  const instance = t.context.setup(options)
  instance.setPosition('Baleada: a toolkit'.length)
  instance.complete('Buena Baleada: a toolkit')

  t.assert(isExceptMethods(t.context.completed, new Completable('Buena Baleada: a toolkit for building web apps', options)))
})

test('complete(completion) correctly inserts completion when segmentsFromDivider is true AND segmentsToPosition is true', t => {
  const options = {
    segmentsFromDivider: true,
    segmentsToPosition: true
  }
  const instance = t.context.setup(options)
  instance.complete('Baleada')

  t.assert(isExceptMethods(t.context.completed, new Completable('Baleada: a toolkit for building web Baleada', options)))
})

/* complete position */
test('complete(completion) correctly updates position when all options are defaults', t => {
  const options = {}
  const instance = t.context.setup(options)
  instance.complete('Baleada')

  t.is(instance.position, 'Baleada'.length)
})

test('complete(completion) correctly updates position when segmentsFromDivider is true', t => {
  const options = {
    segmentsFromDivider: true,
  }
  const instance = t.context.setup(options)
  instance.complete('applications')

  t.is(instance.position, 'Baleada: a toolkit for building web applications'.length)
})

test('complete(completion) correctly updates position when segmentsToPosition is true', t => {
  const options = {
    segmentsToPosition: true,
  }
  const instance = t.context.setup(options)
  instance.setPosition('Baleada: a toolkit'.length)
  instance.complete('Buena Baleada: a toolkit')

  t.is(instance.position, 'Buena Baleada: a toolkit'.length)
})

test('complete(completion) correctly updates position when segmentsFromDivider is true AND segmentsToPosition is true', t => {
  const options = {
    segmentsFromDivider: true,
    segmentsToPosition: true
  }
  const instance = t.context.setup(options)
  instance.complete('Baleada')

  t.is(instance.position, 'Baleada: a toolkit for building web Baleada'.length)
})

test('complete(completion) does not update position when positionsAfterCompletion is false', t => {
  const options = {
    positionsAfterCompletion: false
  }
  const instance = t.context.setup(options)
  const originalPosition = instance.position
  instance.complete('Baleada')

  t.is(instance.position, originalPosition)
})

/* method chaining */
test('can chain its public methods', t => {
  const options = {}
  const instance = t.context.setup(options)
  const chained = instance
    .set('Baleada: a toolkit')
    .setPosition(instance.length)
    .complete('Baleada: a toolkit for building web apps')

  t.assert(chained instanceof Completable)
})

test('can use its super\'s methods', t => {
  const options = {}
  const instance = t.context.setup(options)
  const chained = instance
    .toLowerCase()

  t.is(chained, 'baleada: a toolkit for building web apps')
})
