import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createGetEaseables, fromTimingToControlPoints, toProperties } from '../../src/classes/Animateable'
import type { Easeable, AnimateableKeyframe } from '../../src/classes/Animateable'
const suite = createSuite('createGetEaseables')

suite(`creates getEaseables`, () => {
  const timing: AnimateableKeyframe['timing'] = [0, 0, 1, 1],
        keyframes: AnimateableKeyframe[] = [
          { timing, progress: 0, properties: { foo: 'bar' } },
          { timing, progress: 0.25, properties: { foo: 'bar', stub: 'example' } },
          { timing, progress: 0.5, properties: { foo: 'bar', stub: 'example' } },
          { timing, progress: 0.75, properties: { foo: 'bar', qux: 'baz' } },
          { timing, progress: 1, properties: { foo: 'bar', poop: 'lol' } },
        ],
        getEaseables = createGetEaseables(({ keyframe: { timing } }) => fromTimingToControlPoints(timing)),
        value = withoutFunctions(
            getEaseables({
            keyframes,
            properties: toProperties(keyframes)
          })
        ),
        expected = [
          {
            property: 'foo',
            value: { previous: 'bar', next: 'bar' },
            progress: { start: -1, end: 0 },
            hasCustomTiming: false
          },
          {
            property: 'foo',
            value: { previous: 'bar', next: 'bar' },
            progress: { start: 0, end: 0.25 },
            hasCustomTiming: true,
          },
          {
            property: 'foo',
            value: { previous: 'bar', next: 'bar' },
            progress: { start: 0.25, end: 0.5 },
            hasCustomTiming: true,
          },
          {
            property: 'foo',
            value: { previous: 'bar', next: 'bar' },
            progress: { start: 0.5, end: 0.75 },
            hasCustomTiming: true,
          },
          {
            property: 'foo',
            value: { previous: 'bar', next: 'bar' },
            progress: { start: 0.75, end: 1 },
            hasCustomTiming: true,
          },
          {
            property: 'foo',
            value: { previous: 'bar', next: 'bar' },
            progress: { start: 1, end: 2 },
            hasCustomTiming: true,
          },
          {
            property: 'stub',
            value: { previous: 'example', next: 'example' },
            progress: { start: -1, end: 0.25 },
            hasCustomTiming: false
          },
          {
            property: 'stub',
            value: { previous: 'example', next: 'example' },
            progress: { start: 0.25, end: 0.5 },
            hasCustomTiming: true,
          },
          {
            property: 'stub',
            value: { previous: 'example', next: 'example' },
            progress: { start: 0.5, end: 2 },
            hasCustomTiming: true,
          },
          {
            property: 'qux',
            value: { previous: 'baz', next: 'baz' },
            progress: { start: -1, end: 0.75 },
            hasCustomTiming: false
          },
          {
            property: 'qux',
            value: { previous: 'baz', next: 'baz' },
            progress: { start: 0.75, end: 2 },
            hasCustomTiming: true,
          },
          {
            property: 'poop',
            value: { previous: 'lol', next: 'lol' },
            progress: { start: -1, end: 1 },
            hasCustomTiming: false
          },
          {
            property: 'poop',
            value: { previous: 'lol', next: 'lol' },
            progress: { start: 1, end: 2 },
            hasCustomTiming: true,
          }
        ]

  assert.equal(value, expected)
})

// Can't easily compare functions for equality
function withoutFunctions (easeables: Easeable[]) {
  return easeables.map(({ property, value, progress, hasCustomTiming }) => {
    return {
      property,
      value,
      progress,
      hasCustomTiming
    }
  })
}

suite.run()
