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
  object: a => Object.prototype.toString.call(a).indexOf('Object') > -1,
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
  rgba: a => /^rgba/.test(a),
  hsla: a => /^hsla/.test(a),
  color: a => (is.hex(a) || is.rgb(a) || is.hsl(a) || is.rgba(a) || is.hsla(a)),
}

export default is
