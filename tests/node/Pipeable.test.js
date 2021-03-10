import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Pipeable } from '../../src/pipes.js'

const suite = createSuite('Pipeable (node)')

suite(`can pipe`, context => {
  const createPlusOne = () => x => x + 1,
        createTimesTwo = () => x => x * 2,
        value = new Pipeable(0).pipe(
          createPlusOne(),
          createTimesTwo()
        ),
        expected = 2

  assert.is(value, expected)
})

const resolve = () => new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve('stub')
        }, 10)
      })

suite(`can async pipe`, async context => {
  const value = await new Pipeable('stub').pipeAsync(
          async x => x + await resolve(),
          async x => x + await resolve(),
        ),
        expected = 'stubstubstub'

  assert.is(value, expected)
})

suite.run()
