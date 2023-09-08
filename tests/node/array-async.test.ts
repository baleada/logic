import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  createReduceAsync,
  createMapAsync,
  createFilterAsync,
 } from '../../src/pipes/array-async'
import { createForEachAsync } from '../../src/links/array-async'

const suite = createSuite<{
  array: string[],
}>('array async')

suite.before(context => {
  context.array = ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito']
})

suite('async reduces', async ({ array }) => {
  const value = await (async array => {
          const asyncReduceStub = (number: number): Promise<number> => new Promise(resolve => {
            setTimeout(function() {
              resolve(number)
            }, 0)
          })

          return await createReduceAsync<string, number>(
            async value => value + (await asyncReduceStub(1)),
            0,
          )(array)
        })(array),
        expected = array.length

  assert.is(value, expected)
})

suite('async filters', async () => {
  const value = await (async () => {
          const asyncConditionStub: (item: number) => Promise<boolean> = item => new Promise(resolve => {
                  setTimeout(item => {
                    resolve(item % 2 === 0)
                  }, 0, item)
                }),
                filterArrayStub = (new Array(5)).fill(undefined).map((_, index) => index)

          return await createFilterAsync(asyncConditionStub)(filterArrayStub)
        })(),
        expected = [0, 2, 4]

  assert.equal(value, expected)
})

suite('async forEaches', async () => {
  const value = await (async () => {
          const forEachResponseStub = 'stub',
                withForEachSuccessStub: (() => Promise<string>) = () => new Promise(resolve => {
                  setTimeout(function() {
                    resolve(forEachResponseStub)
                  }, 0)
                }),
                forEachArrayStub = (new Array(5)).fill(undefined)
            
          let value: string[] = []

          await createForEachAsync(async () => {
            const item = await withForEachSuccessStub()
            value.push(item)
          })(forEachArrayStub)

          return value
        })(),
        expected = [
          'stub',
          'stub',
          'stub',
          'stub',
          'stub',
        ]

  assert.equal(value, expected)
})

suite('async maps', async () => {
  const value = await (async () => {
          const mapResponseStub = 'stub',
                withMapSuccessStub: () => Promise<string> = () => new Promise(resolve => {
                  setTimeout(function() {
                    resolve(mapResponseStub)
                  }, 0)
                }),
                mapStub = (new Array(5)).fill(undefined)
          
          return await createMapAsync(async () => await withMapSuccessStub())(mapStub)
        })(),
        expected = [
          'stub',
          'stub',
          'stub',
          'stub',
          'stub',
        ]

  assert.equal(value, expected)
})

suite.run()
