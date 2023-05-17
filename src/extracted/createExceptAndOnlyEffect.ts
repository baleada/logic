import { some } from 'lazy-collections'
import { createMap } from '../pipes'
import type {
  ListenableSupportedEventType,
  ListenEffect,
  ListenEffectParam,
  ListenOptions,
} from '../classes/Listenable'


export function createExceptAndOnlyEffect<Type extends ListenableSupportedEventType>(type: Type, effect: ListenEffect<Type>, options: ListenOptions<Type>): (param: ListenEffectParam<Type>) => void {
  const { except = [], only = [] } = options

  if (
    type === 'keydown'
    || type === 'keyup'
  ) {
    return (
      (event: ListenEffectParam<'keydown'>) => {
        const { target } = event, [matchesOnly, matchesExcept] = target instanceof Element
          ? createMap<string[], boolean>(selectors => some<string>(selector => target.matches(selector))(selectors) as boolean)([only, except])
          : [false, false]

        if (matchesOnly) {
          // @ts-ignore
          effect(event)
          return
        }

        if (only.length === 0 && !matchesExcept) {
          // @ts-ignore
          effect(event)
          return
        }
      }
    ) as (param: ListenEffectParam<Type>) => void
  }

  if (
    type === 'click'
    || type === 'dblclick'
    || type === 'contextmenu'
    || type.startsWith('mouse')
  ) {
    return (
      (event: ListenEffectParam<'mousedown'>) => {
        const { target } = event, [matchesOnly, matchesExcept] = target instanceof Element
          ? createMap<string[], boolean>(selectors => some<string>(selector => target.matches(selector))(selectors) as boolean)([only, except])
          : [false, false]

        if (matchesOnly) {
          // @ts-ignore
          effect(event)
          return
        }

        if (only.length === 0 && !matchesExcept) {
          // @ts-expect-error
          effect(event)
          return
        }
      }
    ) as (param: ListenEffectParam<Type>) => void
  }

  if (type.startsWith('pointer')) {
    return (
      (event: ListenEffectParam<'pointerdown'>) => {
        const { target } = event, [matchesOnly, matchesExcept] = target instanceof Element
          ? createMap<string[], boolean>(selectors => some<string>(selector => target.matches(selector))(selectors) as boolean)([only, except])
          : [false, false]

        if (matchesOnly) {
          // @ts-expect-error
          effect(event)
          return
        }

        if (only.length === 0 && !matchesExcept) {
          // @ts-expect-error
          effect(event)
          return
        }
      }
    ) as (param: ListenEffectParam<Type>) => void
  }

  return (
    (event: ListenEffectParam<Type>) => {
      const { target } = event, [matchesOnly, matchesExcept] = target instanceof Element
        ? createMap<string[], boolean>(selectors => some<string>(selector => target.matches(selector))(selectors) as boolean)([only, except])
        : [false, false]

      if (matchesOnly) {
        // @ts-ignore
        effect(event, {})
        return
      }

      if (only.length === 0 && !matchesExcept) {
        // @ts-ignore
        effect(event, {})
        return
      }
    }
  ) as (param: ListenEffectParam<Type>) => void
}
