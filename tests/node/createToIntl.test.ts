import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createToIntl } from '../../src/extracted/createToIntl'

const suite = createSuite('createToIntl')

for (const { kind, params } of [
  {
    kind: 'Collator',
    params: ['en'],
  },
  {
    kind: 'DateTimeFormat',
    params: [
      'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    ],
  },
  {
    kind: 'DisplayNames',
    params: [['en'], { type: 'region' }],
  },
  {
    kind: 'ListFormat',
    params: [
      'en',
      { style: 'long', type: 'conjunction' },
    ],
  },
  {
    kind: 'Locale',
    params: [
      'ko',
      {
        script: 'Kore',
        region: 'KR',
        hourCycle: 'h23',
        calendar: 'gregory',
      },
    ],
  },
  {
    kind: 'NumberFormat',
    params: ['de-DE', { style: 'currency', currency: 'EUR' }],
  },
  {
    kind: 'PluralRules',
    params: ['en-US', { type: 'ordinal' }],
  },
  {
    kind: 'RelativeTimeFormat',
    params: ['en', { style: 'short' }],
  },
  {
    kind: 'Segmenter',
    params: ['fr', { granularity: 'word' }],
  },
]) {
  suite(`returns function that constructs new ${kind}`, () => {
    const instance = createToIntl(Intl[kind])(...params)

    const value = instance instanceof Intl[kind],
          expected = true

    assert.is(value, expected)
  })

  suite(`returns function that reuses ${kind} instances based on parameter deep equality`, () => {
    const toIntl = createToIntl(Intl[kind])
    const instance1 = toIntl(...params)
    const instance2 = toIntl(...params)

    const value = instance1 === instance2,
          expected = true

    assert.is(value, expected)
  })
}

suite.run()
