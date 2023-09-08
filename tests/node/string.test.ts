import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  createSlug,
  createClip,
 } from '../../src/pipes/string'

const suite = createSuite<{
  string: string,
}>('string')

suite.before(context => {
  context.string = 'Baleada: a toolkit for building web apps'
})

suite('createClip(text) clips text from a string', ({ string }) => {
  const value = (string => {
          return createClip('Baleada: ')(string)
        })(string),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite('createClip(regularExpression) clips regularExpression from a string', ({ string }) => {
  const value = (string => {
          return createClip(/^Baleada: /)(string)
        })(string),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite('createSlug(...) slugs strings', () => {
  const value1 = (() => {
    return createSlug()('I ♥ Dogs')
  })()
  assert.is(value1, 'i-love-dogs')

  const value2 = (() => {
    return createSlug()('  Déjà Vu!  ')
  })()
  assert.is(value2, 'deja-vu')

  const value3 = (() => {
    return createSlug()('fooBar 123 $#%')
  })()
  assert.is(value3, 'foo-bar-123')

  const value4 = (() => {
    return createSlug()('я люблю единорогов')
  })()
  assert.is(value4, 'ya-lyublyu-edinorogov')
})

suite('createSlug(...) respects options', () => {
  const value = (() => {
    return createSlug({
      customReplacements: [
        ['@', 'at'],
      ],
    })('Foo@unicorn')
  })()
  
  assert.is(value, 'fooatunicorn')
})

suite.run()
