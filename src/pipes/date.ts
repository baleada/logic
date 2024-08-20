import { toDateTimeFormat } from '../extracted'

export type DateTransform<DateKind extends Date | EpochTimeStamp, Transformed> = (date: DateKind) => Transformed

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/date-format)
 */
export function createFormat (...params: ConstructorParameters<typeof Intl.DateTimeFormat>): DateTransform<Date | EpochTimeStamp, string> {
  const dateTimeFormat = toDateTimeFormat(...params)
  return number => dateTimeFormat.format(number)
}
