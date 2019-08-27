import test from 'ava'
import withPage from '../test-utils/withPage'

/* Getters */
test('correctly gets type', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable(true)
    return instance.type
  })

  t.is(value, 'boolean')
})

test('correctly gets editableStateType', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable(true)
    return instance.editableStateType
  })

  t.is(value, 'boolean')
})

test('correctly gets formattedEditableState', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable(true)
    return instance.formattedEditableState
  })

  t.is(value, true)
})

/* Methods */
test('write() emits new state through onSync', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    let value
    const instance = new Syncable(true, { onSync: newState => value = newState })

    instance.setEditableState(false)
    instance.write()

    return value
  })

  t.is(value, false)
})

test('erase() emits false through onSync', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    let value
    const instance = new Syncable(true, { onSync: newState => value = newState })

    instance.erase()

    return value
  })

  t.is(value, false)
})
