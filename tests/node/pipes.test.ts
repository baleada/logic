import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  createReduceAsync,
  createFilterAsync,
  createForEachAsync,
  createMapAsync,
  createDelete,
  createInsert,
  createReorder,
  createReplace,
  createUnique,
  createSlug,
  createClip,
  createClamp,
  createRename,
} from '../../src/pipes'

const suite = createSuite('pipes (node)')

suite.before.each(context => {
  context.array = ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito']
  context.number = 42
  context.string = 'Baleada: a toolkit for building web apps'
  context.map = new Map([['one', 'value'], ['two', 'value']])
})


// ARRAY
const reduceStub = number => new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve(number)
  }, 10)
})

suite(`async reduces`, async context => {
  const value = await createReduceAsync(
          async value => value + (await reduceStub(1)),
          0,
        )(context.array),
        expected = context.array.length

  assert.is(value, expected)
})

const conditionStub = item => new Promise(function(resolve, reject) {
        setTimeout(item => {
          resolve(item % 2 === 0)
        }, 10, item)
      }),
      filterArrayStub = (new Array(5)).fill().map((_, index) => index)

suite(`async filters`, async context => {
  const value = await createFilterAsync(conditionStub)(filterArrayStub),
        expected = [0, 2, 4]

  assert.equal(value, expected)
})

const forEachResponseStub = 'stub',
      withForEachSuccessStub = () => new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(forEachResponseStub)
        }, 10)
      }),
      forEachArrayStub = (new Array(5)).fill()

suite(`async forEaches`, async context => {
  let value = []

  await createForEachAsync(async () => value.push(await withForEachSuccessStub()))(forEachArrayStub)
  const expected = [
      'stub',
      'stub',
      'stub',
      'stub',
      'stub',
    ]

  assert.equal(value, expected)
})

const mapResponseStub = 'stub',
      withMapSuccessStub = () => new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(mapResponseStub)
        }, 10)
      }),
      mapStub = (new Array(5)).fill()

suite(`async maps`, async context => {
  const value = await createMapAsync(async item => await withMapSuccessStub())(mapStub),
        expected = [
          'stub',
          'stub',
          'stub',
          'stub',
          'stub',
        ]

  assert.equal(value, expected)
})

suite('createDelete({ index }) removes the item at index from the array', context => {
  const value = createDelete({ index: 2 })(context.array)

  assert.equal(value, ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('createDelete({ item }) removes item from the array', context => {
  const value = createDelete({ item: 'mantequilla' })(context.array)

  assert.equal(value, ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('createDelete({ index, item }) ignores item and removes the item at index from the array', context => {
  const value = createDelete({ index: 0, item: 'mantequilla' })(context.array)

  assert.equal(value, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('createInsert({ item, index }) inserts the item at index', context => {
  const value = createInsert({ item: 'baleada', index: 2 })(context.array)

  assert.equal(value, ['tortilla', 'frijoles', 'baleada', 'mantequilla', 'aguacate', 'huevito'])
})

suite('createInsert({ items, index }) inserts the items at index', context => {
  const value = createInsert({ items: ['baleada', 'toolkit'], index: 2 })(context.array)

  assert.equal(value, ['tortilla', 'frijoles', 'baleada', 'toolkit', 'mantequilla', 'aguacate', 'huevito'])
})

suite('createReorder({ from: index, to: index }) moves `from` index forward to `to` index', context => {
  const value = createReorder({ from: 1, to: 3 })(context.array)

  assert.equal(value, ['tortilla', 'mantequilla', 'aguacate', 'frijoles', 'huevito'])
})

suite('createReorder({ from: index, to: index }) moves `from` index backward to `to` index', context => {
  const value = createReorder({ from: 3, to: 1 })(context.array)

  assert.equal(value, ['tortilla', 'aguacate', 'frijoles', 'mantequilla', 'huevito'])
})

suite('createReorder({ from: { start, itemCount = 1 }, to: index }) moves item from `start` forward to `to` index', context => {
  const value = createReorder({
    from: { start: 0, itemCount: 1 },
    to: 1
  })(context.array)

  assert.equal(value, ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'])
})

suite('createReorder({ from: { start, itemCount != 0 }, to: index }) moves `itemCount` items from `start` to `to` index', context => {
  const value = createReorder({
    from: { start: 0, itemCount: 2 },
    to: 2
  })(context.array)

  assert.equal(value, ['mantequilla', 'tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('createReplace({ item, index }) replaces the item at index with a new item', context => {
  const value = createReplace({ item: 'baleada' ,index: 2 })(context.array)

  assert.equal(value, ['tortilla', 'frijoles', 'baleada', 'aguacate', 'huevito'])
})

suite('createUnique() removes duplicates', context => {
  const value = createUnique()(['baleada', 'baleada', 'toolkit', 'toolkit'])

  assert.equal(value, ['baleada', 'toolkit'])
})


// MAP
suite('createRename({ from, to }) renames "from" name to "to" name', context => {
  const value = createRename({ from: 'one', to: 'uno' })(context.map)

  assert.equal(value, new Map([['uno', 'value'], ['two', 'value']]))
})


// STRING
suite(`createClip(text) clips text from a string`, context => {
  const value = createClip('Baleada: ')(context.string),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite(`createClip(regularExpression) clips regularExpression from a string`, context => {
  const value = createClip(/^Baleada: /)(context.string),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite(`createSlug(...) slugs strings`, context => {
  assert.is(createSlug()('I ♥ Dogs'), 'i-love-dogs')
  assert.is(createSlug()('  Déjà Vu!  '), 'deja-vu')
  assert.is(createSlug()('fooBar 123 $#%'), 'foo-bar-123')
  assert.is(createSlug()('я люблю единорогов'), 'ya-lyublyu-edinorogov')
})

suite(`createSlug(...) respects options`, context => {
  const value = createSlug({
    customReplacements: [
      ['@', 'at']
    ]
  })('Foo@unicorn')
  
  assert.is(value, 'fooatunicorn')
})


// NUMBER
suite(`createClamp({ min, max }) handles number between min and max`, context => {
  const value = createClamp({ min: 0, max: 100 })(context.number)

  assert.is(value, 42)
})

suite(`createClamp({ min, max }) handles number below min`, context => {
  const value = createClamp({ min: 50, max: 100 })(context.number)

  assert.is(value, 50)
})

suite(`createClamp({ min, max }) handles number above max`, context => {
  const value = createClamp({ min: 0, max: 36 })(context.number)

  assert.is(value, 36)
})

suite.run()
