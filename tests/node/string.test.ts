import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  createSlug,
  createClip,
  createSplit,
  createNumber,
  createResults,
 } from '../../src/pipes/string'

const suite = createSuite<{
  string: string,
}>('string')

suite.before(context => {
  context.string = 'Baleada: a toolkit for building web apps'
})

suite('createClip(text) clips text from a string', ({ string }) => {
  const value = createClip('Baleada: ')(string),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite('createClip(regularExpression) clips regularExpression from a string', ({ string }) => {
  const value = createClip(/^Baleada: /)(string),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite('createSlug(...) slugs strings', () => {
  {
    const value = createSlug()('I ♥ Dogs')
    assert.is(value, 'i-love-dogs')
  }

  {
    const value = createSlug()('  Déjà Vu!  ')
    assert.is(value, 'deja-vu')
  }

  {
    const value = createSlug()('fooBar 123 $#%')
    assert.is(value, 'foo-bar-123')
  }

  {
    const value = createSlug()('я люблю единорогов')
    assert.is(value, 'ya-lyublyu-edinorogov')
  }
})

suite('createSlug(...) respects options', () => {
  const value = createSlug({
    customReplacements: [
      ['@', 'at'],
    ],
  })('Foo@unicorn')
  
  assert.is(value, 'fooatunicorn')
})

suite('createSplit(...) splits strings', () => {
  const value = createSplit({ separator: ' ' })('foo bar baz'),
        expected = ['foo', 'bar', 'baz']
  
  assert.equal(value, expected)
})

suite('createSplit(...) respects limit', () => {
  const value = createSplit({ separator: ' ', limit: 2 })('foo bar baz'),
        expected = ['foo', 'bar']
  
  assert.equal(value, expected)
})

suite('createNumber(...) converts strings to numbers', () => {
  const value = createNumber()('123px'),
        expected = 123
  
  assert.is(value, expected)
})

suite('createNumber(...) respects radix', () => {
  const value = createNumber({ radix: 16 })('0x10'),
        expected = 16
  
  assert.is(value, expected)
})

suite('createResults(...) searches candidates', () => {
  const candidates = ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'],
        value = createResults(candidates)('tortilla')

  assert.ok(value.length > 0)
})

suite.run()
