import test from 'ava'
import toProvisions from '../../src/helpers/toProvisions'
import Completable from '../../src/libraries/Completable'

test('provides properties, getters, and methods', t => {
  const instance = new Completable('Baleada')

  const value = Object.getOwnPropertyNames(
    toProvisions(instance)
  )
  const expected = ['position', 'segment', 'set', 'setPosition', 'complete']

  t.assert(expected.every(property => value.includes(property)))
})
