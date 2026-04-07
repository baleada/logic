import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'

type Context = {
  name: string,
}

const suite = withPlaywright(
  createSuite<Context>('Transactable'),
  withPlaywrightOptions
)

suite.before(context => {
  context.name = 'baleada'
})

suite('stores the name', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(name => {
          const instance = new window.Logic.Transactable(name)
          return instance.name
        }, name),
        expected = name

  assert.is(value, expected)
})

suite('assignment sets the name', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(name => {
          const instance = new window.Logic.Transactable(name)
          instance.name = 'toolkit'
          return instance.name
        }, name),
        expected = 'toolkit'

  assert.is(value, expected)
})

suite('setName sets the name', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(name => {
          const instance = new window.Logic.Transactable(name)
          instance.setName('toolkit')
          return instance.name
        }, name),
        expected = 'toolkit'

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(name => {
          const instance = new window.Logic.Transactable(name)
          return instance.status
        }, name),
        expected = 'ready'

  assert.is(value, expected)
})

suite('status is "opened" after successful open()', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened' || instance.status === 'openerrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          const status = instance.status
          instance.close()
          await deleteDb(name)
          return status
        }, name),
        expected = 'opened'

  assert.is(value, expected)
})

suite('db is accessible after open()', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          const value = instance.db instanceof IDBDatabase
          instance.close()
          await deleteDb(name)
          return value
        }, name),
        expected = true

  assert.is(value, expected)
})

suite('upgrade callback is called when upgradeneeded', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          let called = false
          const instance = new window.Logic.Transactable(name)
          instance.open({
            version: 1,
            upgradeEffect:() => { called = true },
          })

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened' || instance.status === 'openerrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.close()
          await deleteDb(name)
          return called
        }, name),
        expected = true

  assert.is(value, expected)
})

suite('status is "transacting" during transact effect', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open({
            version: 1,
            upgradeEffect:db => db.createObjectStore('stub'),
          })

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          let statusDuringEffect: string
          instance.transact(
            transaction => {
              statusDuringEffect = instance.status
              transaction.objectStore('stub').get('key')
            },
            { storeNames: ['stub'] }
          )

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'transacted' || instance.status === 'transacterrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.close()
          await deleteDb(name)
          return statusDuringEffect
        }, name),
        expected = 'transacting'

  assert.is(value, expected)
})

suite('status is "transacted" after successful transact()', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open({
            version: 1,
            upgradeEffect:db => db.createObjectStore('stub'),
          })

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.transact(
            transaction => transaction.objectStore('stub').get('key'),
            { storeNames: ['stub'] }
          )

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'transacted' || instance.status === 'transacterrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          const status = instance.status
          instance.close()
          await deleteDb(name)
          return status
        }, name),
        expected = 'transacted'

  assert.is(value, expected)
})

suite('readonly() transacts with readonly mode', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open({
            version: 1,
            upgradeEffect:db => db.createObjectStore('stub'),
          })

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          let mode: string
          instance.readonly(
            transaction => {
              mode = transaction.mode
              transaction.objectStore('stub').get('key')
            },
            { storeNames: ['stub'] }
          )

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'transacted' || instance.status === 'transacterrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.close()
          await deleteDb(name)
          return mode
        }, name),
        expected = 'readonly'

  assert.is(value, expected)
})

suite('readwrite() transacts with readwrite mode', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open({
            version: 1,
            upgradeEffect:db => db.createObjectStore('stub'),
          })

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          let mode: string
          instance.readwrite(
            transaction => {
              mode = transaction.mode
              transaction.objectStore('stub').put('value', 'key')
            },
            { storeNames: ['stub'] }
          )

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'transacted' || instance.status === 'transacterrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.close()
          await deleteDb(name)
          return mode
        }, name),
        expected = 'readwrite'

  assert.is(value, expected)
})

suite('status is "closed" after close()', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.close()
          const status = instance.status
          await deleteDb(name)
          return status
        }, name),
        expected = 'closed'

  assert.is(value, expected)
})

suite('status is "deleted" after delete()', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const instance = new window.Logic.Transactable(name)
          instance.open()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.delete()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'deleted' || instance.status === 'deleteerrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          return instance.status
        }, name),
        expected = 'deleted'

  assert.is(value, expected)
})

// Chaining tests: calling methods synchronously before async ops settle

suite('open().close() → status is "closed"', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open()
          instance.close()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'closed' || instance.status === 'openerrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          const status = instance.status
          await deleteDb(name)
          return status
        }, name),
        expected = 'closed'

  assert.is(value, expected)
})

suite('open().delete() → status is "deleted"', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const instance = new window.Logic.Transactable(name)
          instance.open()
          instance.delete()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'deleted' || instance.status === 'deleteerrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          return instance.status
        }, name),
        expected = 'deleted'

  assert.is(value, expected)
})

suite('open().close().delete() → status is "deleted"', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const instance = new window.Logic.Transactable(name)
          instance.open()
          instance.close()
          instance.delete()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'deleted' || instance.status === 'deleteerrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          return instance.status
        }, name),
        expected = 'deleted'

  assert.is(value, expected)
})

suite('after opened: close() is synchronous, then open() → re-opened', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.close()
          const statusAfterClose = instance.status

          instance.open()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened' || instance.status === 'openerrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          const statusAfterReopen = instance.status
          instance.close()
          await deleteDb(name)
          return { statusAfterClose, statusAfterReopen }
        }, name),
        expected = { statusAfterClose: 'closed', statusAfterReopen: 'opened' }

  assert.equal(value, expected)
})

suite('after opened: delete() then open() → re-opened', async ({ playwright: { page }, name }) => {
  const value = await page.evaluate(async name => {
          const deleteDb = (n: string) => new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(n)
            req.onsuccess = req.onerror = () => resolve()
          })

          const instance = new window.Logic.Transactable(name)
          instance.open()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.delete()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'deleted' || instance.status === 'deleteerrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          instance.open()

          await new Promise<void>(resolve => {
            const check = () => {
              if (instance.status === 'opened' || instance.status === 'openerrored') resolve()
              else setTimeout(check, 10)
            }
            setTimeout(check, 10)
          })

          const status = instance.status
          instance.close()
          await deleteDb(name)
          return status
        }, name),
        expected = 'opened'

  assert.is(value, expected)
})

suite.run()
