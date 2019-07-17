import is from '../../src/utils/is'

/**
 * This function is used to assert equality of two instances of a Baleada class. It compares everything except functions, which are never deeply equal, because they all reference their own `this`.
 * @param  {Any}  value    A Baleada class instance
 * @param  {Any}  expected A Baleada class instance to which the value is expected to be equal
 * @return {Boolean}          `true` when they are equal, `false` when not
 */
export default function isExceptMethods(value, expected) {
  return Object.keys(value).every(key => is.function(value[key]) || (!is.function(value[key]) && value[key] === expected[key]))
}
