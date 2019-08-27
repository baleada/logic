import test from 'ava'
import withPage from '../test-utils/withPage'

/* Getters */
test('correctly gets type', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable('Baleada')
    return instance.type
  })

  t.is(value, 'string')
})

test('correctly gets editableStateType', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable('Baleada')
    return instance.editableStateType
  })

  t.is(value, 'string')
})

/* Methods */
test('write() emits new state through onSync', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    let value
    const instance = new Syncable('Baleada', { onSync: newState => value = newState })

    instance.setEditableState('Baleada: a toolkit for building web apps')
    instance.write()

    return value
  })

  t.is(value, 'Baleada: a toolkit for building web apps')
})

test('erase() emits empty string through onSync', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    let value
    const instance = new Syncable('Baleada', { onSync: newState => value = newState })

    instance.erase()

    return value
  })

  t.is(value, '')
})
