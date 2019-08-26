import test from 'ava'
import withPage from '../test-utils/withPage'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable('Baleada', {
    onSync: (state, instance) => instance.setState(state),
    ...options
  })
})

test('editableState is state when all options are defaults', t => {
  const instance = t.context.setup()

  t.is(instance.editableState, instance.state)
})

test('editableState is state when editsFullState is true', t => {
  const instance = t.context.setup({
    editsFullState: true
  })

  t.is(instance.editableState, instance.state)
})

test('type is string when all options are defaults', withPage, async (t, page) => {
  await page.exposeFunction('type', () => {
    const instance = t.context.setup()
    return instance.type
  })

  const value = await page.evaluate(`(async () => {
    console.log('here')
    const result = await window.type()
    console.log(result)
    const json = await result.jsonValue()
    console.log(json)
    return json
  })()`)

  console.log(value)

  t.is(value, 'string')
})

// test('editableStateType is string', t => {
//   const instance = t.context.setup()
//
//   t.is(instance.editableStateType, 'string')
// })




/* [getter] */

/* [method] */
