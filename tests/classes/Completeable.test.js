import test from 'ava'
import Completeable from '../../src/classes/Completeable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Completeable(
    'Baleada: a toolkit for building web apps',
    options
  )
})

test('stores the string', t => {
  const instance = t.context.setup()

  t.is(instance.string, 'Baleada: a toolkit for building web apps')
})

test('assignment sets the string', t => {
  const instance = t.context.setup()
  instance.string = 'Baleada'

  t.is(instance.string, 'Baleada')
})

test('setString sets the string', t => {
  const instance = t.context.setup()
  instance.setString('Baleada')

  t.is(instance.string, 'Baleada')
})

test('initial selection is at the end of the string by default', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.selection, { start: instance.string.length, end: instance.string.length })
})

test('initial selection can be customized via options', t => {
  const instance = t.context.setup({
    initialSelection: { start: 0, end: 0 },
  })

  t.deepEqual(instance.selection, { start: 0, end: 0 })
})

test('assignment sets the selection', t => {
  const instance = t.context.setup()

  instance.selection = { start: 0, end: 0 }

  t.deepEqual(instance.selection, { start: 0, end: 0 })
})

test('setSelection sets the selection', t => {
  const instance = t.context.setup()

  instance.setSelection({ start: 0, end: 0 })

  t.deepEqual(instance.selection, { start: 0, end: 0 })
})

/* segment */
test('segments from start to end by default', t => {
  const instance = t.context.setup()

  t.is(instance.segment, instance.string)
})

test('segments from selection start when options.segment.from is "selection"', t => {
  const instance = t.context.setup({ segment: { from: 'selection' } })

  instance.setSelection({ start: 'Baleada: a tool'.length, end: 0 }) // end is ignored when options.segment.to is default

  t.is(instance.segment, 'kit for building web apps')
})

test('segments from divider when options.segment.from is "divider"', t => {
  const instance = t.context.setup({ segment: { from: 'divider' } })

  instance.setSelection({ start: 'Baleada: a tool'.length, end: 0 }) // end is ignored when options.segment.to is default

  t.is(instance.segment, 'toolkit for building web apps')
})

test('segments from start when options.segment.from is "divider" and no divider is found', t => {
  const instance = t.context.setup({ segment: { from: 'divider' } })

  instance.setSelection({ start: 'Baleada'.length, end: 0 }) // end is ignored when options.segment.to is defau

  t.is(instance.segment, 'Baleada: a toolkit for building web apps')
})

test('segments to selection end when options.segment.to is "selection"', t => {
  const instance = t.context.setup({ segment: { to: 'selection' } })

  instance.setSelection({ start: 0, end: 'Baleada: a tool'.length - 1 }) // start is ignored when options.segment.from is default

  t.is(instance.segment, 'Baleada: a tool')
})

test('segments to divider when options.segment.to is "divider"', t => {
  const instance = t.context.setup({ segment: { to: 'divider' } })

  instance.setSelection({ start: 0, end: 'Baleada: a tool'.length }) // start is ignored when options.segment.from is default

  t.is(instance.segment, 'Baleada: a toolkit')
})

test('segments to end when options.segment.to is "divider" and no divider is found', t => {
  const instance = t.context.setup({ segment: { to: 'divider' } })

  instance.setSelection({ start: 0, end: 'Baleada: a toolkit for building web a'.length }) // start is ignored when options.segment.from is default

  t.is(instance.segment, 'Baleada: a toolkit for building web apps')
})

test('complete(completion) correctly inserts completion when all options are defaults', t => {
  const instance = t.context.setup()

  instance.complete('Baleada')

  t.is(instance.string, 'Baleada')
})

test('complete(completion) correctly inserts completion when options.segment.from is "selection"', t => {
  const instance = t.context.setup({ segment: { from: 'selection' } })

  // end is ignored when options.segment.to is default
  // instance.segment is 'kit for building web apps' after this
  instance.setSelection({ start: 'Baleada: a tool'.length, end: 0 })

  instance.complete('kit')

  t.is(instance.string, 'Baleada: a toolkit')
})

test('complete(completion) correctly inserts completion when options.segment.from is "divider"', t => {
  const instance = t.context.setup({ segment: { from: 'divider' } })

  // end is ignored when options.segment.to is default
  // instance.segment is 'toolkit for building web apps' after this
  instance.setSelection({ start: 'Baleada: a tool'.length, end: 0 })

  instance.complete('toolkit')

  t.is(instance.string, 'Baleada: a toolkit')
})

test('complete(completion) correctly inserts completion when options.segment.to is "selection"', t => {
  const instance = t.context.setup({ segment: { to: 'selection' } })

  // start is ignored when options.segment.from is default
  // instance.segment is 'Baleada: a tool' after this
  instance.setSelection({ start: 0, end: 'Baleada: a tool'.length - 1 }) // start is ignored when options.segment.from is default

  instance.complete('tool')

  t.is(instance.string, 'toolkit for building web apps')
})

test('complete(completion) correctly inserts completion when options.segment.to is "divider"', t => {
  const instance = t.context.setup({ segment: { to: 'divider' } })

  // start is ignored when options.segment.from is default
  // instance.segment is 'Baleada: a toolkit' after this
  instance.setSelection({ start: 0, end: 'Baleada: a tool'.length }) // start is ignored when options.segment.from is default

  instance.complete('toolkit')

  t.is(instance.string, 'toolkit for building web apps')
})

test('complete(completion, options) correctly computes new selection when options.newSelection is the default "completionEnd"', t => {
  const instance = t.context.setup()

  instance.complete('Baleada')

  t.deepEqual(instance.selection, { start: 'Baleada'.length, end: 'Baleada'.length })
})

test('complete(completion, options) correctly computes new selection when options.newSelection is "completion"', t => {
  const instance = t.context.setup()

  instance.complete('Baleada', { newSelection: 'completion' })

  t.deepEqual(instance.selection, { start: 0, end: 'Baleada'.length })
})

test('complete(completion, options) correctly computes new selection when options.newSelection is "completion" and segment is not start to end', t => {
  const instance = t.context.setup({ segment: { from: 'divider', to: 'divider' } })

  // instance.segment is 'toolkit for' after this
  instance.setSelection({ start: 'Baleada: a tool'.length, end: 'Baleada: a toolkit f'.length }) // start is ignored when options.segment.from is default

  // instance.string is 'Baleada: a t00lk1t 4 building web apps' after this
  instance.complete('t00lk1t 4', { newSelection: 'completion' })

  t.deepEqual(instance.selection, { start: 'Baleada: a '.length, end: 'Baleada: a t00lk1t 4'.length })
})


/* status */
test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})

test('status is "completed" after complete(...) is called at least once', t => {
  const instance = t.context.setup()

  instance.complete('Baleada')

  t.is(instance.status, 'completed')
})

test('status is "set" after setString(...) is called', t => {
  const instance = t.context.setup()

  instance.setString('Baleada')

  t.is(instance.status, 'set')
})

/* method chaining */
test('can chain its public methods', t => {
  const instance = t.context.setup(),
        chained = instance
          .setString('Baleada: a toolkit')
          .setSelection({ start: 0, end: 0 })
          .complete('Baleada: a toolkit for building web apps')

  t.assert(chained instanceof Completeable)
})
