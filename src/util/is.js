/* Adapted from anime.js https://github.com/juliangarnier/anime */

const is = {
  undefined: a => typeof a === 'undefined',
  defined: a => typeof a !== 'undefined',
  null: a => a === null,
  string: a => typeof a === 'string',
  number: a => typeof a === 'number',
  function: a => typeof a === 'function',
  array: a => Array.isArray(a),
  object: a => typeof a === 'object',
}

export default is
