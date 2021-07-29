import type { ListenableModifier, ListenableModifierAlias } from "../../src/extracted"

export const leftclicks = [
  'click',
  'mousedown',
  'mouseup',
  'dblclick',
]

export const rightclicks = [
  'rightclick',
  'contextmenu',
]

export const clicks = leftclicks.concat(rightclicks)

export const pointers = [
  'pointerdown',
  'pointerup',
  'pointermove',
  'pointerover',
  'pointerout',
  'pointerenter',
  'pointerleave',
  'pointercancel',
  'gotpointercapture',
  'lostpointercapture',
]

export const singleCharacters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ',',
  '<',
  '.',
  '>',
  '/',
  '?',
  ';',
  ':',
  '\'',
  '"',
  '[',
  '{',
  ']',
  '}',
  '\\',
  '|',
  '`',
  '~',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  '-',
  '_',
  '=',
  '+',
]

export const arrows = [
  'arrow',
  'vertical',
  'horizontal',
  'up',
  'right',
  'down',
  'left',
]
    
export const others = [
  'tab',
  'space',
  'enter',
  'backspace',
  'esc',
  'home',
  'end',
  'pagedown',
  'pageup',
  'capslock',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
  'f13',
  'f14',
  'f15',
  'f16',
  'f17',
  'f18',
  'f19',
  'f20',
  'camera',
  'delete',
]
    
export const modifiers: ListenableModifier[] = [
  'meta',
  'shift',
  'control',
  'alt',
]

export const modifierAliases: ListenableModifierAlias[] = [
  'cmd',
  'command',
  'ctrl',
  'opt',
  'option',
]

export const keys = singleCharacters
  .concat(arrows)
  .concat(others)
  .concat(modifiers)
  .concat(modifierAliases)
