/* Modified from anime.js https://github.com/juliangarnier/anime */

const is = {
  undefined: a => typeof a === 'undefined',
  defined: a => typeof a !== 'undefined',
  null: a => a === null,
  string: a => typeof a === 'string',
  number: a => typeof a === 'number',
  boolean: a => typeof a === 'boolean',
  symbol: a => typeof a === 'symbol',
  function: a => typeof a === 'function',
  array: a => Array.isArray(a),
  object: a => typeof a === 'object',
  date: a => a instanceof Date,
  error: a => a instanceof Error,

  file: a => a instanceof File,
  filelist: a => a instanceof FileList,

  path: a => a instanceof SVGPathElement,
  svg: a => a instanceof SVGElement,
  input: a => a instanceof HTMLInputElement,
  element: a => a instanceof HTMLElement,
  node: a => a instanceof Node,
  nodeList: a => a instanceof NodeList,

  hex: a => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a),
  rgb: a => /^rgb[^a]/.test(a),
  hsl: a => /^hsl[^a]/.test(a),
  rgba: a => a.startsWith('rgba'),
  hsla: a => a.startsWith('hsla'),
  color: a => (is.hex(a) || is.rgb(a) || is.hsl(a) || is.rgba(a) || is.hsla(a)),
}

export default is

export const orderedIs = new Map([
  ['undefined', is.undefined],
  ['defined', is.defined],
  ['null', is.null],
  ['string', is.string],
  ['number', is.number],
  ['boolean', is.boolean],
  ['symbol', is.symbol],
  ['function', is.function],
  ['array', is.array],
  ['object', is.object],
  ['date', is.date],
  ['error', is.error],
  ['file', is.file],
  ['filelist', is.filelist],
  ['path', is.path],
  ['svg', is.svg],
  ['input', is.input],
  ['element', is.element],
  ['node', is.node],
  ['nodeList', is.nodeList],
  ['hex', is.hex],
  ['rgb', is.rgb],
  ['hsl', is.hsl],
  ['rgba', is.rgba],
  ['hsla', is.hsla],
  ['color', is.color],
])
