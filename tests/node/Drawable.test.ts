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
        expected = 'M 5.242640687119285 -3.2426406871192848 Q 5.242640687119285 -3.2426406871192848 6.084385365345055 -1.590623738680335 6.926130043570826 0.06139320975861473 6.636084594350516 1.8926681040979474 6.346039145130206 3.72394299843728 5.034991071783743 5.034991071783743 3.7239429984372796 6.346039145130207 1.8926681040979476 6.636084594350516 0.06139320975861562 6.926130043570826 -1.5906237386803341 6.084385365345056 -3.242640687119284 5.242640687119286 -4.084385365345055 3.5906237386803355 -4.926130043570826 1.9386067902413857 -4.636084594350516 0.10733189590205305 -4.346039145130207 -1.7239429984372796 -3.034991071783744 -3.0349910717837427 -1.7239429984372818 -4.346039145130206 0.10733189590204839 -4.636084594350517 1.9386067902413786 -4.9261300435708275 3.5906237386803292 -4.084385365345058 5.24264068711928 -3.242640687119289 5.242640687119282 -3.242640687119287Z'

  assert.equal(value, expected)
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
