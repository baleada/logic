import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import array from '../../src/factories/array.js'

const suite = createSuite('array (node)')

suite.before.each(context => {
  context.setup = () => array(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite(`normalizes`, context => {
  const instance = context.setup(),
        value = instance.normalize()

  assert.equal(value, ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

const conditionStub = item => new Promise(function(resolve, reject) {
        setTimeout(item => {
          resolve(item % 2 === 0)
        }, 10, item)
      }),
      filterArrayStub = (new Array(5)).fill().map((_, index) => index)

suite(`async filters`, async context => {
  const value = (await array(filterArrayStub).asyncFilter(conditionStub)).normalize(),
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
  
  await array(forEachArrayStub).asyncForEach(async () => value.push(await withForEachSuccessStub()))
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
  const value = (await array(mapStub).asyncMap(async item => await withMapSuccessStub())).normalize(),
        expected = [
          'stub',
          'stub',
          'stub',
          'stub',
          'stub',
        ]
  
  assert.equal(value, expected)
})

suite('delete({ index }) removes the item at index from the array', context => {
  const instance = context.setup(),
        result = instance.delete({ index: 2 }).normalize()

  assert.equal(result, ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('delete({ item }) removes item from the array', context => {
  const instance = context.setup(),
        result = instance.delete({ item: 'mantequilla' }).normalize()

  assert.equal(result, ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('delete({ index, item }) ignores item and removes the item at index from the array', context => {
  const instance = context.setup(),
        result = instance.delete({ index: 0, item: 'mantequilla' }).normalize()

  assert.equal(result, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('insert({ item, index }) inserts the item at index', context => {
  const instance = context.setup(),
        result = instance.insert({ item: 'baleada', index: 2 }).normalize()

  assert.equal(result, ['tortilla', 'frijoles', 'baleada', 'mantequilla', 'aguacate', 'huevito'])
})

suite('insert({ items, index }) inserts the items at index', context => {
  const instance = context.setup(),
        result = instance.insert({ items: ['baleada', 'toolkit'], index: 2 }).normalize()

  assert.equal(result, ['tortilla', 'frijoles', 'baleada', 'toolkit', 'mantequilla', 'aguacate', 'huevito'])
})

suite('reorder({ from: index, to: index }) moves `from` index forward to `to` index', context => {
  const instance = context.setup(),
        result = instance.reorder({ from: 1, to: 3 }).normalize()

  assert.equal(result, ['tortilla', 'mantequilla', 'aguacate', 'frijoles', 'huevito'])
})

suite('reorder({ from: index, to: index }) moves `from` index backward to `to` index', context => {
  const instance = context.setup(),
        result = instance.reorder({ from: 3, to: 1 }).normalize()

  assert.equal(result, ['tortilla', 'aguacate', 'frijoles', 'mantequilla', 'huevito'])
})

suite('reorder({ from: { start, itemCount = 1 }, to: index }) moves item from `start` forward to `to` index', context => {
  const instance = context.setup(),
        result = instance.reorder({
          from: { start: 0, itemCount: 1 },
          to: 1
        }).normalize()

  assert.equal(result, ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'])
})

suite('reorder({ from: { start, itemCount != 0 }, to: index }) moves `itemCount` items from `start` to `to` index', context => {
  const instance = context.setup(),
        result = instance.reorder({
          from: { start: 0, itemCount: 2 },
          to: 2
        }).normalize()

  assert.equal(result, ['mantequilla', 'tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('replace({ item, index }) replaces the item at index with a new item', context => {
  const instance = context.setup(),
        result = instance.replace({ item: 'baleada' ,index: 2 }).normalize()

  assert.equal(result, ['tortilla', 'frijoles', 'baleada', 'aguacate', 'huevito'])
})

suite('unique() removes duplicates', context => {
  const instance = array(['baleada', 'baleada', 'toolkit', 'toolkit']),
        result = instance.unique().normalize()

  assert.equal(result, ['baleada', 'toolkit'])
})

suite.run()
