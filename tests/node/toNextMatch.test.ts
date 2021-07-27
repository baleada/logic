import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toNextMatch } from '../../src/classes/Completeable'

const suite = createSuite('toNextMatch')

suite('computes match index correctly', context => {
  const string = 'Baleada: a toolkit for building web apps',
        re = /\s/,
        from = 'Baleada: a tool'.length -1, // Starting from the 'l' in 'toolkit'
        value = toNextMatch({ string, re, from })

  assert.is(value, 'Baleada: a toolkit '.length - 1)
})

suite('computes no match index correctly', context => {
  const string = 'Baleada: a toolkit for building web apps',
        re = /stub/,
        from = 'Baleada: a tool'.length -1, // Starting from the 'l' in 'toolkit'
        value = toNextMatch({ string, re, from })

  assert.is(value, -1)
})

suite.run()
