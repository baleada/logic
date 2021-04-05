import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Sanitizeable } from '../../src/classes/Sanitizeable'

const suite = createSuite('Sanitizeable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Sanitizeable(
    '<h1>Baleada: a toolkit for building web apps</h1><iframe src="" />',
    options
  )
})

/* Basic */
suite('stores the html', context => {
  const instance = context.setup()

  assert.is(instance.html, '<h1>Baleada: a toolkit for building web apps</h1><iframe src="" />')
})

suite('assignment sets the html', context => {
  const instance = context.setup()
  instance.html = '<h1>Baleada</h1>'

  assert.is(instance.html, '<h1>Baleada</h1>')
})

suite('setHtml sets the html', context => {
  const instance = context.setup()
  instance.setHtml('<h1>Baleada</h1>')

  assert.is(instance.html, '<h1>Baleada</h1>')
})

/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite.run()
