import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createReduceAsync } from '../../src/pipes/array-async'
import { createForEachAsync } from '../../src/pipes/array-async'
import { createMapAsync } from '../../src/pipes/array-async'
import { createFilterAsync } from '../../src/pipes/array-async'
import { createReduce } from '../../src/pipes/array'
import { createRemove } from '../../src/pipes/array'
import { createInsert } from '../../src/pipes/array'
import { createReorder } from '../../src/pipes/array'
import { createSwap } from '../../src/pipes/array'
import { createReplace } from '../../src/pipes/array'
import { createUnique } from '../../src/pipes/array'
import { createSlice } from '../../src/pipes/array'
import { createFilter } from '../../src/pipes/array'
import { createMap } from '../../src/pipes/array'
import { createConcat } from '../../src/pipes/array'
import { createReverse } from '../../src/pipes/array'
import { createSort } from '../../src/pipes/array'
import { createList } from '../../src/pipes/createList'
import { createSlug } from '../../src/pipes/string'
import { createClip } from '../../src/pipes/string'
import { createRename } from '../../src/pipes/map'
import { createEqual } from '../../src/pipes/any'
import { createDeepEqual } from '../../src/pipes/any'
import { createClone } from '../../src/pipes/any'

type Context = {
  array: string[],
  string: string,
  map: Map<string, string>,
}

const suite = createSuite<Context>('pipes')

suite.before(context => {
  context.array = ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito']
  context.string = 'Baleada: a toolkit for building web apps'
  context.map = new Map([['one', 'value'], ['two', 'value']])
})

// ARRAY
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

suite('reduces', ({ array }) => {
  const value = (array => {
          return createReduce<string, number>(
            value => value + 1,
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

suite('createSlice({ from, to }) slices the array from \'from\' to \'to\'', ({ array }) => {
  const value = (array => {
    return createSlice<string>(1, 4)(array)
  })(array)

  assert.equal(value, ['frijoles', 'mantequilla', 'aguacate'])
})

suite('createSlice({ from }) slices the array from \'from\' to end', ({ array }) => {
  const value = (array => {
    return createSlice<string>(1)(array)
  })(array)

  assert.equal(value, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('createMap(map) maps the array', ({ array }) => {
  const value = (array => {
    return createMap<string, number>((_, index) => index)(array)
  })(array)

  assert.equal(value, [0, 1, 2, 3, 4])
})

suite('createFilter(filter) filters the array', ({ array }) => {
  const value = (array => {
    return createFilter<string>(item => item.endsWith('a'))(array)
  })(array)

  assert.equal(value, ['tortilla', 'mantequilla'])
})

suite('createConcat(...arrays) concatenates the arrays', ({ array }) => {
  const value = (array => {
    return createConcat(array, array)(array)
  })(array)

  assert.equal(value, [...array, ...array, ...array])
})

suite('createReverse() reverses the array', ({ array }) => {
  const value = (array => {
    return createReverse<string>()(array)
  })(array)

  assert.equal(value, ['huevito', 'aguacate', 'mantequilla', 'frijoles', 'tortilla'])
})

suite('createSort() sorts the array', ({ array }) => {
  const value = createSort<string>()(array)

  assert.equal(
    value,
    [
      'aguacate',
      'frijoles',
      'huevito',
      'mantequilla',
      'tortilla',
    ]
  )
})

suite('createSort() accepts optional compare', ({ array }) => {
  const value = createSort<string>((a, b) => {
    if (a > b) return -1
    if (a < b) return 1
    return 0
  })(array)

  assert.equal(
    value, [
      'tortilla',
      'mantequilla',
      'huevito',
      'frijoles',
      'aguacate',
    ]
  )
})

suite('createRemove({ index }) removes the item at index from the array', ({ array }) => {
  const value = (array => {
    return createRemove<string>(2)(array)
  })(array)

  assert.equal(value, ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

// suite(`createRemove({ item }) removes item from the array`, ({ array }) => {
//   const value = (array => {
//     return createRemove<string>({ item: 'mantequilla' })(array)
//   })(array)

//   assert.equal(value, ['tortilla', 'frijoles', 'aguacate', 'huevito'])
// })

// suite(`createRemove({ index, item }) ignores item and removes the item at index from the array`, ({ array }) => {
//   const value = (array => {
//     return createRemove<string>({ index: 0, item: 'mantequilla' })(array)
//   })(array)

//   assert.equal(value, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
// })

suite('createInsert({ item, index }) inserts the item at index', ({ array }) => {
  const value = (array => {
    return createInsert('baleada', 2)(array)
  })(array)

  assert.equal(value, ['tortilla', 'frijoles', 'baleada', 'mantequilla', 'aguacate', 'huevito'])
})

// suite(`createInsert({ items, index }) inserts the items at index`, ({ array }) => {
//   const value = (array => {
//     return createInsert({ items: ['baleada', 'toolkit'], index: 2 })(array)
//   })(array)

//   assert.equal(value, ['tortilla', 'frijoles', 'baleada', 'toolkit', 'mantequilla', 'aguacate', 'huevito'])
// })

suite('createReorder({ from: index, to: index }) moves \'from\' index forward to \'to\' index', ({ array }) => {
  const value = (array => {
    return createReorder<string>(1, 3)(array)
  })(array)

  assert.equal(value, ['tortilla', 'mantequilla', 'aguacate', 'frijoles', 'huevito'])
})

suite('createReorder({ from: index, to: index }) moves \'from\' index backward to \'to\' index', ({ array }) => {
  const value = (array => {
    return createReorder<string>(3, 1)(array)
  })(array)

  assert.equal(value, ['tortilla', 'aguacate', 'frijoles', 'mantequilla', 'huevito'])
})

suite('createReorder({ from: { start, itemCount = 1 }, to: index }) moves item from \'start\' forward to \'to\' index', ({ array }) => {
  const value = (array => {
    return createReorder<string>(
      { start: 0, itemCount: 1 },
      1
    )(array)
  })(array)

  assert.equal(value, ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'])
})

suite('createReorder({ from: { start, itemCount != 0 }, to: index }) moves \'itemCount\' items from \'start\' to \'to\' index', ({ array }) => {
  const value = (array => {
    return createReorder<string>(
      { start: 0, itemCount: 2 },
      2
    )(array)
  })(array)

  assert.equal(value, ['mantequilla', 'tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('createSwap({ indices }) swaps the item at the first index with the item at the second index', ({ array }) => {
  const value1 = (array => {
    return createSwap<string>([0, 4])(array)
  })(array)
  assert.equal(
    value1,
    ['huevito', 'frijoles', 'mantequilla', 'aguacate', 'tortilla']
  )
  
  const value2 = (array => {
    return createSwap<string>([4, 0])(array)
  })(array)
  assert.equal(
    value2,
    ['huevito', 'frijoles', 'mantequilla', 'aguacate', 'tortilla']
  )
  
  const value3 = (array => {
    return createSwap<string>([0, 1])(array)
  })(array)
  assert.equal(
    value3,
    ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito']
  )
})

suite('createReplace({ item, index }) replaces the item at index with a new item', ({ array }) => {
  const value = (array => {
    return createReplace(2, 'baleada')(array)
  })(array)

  assert.equal(value, ['tortilla', 'frijoles', 'baleada', 'aguacate', 'huevito'])
})

suite('createUnique() removes duplicates', () => {
  const value = (() => {
    return createUnique<string>()(['baleada', 'baleada', 'toolkit', 'toolkit'])
  })()

  assert.equal(value, ['baleada', 'toolkit'])
})


// MAP
suite('createRename({ from, to }) renames \'from\' name to \'to\' name', ({ map }) => {
  const value = (mapAsArray => {
    const value = createRename<string, string>('one', 'uno')(new Map(mapAsArray))

    return {
      isMap: value instanceof Map,
      array: [...value],
    }
  })([...map])

  assert.ok(value.isMap)
  assert.equal(new Map(value.array), new Map([['uno', 'value'], ['two', 'value']]))
})


// STRING
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

suite('createList(...) creates space-separated list of truthy values', () => {
  const value = (() => {
    return createList()('foo', 0, null, undefined, 'bar', 42, false)
  })()

  assert.is(value, 'foo bar 42')
})


// ANY
suite('createEqual(...) predicates equality', () => {
  ;(() => {
    const value = createEqual(1)(1),
          expected = true

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createEqual(1)(2),
          expected = false

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createEqual({ hello: 'world' })({ hello: 'world' }),
          expected = false

    assert.is(value, expected)
  })()
})

suite('createDeepEqual(...) predicates equality', () => {
  ;(() => {
    const value = createDeepEqual(1)(1),
          expected = true

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createDeepEqual(1)(2),
          expected = false

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createDeepEqual({ hello: 'world' })({ hello: 'world' }),
          expected = true

    assert.is(value, expected)
  })()
})

suite('createClone(...) deep clones', () => {
  const object = { hello: 'world' },
        value = createClone()(object),
        expected = { hello: 'world' }

  assert.equal(value, expected)  
})

suite.run()
