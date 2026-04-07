import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'

type Context = {
  dbName: string
  storeName: string
}

const suite = withPlaywright(
  createSuite<Context>('Operateable'),
  withPlaywrightOptions
)

suite.before(context => {
  context.dbName = 'baleada'
  context.storeName = 'ingredients'
})

suite('stores the objectStore', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store),
                value = instance.objectStore.name

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return value
        }, { dbName, storeName }),
        expected = storeName

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store),
                value = instance.status

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return value
        }, { dbName, storeName }),
        expected = 'ready'

  assert.is(value, expected)
})

suite('setObjectStore sets the objectStore', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = e => {
              req.result.createObjectStore(storeName)
              req.result.createObjectStore('other')
            }
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          const tx = db.transaction([storeName, 'other'], 'readonly'),
                store = tx.objectStore(storeName),
                other = tx.objectStore('other'),
                instance = new window.Logic.Operateable(store)

          instance.setObjectStore(other)
          const value = instance.objectStore.name

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return value
        }, { dbName, storeName }),
        expected = 'other'

  assert.is(value, expected)
})

suite('assignment sets the objectStore', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => {
              req.result.createObjectStore(storeName)
              req.result.createObjectStore('other')
            }
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          const tx = db.transaction([storeName, 'other'], 'readonly'),
                store = tx.objectStore(storeName),
                other = tx.objectStore('other'),
                instance = new window.Logic.Operateable(store)

          instance.objectStore = other
          const value = instance.objectStore.name

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return value
        }, { dbName, storeName }),
        expected = 'other'

  assert.is(value, expected)
})

suite('status is "operating" during operate()', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([{ operation: 'add', value: { name: 'Tortilla' }, key: 1 }])
          const value = instance.status

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return value
        }, { dbName, storeName }),
        expected = 'operating'

  assert.is(value, expected)
})

suite('status is "operated" after successful operate()', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([{ operation: 'add', value: { name: 'Tortilla' }, key: 1 }])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          const value = instance.status

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return value
        }, { dbName, storeName }),
        expected = 'operated'

  assert.is(value, expected)
})

suite('effect is called with the result of a read operation', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          // First transaction: write a value
          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            tx.objectStore(storeName).add({ name: 'Tortilla' }, 1)
            tx.oncomplete = () => resolve()
          })

          // Second transaction: read it back via operate
          let captured: any = null
          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([
            { operation: 'get', query: 1, effect: result => { captured = result } },
          ])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = { name: 'Tortilla' }

  assert.equal(value, expected)
})

suite('operations run in sequence', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          let captured: any[] | null = null
          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([
            { operation: 'add', value: { name: 'Tortilla' }, key: 1 },
            { operation: 'add', value: { name: 'Beans' }, key: 2 },
            { operation: 'getAll', effect: result => { captured = result } },
          ])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = [{ name: 'Tortilla' }, { name: 'Beans' }]

  assert.equal(value, expected)
})

suite('count effect is called with the count', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          let captured: number | null = null
          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([
            { operation: 'add', value: { name: 'Tortilla' }, key: 1 },
            { operation: 'add', value: { name: 'Beans' }, key: 2 },
            { operation: 'count', effect: result => { captured = result } },
          ])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = 2

  assert.is(value, expected)
})

suite('openCursor effect is called with the cursor', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            tx.objectStore(storeName).add({ name: 'Tortilla' }, 1)
            tx.oncomplete = () => resolve()
          })

          let capturedValue: any = null
          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([
            {
              operation: 'openCursor',
              effect: cursor => { capturedValue = cursor?.value ?? null },
            },
          ])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return capturedValue
        }, { dbName, storeName }),
        expected = { name: 'Tortilla' }

  assert.equal(value, expected)
})

suite('put overwrites an existing record', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          let captured: any = null
          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([
            { operation: 'add', value: { name: 'Tortilla' }, key: 1 },
            { operation: 'put', value: { name: 'Flour Tortilla' }, key: 1 },
            { operation: 'get', query: 1, effect: result => { captured = result } },
          ])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = { name: 'Flour Tortilla' }

  assert.equal(value, expected)
})

suite('delete removes a record', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          let captured: any = 'not-called'
          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([
            { operation: 'add', value: { name: 'Tortilla' }, key: 1 },
            { operation: 'delete', query: 1 },
            { operation: 'get', query: 1, effect: result => { captured = result } },
          ])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = undefined

  assert.is(value, expected)
})

suite('clear removes all records', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          let captured: any[] | null = null
          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([
            { operation: 'add', value: { name: 'Tortilla' }, key: 1 },
            { operation: 'add', value: { name: 'Beans' }, key: 2 },
            { operation: 'clear' },
            { operation: 'getAll', effect: result => { captured = result } },
          ])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = []

  assert.equal(value, expected)
})

// Per-method tests (in class order)

suite('add() adds a record', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          let captured: any = null
          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.add({ value: { name: 'Tortilla' }, key: 1 })

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          await new Promise<void>(resolve => {
            const tx2 = db.transaction(storeName, 'readonly')
            const req = tx2.objectStore(storeName).get(1)
            req.onsuccess = () => { captured = req.result; resolve() }
          })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = { name: 'Tortilla' }

  assert.equal(value, expected)
})

suite('put() adds or replaces a record', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          let captured: any = null
          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([{ operation: 'add', value: { name: 'Tortilla' }, key: 1 }])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          const tx2 = db.transaction(storeName, 'readwrite'),
                store2 = tx2.objectStore(storeName),
                instance2 = new window.Logic.Operateable(store2)

          instance2.put({ value: { name: 'Flour Tortilla' }, key: 1 })

          await new Promise<void>(resolve => { tx2.oncomplete = () => resolve() })

          await new Promise<void>(resolve => {
            const tx3 = db.transaction(storeName, 'readonly')
            const req = tx3.objectStore(storeName).get(1)
            req.onsuccess = () => { captured = req.result; resolve() }
          })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = { name: 'Flour Tortilla' }

  assert.equal(value, expected)
})

suite('get() retrieves a record', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            tx.objectStore(storeName).add({ name: 'Tortilla' }, 1)
            tx.oncomplete = () => resolve()
          })

          let captured: any = null
          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.get({ query: 1, effect: result => { captured = result } })

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = { name: 'Tortilla' }

  assert.equal(value, expected)
})

suite('getKey() retrieves a primary key', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            tx.objectStore(storeName).add({ name: 'Tortilla' }, 1)
            tx.oncomplete = () => resolve()
          })

          let captured: IDBValidKey | undefined = undefined
          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.getKey({ query: IDBKeyRange.only(1), effect: result => { captured = result } })

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = 1

  assert.is(value, expected)
})

suite('getAll() retrieves all records', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            const store = tx.objectStore(storeName)
            store.add({ name: 'Tortilla' }, 1)
            store.add({ name: 'Beans' }, 2)
            tx.oncomplete = () => resolve()
          })

          let captured: any[] | null = null
          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.getAll({ effect: result => { captured = result } })

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = [{ name: 'Tortilla' }, { name: 'Beans' }]

  assert.equal(value, expected)
})

suite('getAllKeys() retrieves all primary keys', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            const store = tx.objectStore(storeName)
            store.add({ name: 'Tortilla' }, 1)
            store.add({ name: 'Beans' }, 2)
            tx.oncomplete = () => resolve()
          })

          let captured: IDBValidKey[] | null = null
          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.getAllKeys({ effect: result => { captured = result } })

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = [1, 2]

  assert.equal(value, expected)
})

suite('delete() removes a record', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            tx.objectStore(storeName).add({ name: 'Tortilla' }, 1)
            tx.oncomplete = () => resolve()
          })

          let captured: any = 'not-called'
          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([
            { operation: 'delete', query: 1 },
            { operation: 'get', query: 1, effect: result => { captured = result } },
          ])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = undefined

  assert.is(value, expected)
})

suite('clear() removes all records', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            const store = tx.objectStore(storeName)
            store.add({ name: 'Tortilla' }, 1)
            store.add({ name: 'Beans' }, 2)
            tx.oncomplete = () => resolve()
          })

          let captured: any[] | null = null
          const tx = db.transaction(storeName, 'readwrite'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.operate([
            { operation: 'clear' },
            { operation: 'getAll', effect: result => { captured = result } },
          ])

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = []

  assert.equal(value, expected)
})

suite('count() counts records', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            const store = tx.objectStore(storeName)
            store.add({ name: 'Tortilla' }, 1)
            store.add({ name: 'Beans' }, 2)
            tx.oncomplete = () => resolve()
          })

          let captured: number | null = null
          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.count({ effect: result => { captured = result } })

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return captured
        }, { dbName, storeName }),
        expected = 2

  assert.is(value, expected)
})

suite('openCursor() opens a cursor', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            tx.objectStore(storeName).add({ name: 'Tortilla' }, 1)
            tx.oncomplete = () => resolve()
          })

          let capturedValue: any = null
          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.openCursor({ effect: cursor => { capturedValue = cursor?.value ?? null } })

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return capturedValue
        }, { dbName, storeName }),
        expected = { name: 'Tortilla' }

  assert.equal(value, expected)
})

suite('openKeyCursor() opens a key cursor', async ({ playwright: { page }, dbName, storeName }) => {
  const value = await page.evaluate(async ({ dbName, storeName }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1)
            req.onupgradeneeded = () => req.result.createObjectStore(storeName)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
          })

          await new Promise<void>(resolve => {
            const tx = db.transaction(storeName, 'readwrite')
            tx.objectStore(storeName).add({ name: 'Tortilla' }, 1)
            tx.oncomplete = () => resolve()
          })

          let capturedKey: IDBValidKey | null = null
          const tx = db.transaction(storeName, 'readonly'),
                store = tx.objectStore(storeName),
                instance = new window.Logic.Operateable(store)

          instance.openKeyCursor({ effect: cursor => { capturedKey = cursor?.key ?? null } })

          await new Promise<void>(resolve => { tx.oncomplete = () => resolve() })

          db.close()
          await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName)
            req.onsuccess = req.onerror = () => resolve()
          })

          return capturedKey
        }, { dbName, storeName }),
        expected = 1

  assert.is(value, expected)
})

suite.run()
