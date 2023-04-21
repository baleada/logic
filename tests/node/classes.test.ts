import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Animateable } from '../../src/classes/Animateable'
import { Broadcastable } from '../../src/classes/Broadcastable'
import { Compareable } from '../../src/classes/Compareable'
import { Completeable } from '../../src/classes/Completeable'
import { Copyable } from '../../src/classes/Copyable'
import { Delayable } from '../../src/classes/Delayable'
import { Drawable } from '../../src/classes/Drawable'
import { Fetchable } from '../../src/classes/Fetchable'
import { Fullscreenable } from '../../src/classes/Fullscreenable'
import { Grantable } from '../../src/classes/Grantable'
import { Listenable } from '../../src/classes/Listenable'
import { Navigateable } from '../../src/classes/Navigateable'
import { Pickable } from '../../src/classes/Pickable'
import { Recognizeable } from '../../src/classes/Recognizeable'
import { Resolveable } from '../../src/classes/Resolveable'
import { Sanitizeable } from '../../src/classes/Sanitizeable'
import { Searchable } from '../../src/classes/Searchable'
import { Shareable } from '../../src/classes/Shareable'
import { Storeable } from '../../src/classes/Storeable'

const suite = createSuite('classes')

suite('can construct Animateable instance in a server environment', () => {
  const instance = new Animateable([])

  assert.ok(instance instanceof Animateable)
})

suite('can construct Broadcastable instance in a server environment', () => {
  const instance = new Broadcastable([])

  assert.ok(instance instanceof Broadcastable)
})

suite('can construct Compareable instance in a server environment', () => {
  const instance = new Compareable('')

  assert.ok(instance instanceof Compareable)
})

suite('can construct Completeable instance in a server environment', () => {
  const instance = new Completeable('')

  assert.ok(instance instanceof Completeable)
})

suite('can construct Copyable instance in a server environment', () => {
  const instance = new Copyable('')

  assert.ok(instance instanceof Copyable)
})

suite('can construct Delayable instance in a server environment', () => {
  const instance = new Delayable(() => {})

  assert.ok(instance instanceof Delayable)
})

suite('can construct Drawable instance in a server environment', () => {
  const instance = new Drawable([])

  assert.ok(instance instanceof Drawable)
})

suite('can construct Fetchable instance in a server environment', () => {
  const instance = new Fetchable('')

  assert.ok(instance instanceof Fetchable)
})

suite('can construct Fullscreenable instance in a server environment', () => {
  const instance = new Fullscreenable(() => document.body)

  assert.ok(instance instanceof Fullscreenable)
})

suite('can construct Grantable instance in a server environment', () => {
  const instance = new Grantable({ name: 'geolocation' })

  assert.ok(instance instanceof Grantable)
})

suite('can construct Listenable instance in a server environment', () => {
  const instance = new Listenable('keydown')

  assert.ok(instance instanceof Listenable)
})

suite('can construct Navigateable instance in a server environment', () => {
  const instance = new Navigateable([])

  assert.ok(instance instanceof Navigateable)
})

suite('can construct Pickable instance in a server environment', () => {
  const instance = new Pickable([])

  assert.ok(instance instanceof Pickable)
})

suite('can construct Recognizeable instance in a server environment', () => {
  const instance = new Recognizeable([])

  assert.ok(instance instanceof Recognizeable)
})

suite('can construct Resolveable instance in a server environment', () => {
  const instance = new Resolveable(async () => {})

  assert.ok(instance instanceof Resolveable)
})

suite('can construct Sanitizeable instance in a server environment', () => {
  const instance = new Sanitizeable('')

  assert.ok(instance instanceof Sanitizeable)
})

suite('can construct Searchable instance in a server environment', () => {
  const instance = new Searchable([])

  assert.ok(instance instanceof Searchable)
})

suite('can construct Shareable instance in a server environment', () => {
  const instance = new Shareable({})

  assert.ok(instance instanceof Shareable)
})

suite('can construct Storeable instance in a server environment', () => {
  const instance = new Storeable('')

  assert.ok(instance instanceof Storeable)
})

suite.run()
