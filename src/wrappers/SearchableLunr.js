import lunr from 'lunr'
import is from '../utils/is'

export default class SearchableLunr {
  #array
  #id
  #isArrayOfStrings

  #documents
  #keys
  #positionIsIncluded
  #itemIsIncluded

  #lunr

  constructor (array, options = {}) {
    this.#array = array
    this.#isArrayOfStrings = array.every(item => is.string(item))

    this.#id = this.#getId(options.id)
    this.#keys = this.#getKeys(options.keys)
    this.#documents = this.#getDocuments()
    this.#positionIsIncluded = options.positionIsIncluded
    this.#itemIsIncluded = options.itemIsIncluded

    this.#lunr = this.#lunrConstructor()
  }

  // Utils
  #lunrConstructor = function () {
    return lunr(builder => {
      builder.ref(this.#id)
      this.#keys.forEach(key => {
        if (is.string(key)) builder.field(key)
        else builder.field(key.name, key.attributes)
      })
      if (this.#positionIsIncluded) builder.metadataWhitelist = ['position']

      this.#documents.forEach(function (item) {
        builder.add(item)
      })
    })
  }
  #getId = function (id) {
    return this.#isArrayOfStrings
      ? 'id'
      : id
  }
  #getKeys = function (keys) {
    return is.array(keys) ? keys : [this.#id]
  }
  #getDocuments = function () {
    return this.#isArrayOfStrings
      ? this.#array.map(string => Object.defineProperty({}, this.#id, { value: string }))
      : this.#array
  }
  #findItem = function (match) {
    return this.#isArrayOfStrings
      ? this.#array.find(string => string === match.ref)
      : this.#array.find(object => object[this.#id] === match.ref)
  }
  #includeItem = function (match) {
    return Object.defineProperty(match, 'item', { value: this.#findItem(match) })
  }

  search () {
    return this.#itemIsIncluded
      ? this.#lunr.search(...arguments).map(match => this.#includeItem(match))
      : this.#lunr.search(...arguments)
  }
}
