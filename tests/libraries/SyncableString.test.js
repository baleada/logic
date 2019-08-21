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
  const instance = t.context.setup()

  await page.exposeFunction('setup', t.context.setup)
  await page.exposeFunction('instanceType', instance => instance.type())

  const value = await page.evaluate(`(async () => {
    const instance = await window.setup()
    return await window.instanceType(instance)
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
