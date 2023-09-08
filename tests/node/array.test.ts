import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  createReduce,
  createRemove,
  createInsert,
  createReorder,
  createSwap,
  createReplace,
  createUnique,
  createSlice,
  createFilter,
  createMap,
  createConcat,
  createReverse,
  createSort,
} from '../../src/pipes/array'

const suite = createSuite<{
  array: string[],
}>('array')

suite.before(context => {
  context.array = ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito']
})

// ARRAY
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

suite('createSlice(from, to) slices the array from \'from\' to \'to\'', ({ array }) => {
  const value = (array => {
    return createSlice<string>(1, 4)(array)
  })(array)

  assert.equal(value, ['frijoles', 'mantequilla', 'aguacate'])
})

suite('createSlice(from) slices the array from \'from\' to end', ({ array }) => {
  const value = (array => {
    return createSlice<string>(1)(array)
  })(array)

  assert.equal(value, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('createSlice(...) supports negative indices', ({ array }) => {
  {
    const value = (array => {
      return createSlice<string>(-1)(array)
    })(array)
  
    assert.equal(value, ['huevito'])
  }
  
  {
    const value = (array => {
      return createSlice<string>(1, -1)(array)
    })(array)
  
    assert.equal(value, ['frijoles', 'mantequilla', 'aguacate'])
  }
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
    return createSwap<string>(0, 4)(array)
  })(array)
  assert.equal(
    value1,
    ['huevito', 'frijoles', 'mantequilla', 'aguacate', 'tortilla']
  )
  
  const value2 = (array => {
    return createSwap<string>(4, 0)(array)
  })(array)
  assert.equal(
    value2,
    ['huevito', 'frijoles', 'mantequilla', 'aguacate', 'tortilla']
  )
  
  const value3 = (array => {
    return createSwap<string>(0, 1)(array)
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

suite.run()
