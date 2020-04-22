import test from 'ava'
import nextMatch from '../../src/util/nextMatch'

test('computes match index correctly', t => {
  const string = 'Baleada: a toolkit for building web apps',
        expression = /\s/,
        from = 'Baleada: a tool'.length -1, // Starting from the 'l' in 'toolkit'
        value = nextMatch({ string, expression, from })

  t.is(value, 'Baleada: a toolkit '.length - 1)
})

test('computes no match index correctly', t => {
  const string = 'Baleada: a toolkit for building web apps',
        expression = /poopy/,
        from = 'Baleada: a tool'.length -1, // Starting from the 'l' in 'toolkit'
        value = nextMatch({ string, expression, from })

  t.is(value, -1)
})