import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Drawable, DrawableOptions } from '../../src/classes/Drawable'
import { getStroke } from 'perfect-freehand'

const suite = createSuite<{ setup: (options?: DrawableOptions) => Drawable}>('Drawable')

suite.before.each(context => {
  context.setup = (options = {}) => new Drawable(
    [],
    options
  )
})

suite(`stores the stroke`, context => {
  const instance = context.setup()

  assert.equal(instance.stroke, [])
})

suite(`assignment sets the stroke`, context => {
  const instance = context.setup()
  instance.stroke = [[1, 1]]

  assert.equal(instance.stroke, [[1, 1]])
})

suite(`setStroke sets the stroke`, context => {
  const instance = context.setup()
  instance.setStroke([[1, 1]])

  assert.equal(instance.stroke, [[1, 1]])
})

suite(`draw(...) draws the stroke`, context => {
  const value = context.setup().draw([[1, 1]]).stroke,
        expected = getStroke([[1, 1]])

  assert.equal(value, expected)
})

suite(`d gets the SVG d`, context => {
  const value = context.setup().draw([[1, 1], [10, 10]]).d,
        expected = 'MZ'

  assert.equal(value[0] + value.at(-1), expected)
})

suite(`respects toD option`, context => {
  const value = context.setup({ toD: () => 'M 0 0' }).d,
        expected = 'M 0 0'

  assert.equal(value, expected)
})


suite(`status is 'ready' after construction`, context => {
  const value = context.setup().status,
        expected = 'ready'

  assert.ok(value, expected)
})

suite(`status is 'drawn' after draw(...)`, context => {
  const value = context.setup().draw([[1, 1]]).status,
        expected = 'drawn'

  assert.ok(value, expected)
})

suite.run()
