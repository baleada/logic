import { createSet } from '../links/associative-array'
import { createValue } from '../pipes/associative-array'
import { createDeepEqual } from '../pipes/any'
import type { AssociativeArray } from './associative-array'

type SupportedIntlKind = (
  | typeof Intl.Collator
  | typeof Intl.DateTimeFormat
  | typeof Intl.DisplayNames
  | typeof Intl.ListFormat
  | typeof Intl.Locale
  | typeof Intl.NumberFormat
  | typeof Intl.PluralRules
  | typeof Intl.RelativeTimeFormat
  | typeof Intl.Segmenter
)

export function createToIntl<IntlKind extends SupportedIntlKind>(
  _Intl: IntlKind
): (...params: ConstructorParameters<IntlKind>) => InstanceType<IntlKind> {
  const intls: AssociativeArray<ConstructorParameters<IntlKind>, InstanceType<IntlKind>> = []

  return (...params) => {
    const intl = createValue<ConstructorParameters<IntlKind>, InstanceType<IntlKind>>(
      params,
      { predicateKey: createDeepEqual(params) }
    )(intls)

    if (intl) return intl

    // @ts-expect-error
    const newIntl = new _Intl(...params)

    createSet<ConstructorParameters<IntlKind>, InstanceType<IntlKind>>(
      params,
      newIntl,
    )(intls)

    return newIntl
  }
}

export const toCollator = createToIntl(Intl.Collator)
export const toDateTimeFormat = createToIntl(Intl.DateTimeFormat)
export const toDisplayNames = createToIntl(Intl.DisplayNames)
export const toListFormat = createToIntl(Intl.ListFormat)
export const toLocale = createToIntl(Intl.Locale)
export const toNumberFormat = createToIntl(Intl.NumberFormat)
export const toPluralRules = createToIntl(Intl.PluralRules)
export const toRelativeTimeFormat = createToIntl(Intl.RelativeTimeFormat)
export const toSegmenter = createToIntl(Intl.Segmenter)
