import { join } from 'lazy-collections'
import type { DeepRequired } from '../extracted'

export type ElementTransform<El extends HTMLElement, Transformed> = (element: El) => Transformed

export type CreateFocusableOptions = {
  predicatesElement?: boolean,
  tabbableSelector?: string,
}

const defaultOptions: DeepRequired<CreateFocusableOptions> = {
  predicatesElement: false,
  // Adapted from React Aria https://github.com/adobe/react-spectrum/blob/b6786da906973130a1746b2bee63215bba013ca4/packages/%40react-aria/focus/src/FocusScope.tsx#L256
  tabbableSelector: join(':not([hidden]):not([tabindex="-1"]),')([
    'input:not([disabled]):not([type=hidden])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'a[href]',
    'area[href]',
    'summary',
    'iframe',
    'object',
    'embed',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]',
    '[tabindex]:not([disabled])',
  ]) as string,
} 

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/focusable)
 */
export function createFocusable (
  order: 'first' | 'last' | 'next' | 'previous',
  options: CreateFocusableOptions = {}
): ElementTransform<HTMLElement, HTMLElement | undefined> {
  const { predicatesElement, tabbableSelector } = { ...defaultOptions, ...options },
        predicateFocusable = (element: HTMLElement): boolean => element.matches(tabbableSelector)

  switch (order) {
    case 'first':
      return element => {
        if (predicatesElement && predicateFocusable(element)) return element

        for (let i = 0; i < element.children.length; i++) {
          const focusable = createFocusable(order, { predicatesElement: true })(element.children[i] as HTMLElement)
          if (focusable) return focusable
        }
      }
    case 'last':
      return element => {
        if (predicatesElement && predicateFocusable(element)) return element

        for (let i = element.children.length - 1; i > -1; i--) {
          const focusable = createFocusable(order, { predicatesElement: true })(element.children[i] as HTMLElement)
          if (focusable) return focusable
        }
      }
    case 'next':
      return element => {
        if (predicatesElement && predicateFocusable(element)) return element

        const focusable = createFocusable('first')(element)
        if (focusable) return focusable

        let current = element
        while (current && current !== document.documentElement) {
          const nextSibling = current.nextElementSibling as HTMLElement

          if (nextSibling) {
            const focusable = createFocusable('first', { predicatesElement: true })(nextSibling)
            if (focusable) return focusable
          }

          current = current.parentElement as HTMLElement
        }
      }
    case 'previous':
      return element => {
        if (predicatesElement && predicateFocusable(element)) return element

        let current = element
        while (current && current !== document.documentElement) {
          const previousSibling = current.previousElementSibling as HTMLElement

          if (previousSibling) {
            const focusable = createFocusable('last', { predicatesElement: true })(previousSibling)
            if (focusable) return focusable
          }

          current = current.parentElement as HTMLElement
        }
      }
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/computed-style)
 */
export function createComputedStyle (pseudoElement?: string): ElementTransform<HTMLElement, CSSStyleDeclaration> {
  return element => getComputedStyle(element, pseudoElement)
}
