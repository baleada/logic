import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('pipes (browser)'),
)

suite.before(context => {
  context.array = ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito']
  context.number = 42
  context.string = 'Baleada: a toolkit for building web apps'
  context.map = new Map([['one', 'value'], ['two', 'value']])
})

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
})

// ARRAY
suite(`async reduces`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(async array => {
          const asyncReduceStub = (number: number): Promise<number> => new Promise(function(resolve, reject) {
            setTimeout(function() {
              resolve(number)
            }, 0)
          })

          // @ts-ignore
          return await window.Logic.createReduceAsync(
            async value => value + (await asyncReduceStub(1)),
            0,
          )(array)
        }, array),
        expected = array.length

  assert.is(value, expected)
})

suite(`reduces`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(async array => {
          // @ts-ignore
          return window.Logic.createReduce(
            value => value + 1,
            0,
          )(array)
        }, array),
        expected = array.length

  assert.is(value, expected)
})

suite(`joins`, async ({ puppeteer: { page }, array }) => {
  const value1 = await page.evaluate(async array => {
    // @ts-ignore
    return window.Logic.createJoin()(array)
  }, array)

  assert.is(value1, 'tortillafrijolesmantequillaaguacatehuevito')
  
  const value2 = await page.evaluate(async array => {
    // @ts-ignore
    return window.Logic.createJoin(' ')(array)
  }, array)

  assert.is(value2, 'tortilla frijoles mantequilla aguacate huevito')
})

suite(`async filters`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const asyncConditionStub: (item: number) => Promise<boolean> = item => new Promise(function(resolve, reject) {
                  setTimeout(item => {
                    resolve(item % 2 === 0)
                  }, 0, item)
                }),
                filterArrayStub = (new Array(5)).fill(undefined).map((_, index) => index)

          // @ts-ignore
          return await window.Logic.createFilterAsync(asyncConditionStub)(filterArrayStub)
        }),
        expected = [0, 2, 4]

  assert.equal(value, expected)
})

suite(`async forEaches`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const forEachResponseStub = 'stub',
                withForEachSuccessStub = () => new Promise(function(resolve, reject) {
                  setTimeout(function() {
                    resolve(forEachResponseStub)
                  }, 0)
                }),
                forEachArrayStub = (new Array(5)).fill(undefined)
            
          let value = []

          // @ts-ignore
          await window.Logic.createForEachAsync(async () => {
            const item = await withForEachSuccessStub()
            value.push(item)
          })(forEachArrayStub)

          return value
        }),
        expected = [
          'stub',
          'stub',
          'stub',
          'stub',
          'stub',
        ]

  assert.equal(value, expected)
})

suite(`async maps`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const mapResponseStub = 'stub',
                withMapSuccessStub = () => new Promise(function(resolve, reject) {
                  setTimeout(function() {
                    resolve(mapResponseStub)
                  }, 0)
                }),
                mapStub = (new Array(5)).fill(undefined)
          
          // @ts-ignore
          return await window.Logic.createMapAsync(async () => await withMapSuccessStub())(mapStub)
        }),
        expected = [
          'stub',
          'stub',
          'stub',
          'stub',
          'stub',
        ]

  assert.equal(value, expected)
})

suite(`createSlice({ from, to }) slices the array from 'from' to 'to'`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createSlice({ from: 1, to: 4 })(array)
  }, array)

  assert.equal(value, ['frijoles', 'mantequilla', 'aguacate'])
})

suite(`createSlice({ from }) slices the array from 'from' to end`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createSlice({ from: 1 })(array)
  }, array)

  assert.equal(value, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite(`createMap(map) maps the array`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createMap((_, index) => index)(array)
  }, array)

  assert.equal(value, [0, 1, 2, 3, 4])
})

suite(`createFilter(filter) filters the array`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createFilter(item => item.endsWith('a'))(array)
  }, array)

  assert.equal(value, ['tortilla', 'mantequilla'])
})

suite(`createConcat(...arrays) concatenates the arrays`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createConcat(array, array)(array)
  }, array)

  assert.equal(value, [...array, ...array, ...array])
})

suite(`createReverse() reverses the array`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createReverse()(array)
  }, array)

  assert.equal(value, ['huevito', 'aguacate', 'mantequilla', 'frijoles', 'tortilla'])
})

suite(`createDelete({ index }) removes the item at index from the array`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createDelete({ index: 2 })(array)
  }, array)

  assert.equal(value, ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite(`createDelete({ item }) removes item from the array`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createDelete({ item: 'mantequilla' })(array)
  }, array)

  assert.equal(value, ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite(`createDelete({ index, item }) ignores item and removes the item at index from the array`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createDelete({ index: 0, item: 'mantequilla' })(array)
  }, array)

  assert.equal(value, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite(`createInsert({ item, index }) inserts the item at index`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createInsert({ item: 'baleada', index: 2 })(array)
  }, array)

  assert.equal(value, ['tortilla', 'frijoles', 'baleada', 'mantequilla', 'aguacate', 'huevito'])
})

suite(`createInsert({ items, index }) inserts the items at index`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createInsert({ items: ['baleada', 'toolkit'], index: 2 })(array)
  }, array)

  assert.equal(value, ['tortilla', 'frijoles', 'baleada', 'toolkit', 'mantequilla', 'aguacate', 'huevito'])
})

suite(`createReorder({ from: index, to: index }) moves 'from' index forward to 'to' index`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createReorder({ from: 1, to: 3 })(array)
  }, array)

  assert.equal(value, ['tortilla', 'mantequilla', 'aguacate', 'frijoles', 'huevito'])
})

suite(`createReorder({ from: index, to: index }) moves 'from' index backward to 'to' index`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createReorder({ from: 3, to: 1 })(array)
  }, array)

  assert.equal(value, ['tortilla', 'aguacate', 'frijoles', 'mantequilla', 'huevito'])
})

suite(`createReorder({ from: { start, itemCount = 1 }, to: index }) moves item from 'start' forward to 'to' index`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createReorder({
      from: { start: 0, itemCount: 1 },
      to: 1
    })(array)
  }, array)

  assert.equal(value, ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'])
})

suite(`createReorder({ from: { start, itemCount != 0 }, to: index }) moves 'itemCount' items from 'start' to 'to' index`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createReorder({
      from: { start: 0, itemCount: 2 },
      to: 2
    })(array)
  }, array)

  assert.equal(value, ['mantequilla', 'tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite(`createSwap({ indices }) swaps the item at the first index with the item at the second index`, async ({ puppeteer: { page }, array }) => {
  const value1 = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createSwap({ indices: [0, 4] })(array)
  }, array)
  assert.equal(
    value1,
    ['huevito', 'frijoles', 'mantequilla', 'aguacate', 'tortilla']
  )
  
  const value2 = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createSwap({ indices: [4, 0] })(array)
  }, array)
  assert.equal(
    value2,
    ['huevito', 'frijoles', 'mantequilla', 'aguacate', 'tortilla']
  )
  
  const value3 = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createSwap({ indices: [0, 1] })(array)
  }, array)
  assert.equal(
    value3,
    ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito']
  )
})

suite(`createReplace({ item, index }) replaces the item at index with a new item`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(array => {
    // @ts-ignore
    return window.Logic.createReplace({ item: 'baleada', index: 2 })(array)
  }, array)

  assert.equal(value, ['tortilla', 'frijoles', 'baleada', 'aguacate', 'huevito'])
})

suite(`createUnique() removes duplicates`, async ({ puppeteer: { page }, array }) => {
  const value = await page.evaluate(() => {
    // @ts-ignore
    return window.Logic.createUnique()(['baleada', 'baleada', 'toolkit', 'toolkit'])
  })

  assert.equal(value, ['baleada', 'toolkit'])
})


// MAP
suite(`createRename({ from, to }) renames 'from' name to 'to' name`, async ({ puppeteer: { page }, map }) => {
  const value = await page.evaluate(mapAsArray => {
    // @ts-ignore
    const value = window.Logic.createRename({ from: 'one', to: 'uno' })(new Map(mapAsArray))

    return {
      isMap: value instanceof Map,
      array: [...value]
    }
  }, [...map])

  assert.ok(value.isMap)
  assert.equal(new Map(value.array), new Map([['uno', 'value'], ['two', 'value']]))
})


// STRING
suite(`createClip(text) clips text from a string`, async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(string => {
          // @ts-ignore
          return window.Logic.createClip('Baleada: ')(string)
        }, string),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite(`createClip(regularExpression) clips regularExpression from a string`, async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(string => {
          // @ts-ignore
          return window.Logic.createClip(/^Baleada: /)(string)
        }, string),
        expected = 'a toolkit for building web apps'

  assert.is(value, expected)
})

suite(`createSlug(...) slugs strings`, async ({ puppeteer: { page } }) => {
  const value1 = await page.evaluate(() => {
    // @ts-ignore
    return window.Logic.createSlug()('I ♥ Dogs')
  })
  assert.is(value1, 'i-love-dogs')

  const value2 = await page.evaluate(() => {
    // @ts-ignore
    return window.Logic.createSlug()('  Déjà Vu!  ')
  })
  assert.is(value2, 'deja-vu')

  const value3 = await page.evaluate(() => {
    // @ts-ignore
    return window.Logic.createSlug()('fooBar 123 $#%')
  })
  assert.is(value3, 'foo-bar-123')

  const value4 = await page.evaluate(() => {
    // @ts-ignore
    return window.Logic.createSlug()('я люблю единорогов')
  })
  assert.is(value4, 'ya-lyublyu-edinorogov')
})

suite(`createSlug(...) respects options`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    // @ts-ignore
    return window.Logic.createSlug({
      customReplacements: [
        ['@', 'at']
      ]
    })('Foo@unicorn')
  })
  
  assert.is(value, 'fooatunicorn')
})


// // NUMBER
suite(`createClamp({ min, max }) handles number between min and max`, async ({ puppeteer: { page }, number }) => {
  const value = await page.evaluate(number => {
    // @ts-ignore
    return window.Logic.createClamp({ min: 0, max: 100 })(number)
  }, number)

  assert.is(value, 42)
})

suite(`createClamp({ min, max }) handles number below min`, async ({ puppeteer: { page }, number }) => {
  const value = await page.evaluate(number => {
    // @ts-ignore
    return window.Logic.createClamp({ min: 50, max: 100 })(number)
  }, number)

  assert.is(value, 50)
})

suite(`createClamp({ min, max }) handles number above max`, async ({ puppeteer: { page }, number }) => {
  const value = await page.evaluate(number => {
    // @ts-ignore
    return window.Logic.createClamp({ min: 0, max: 36 })(number)
  }, number)

  assert.is(value, 36)
})

suite.run()
