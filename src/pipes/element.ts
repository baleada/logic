import { join } from 'lazy-collections'
import type { DeepRequired } from '../extracted'

export type ElementTransform<El extends HTMLElement, Transformed> = (element: El) => Transformed

export type CreateFocusableOptions = {
  elementIsCandidate?: boolean,
  tabbableSelector?: string,
}

const defaultOptions: DeepRequired<CreateFocusableOptions> = {
  elementIsCandidate: false,
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

export function createFocusable (
  order: 'first' | 'last',
  options: CreateFocusableOptions = {}
): ElementTransform<HTMLElement, HTMLElement | undefined> {
  const { elementIsCandidate, tabbableSelector } = { ...defaultOptions, ...options },
        predicateFocusable = (element: HTMLElement): boolean => element.matches(tabbableSelector)

  return element => {
    if (elementIsCandidate && predicateFocusable(element)) return element

    switch (order) {
      case 'first':
        for (let i = 0; i < element.children.length; i++) {
          const focusable = createFocusable(order, { elementIsCandidate: true })(element.children[i] as HTMLElement)
          if (focusable) return focusable
        }
        
        break
      case 'last':
        for (let i = element.children.length - 1; i > -1; i--) {
          const focusable = createFocusable(order, { elementIsCandidate: true })(element.children[i] as HTMLElement)
          if (focusable) return focusable
        }

        break
    }
  }
}
