import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toPreviousMatch } from '../../src/classes/Completeable'

const suite = createSuite('toPreviousMatch')

suite('computes match index correctly', context => {
  const string = 'Baleada: a toolkit for building web apps',
        re = /\s/,
        from = 'Baleada: a tool'.length -1, // Starting from the 'l' in 'toolkit'
        value = toPreviousMatch({ string, re, from })

  assert.is(value, 'Baleada: a '.length - 1)
})

suite('computes no match index correctly', context => {
  const string = 'Baleada: a toolkit for building web apps',
        re = /stub/,
        from = 'Baleada: a tool'.length -1, // Starting from the 'l' in 'toolkit'
        value = toPreviousMatch({ string, re, from })

  assert.is(value, -1)
})

suite.run()
