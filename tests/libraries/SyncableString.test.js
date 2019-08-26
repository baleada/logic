import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

const defaultOptions = {
  onSync: (state, instance) => instance.setState(state),
}

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable('Baleada', {
    ...defaultOptions,
    ...options
  })
})

/* Getters */
test('editableState is state', t => {
  const instance = t.context.setup()

  t.is(instance.editableState, instance.state)
})

test('editableState is state when editsFullState is true', t => {
  const instance = t.context.setup({
    editsFullState: true
  })

  t.is(instance.editableState, instance.state)
})
