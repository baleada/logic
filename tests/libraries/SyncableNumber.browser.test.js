import test from 'ava'
import withPage from '../test-utils/withPage'

/* Getters */
test('correctly gets type', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable(42)
    return instance.type
  })

  t.is(value, 'number')
})

test('correctly gets editableStateType', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable(42)
    return instance.editableStateType
  })

  t.is(value, 'number')
})

/* Methods */
test('write() emits new state through onSync', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    let value
    const instance = new Syncable(42, { onSync: newState => value = newState })

    instance.setEditableState(420)
    instance.write()

    return value
  })

  t.is(value, 420)
})

test('erase() emits empty string through onSync', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    let value
    const instance = new Syncable(42, { onSync: newState => value = newState })

    instance.erase()

    return value
  })

  t.is(value, 0)
})
