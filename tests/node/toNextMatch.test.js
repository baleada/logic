import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import toNextMatch from '../../src/util/toNextMatch.js'

const suite = createSuite('toNextMatch (node)')

suite('computes match index correctly', context => {
  const string = 'Baleada: a toolkit for building web apps',
        expression = /\s/,
        from = 'Baleada: a tool'.length -1, // Starting from the 'l' in 'toolkit'
        value = toNextMatch({ string, expression, from })

  assert.ok(value, 'Baleada: a toolkit '.length - 1)
})

suite('computes no match index correctly', context => {
  const string = 'Baleada: a toolkit for building web apps',
        expression = /stub/,
        from = 'Baleada: a tool'.length -1, // Starting from the 'l' in 'toolkit'
        value = toNextMatch({ string, expression, from })

  assert.ok(value, -1)
})

suite.run()
