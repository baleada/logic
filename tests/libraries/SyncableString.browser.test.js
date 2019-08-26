import test from 'ava'
import withPage from '../test-utils/withPage'

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

test('correctly gets formattedEditableState', withPage, 'Syncable', async (t, page) => {
  const value = await page.evaluate(() => {
    const instance = new Syncable('Baleada')
    return instance.formattedEditableState
  })

  t.is(value, 'Baleada')
})

/* [method] */
