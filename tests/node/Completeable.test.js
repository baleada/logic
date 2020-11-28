import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Completeable } from '../fixtures/index.js'

const suite = createSuite('Completeable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Completeable(
    'Baleada: a toolkit for building web apps',
    options
  )
})

suite('stores the string', context => {
  const instance = context.setup()

  assert.is(instance.string, 'Baleada: a toolkit for building web apps')
})

suite('assignment sets the string', context => {
  const instance = context.setup()
  instance.string = 'Baleada'

  assert.is(instance.string, 'Baleada')
})

suite('setString sets the string', context => {
  const instance = context.setup()
  instance.setString('Baleada')

  assert.is(instance.string, 'Baleada')
})

suite('initial selection is at the end of the string by default', context => {
  const instance = context.setup()

  assert.equal(instance.selection, { start: instance.string.length, end: instance.string.length })
})

suite('initial selection can be customized via options', context => {
  const instance = context.setup({
    initialSelection: { start: 0, end: 0 },
  })

  assert.equal(instance.selection, { start: 0, end: 0 })
})

suite('assignment sets the selection', context => {
  const instance = context.setup()

  instance.selection = { start: 0, end: 0 }

  assert.equal(instance.selection, { start: 0, end: 0 })
})

suite('setSelection sets the selection', context => {
  const instance = context.setup()

  instance.setSelection({ start: 0, end: 0 })

  assert.equal(instance.selection, { start: 0, end: 0 })
})

/* segment */
suite('segments from start to end by default', context => {
  const instance = context.setup()

  assert.is(instance.segment, instance.string)
})

suite('segments from selection start when options.segment.from is "selection"', context => {
  const instance = context.setup({ segment: { from: 'selection' } })

  instance.setSelection({ start: 'Baleada: a tool'.length, end: 0 }) // end is ignored when options.segment.to is default

  assert.is(instance.segment, 'kit for building web apps')
})

suite('segments from divider when options.segment.from is "divider"', context => {
  const instance = context.setup({ segment: { from: 'divider' } })

  instance.setSelection({ start: 'Baleada: a tool'.length, end: 0 }) // end is ignored when options.segment.to is default

  assert.is(instance.segment, 'toolkit for building web apps')
})

suite('segments from start when options.segment.from is "divider" and no divider is found', context => {
  const instance = context.setup({ segment: { from: 'divider' } })

  instance.setSelection({ start: 'Baleada'.length, end: 0 }) // end is ignored when options.segment.to is defau

  assert.is(instance.segment, 'Baleada: a toolkit for building web apps')
})

suite('segments to selection end when options.segment.to is "selection"', context => {
  const instance = context.setup({ segment: { to: 'selection' } })

  instance.setSelection({ start: 0, end: 'Baleada: a tool'.length }) // start is ignored when options.segment.from is default

  assert.is(instance.segment, 'Baleada: a tool')
})

suite('segments to divider when options.segment.to is "divider"', context => {
  const instance = context.setup({ segment: { to: 'divider' } })

  instance.setSelection({ start: 0, end: 'Baleada: a tool'.length }) // start is ignored when options.segment.from is default

  assert.is(instance.segment, 'Baleada: a toolkit')
})

suite('segments to end when options.segment.to is "divider" and no divider is found', context => {
  const instance = context.setup({ segment: { to: 'divider' } })

  instance.setSelection({ start: 0, end: 'Baleada: a toolkit for building web a'.length }) // start is ignored when options.segment.from is default

  assert.is(instance.segment, 'Baleada: a toolkit for building web apps')
})

suite('complete(completion) correctly inserts completion when all options are defaults', context => {
  const instance = context.setup()

  instance.complete('Baleada')

  assert.is(instance.string, 'Baleada')
})

suite('complete(completion) correctly inserts completion when options.segment.from is "selection"', context => {
  const instance = context.setup({ segment: { from: 'selection' } })

  // end is ignored when options.segment.to is default
  // instance.segment is 'kit for building web apps' after this
  instance.setSelection({ start: 'Baleada: a tool'.length, end: 0 })

  instance.complete('kit')

  assert.is(instance.string, 'Baleada: a toolkit')
})

suite('complete(completion) correctly inserts completion when options.segment.from is "divider"', context => {
  const instance = context.setup({ segment: { from: 'divider' } })

  // end is ignored when options.segment.to is default
  // instance.segment is 'toolkit for building web apps' after this
  instance.setSelection({ start: 'Baleada: a tool'.length, end: 0 })

  instance.complete('toolkit')

  assert.is(instance.string, 'Baleada: a toolkit')
})

suite('complete(completion) correctly inserts completion when options.segment.to is "selection"', context => {
  const instance = context.setup({ segment: { to: 'selection' } })

  // start is ignored when options.segment.from is default
  // instance.segment is 'Baleada: a tool' after this
  instance.setSelection({ start: 0, end: 'Baleada: a tool'.length }) // start is ignored when options.segment.from is default

  instance.complete('tool')

  assert.is(instance.string, 'toolkit for building web apps')
})

suite('complete(completion) correctly inserts completion when options.segment.to is "divider"', context => {
  const instance = context.setup({ segment: { to: 'divider' } })

  // start is ignored when options.segment.from is default
  // instance.segment is 'Baleada: a toolkit' after this
  instance.setSelection({ start: 0, end: 'Baleada: a tool'.length }) // start is ignored when options.segment.from is default

  instance.complete('toolkit')

  assert.is(instance.string, 'toolkit for building web apps')
})

suite('complete(completion, options) correctly computes new selection when options.newSelection is the default "completionEnd"', context => {
  const instance = context.setup()

  instance.complete('Baleada')

  assert.equal(instance.selection, { start: 'Baleada'.length, end: 'Baleada'.length })
})

suite('complete(completion, options) correctly computes new selection when options.newSelection is "completion"', context => {
  const instance = context.setup()

  instance.complete('Baleada', { newSelection: 'completion' })

  assert.equal(instance.selection, { start: 0, end: 'Baleada'.length })
})

suite('complete(completion, options) correctly computes new selection when options.newSelection is "completion" and segment is not start to end', context => {
  const instance = context.setup({ segment: { from: 'divider', to: 'divider' } })

  // instance.segment is 'toolkit for' after this
  instance.setSelection({ start: 'Baleada: a tool'.length, end: 'Baleada: a toolkit f'.length }) // start is ignored when options.segment.from is default

  // instance.string is 'Baleada: a t00lk1t 4 building web apps' after this
  instance.complete('t00lk1t 4', { newSelection: 'completion' })

  assert.equal(instance.selection, { start: 'Baleada: a '.length, end: 'Baleada: a t00lk1t 4'.length })
})


/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite('status is "completed" after complete(...) is called at least once', context => {
  const instance = context.setup()

  instance.complete('Baleada')

  assert.is(instance.status, 'completed')
})

/* method chaining */
suite('can chain its public methods', context => {
  const instance = context.setup(),
        chained = instance
          .setString('Baleada: a toolkit')
          .setSelection({ start: 0, end: 0 })
          .complete('Baleada: a toolkit for building web apps')

  assert.ok(chained instanceof Completeable)
})

suite.run()
