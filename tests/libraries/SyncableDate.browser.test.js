import test from 'ava'
import withPage from '../test-utils/withPage'

/* Getters */
test('correctly gets type', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable(new Date('2019-04-20'))
    return instance.type
  })

  t.is(value, 'date')
})

test('correctly gets editableStateType', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable(new Date('2019-04-20'))
    return instance.editableStateType
  })

  t.is(value, 'date')
})

/* Methods */
test('write() emits new state through onSync', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    let value
    const instance = new Syncable(new Date('2019-04-20'), { onSync: newState => value = newState })

    instance.setEditableState(new Date('2019-09-15'))
    instance.write()

    return value
  })

  t.is(value, new Date('2019-09-15'))
})

test('erase() emits empty string through onSync', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    let value
    const instance = new Syncable(new Date('2019-04-20'), { onSync: newState => value = newState })

    instance.erase()

    return value
  })

  t.is(value, new Date())
})
