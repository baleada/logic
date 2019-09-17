import lunr from 'lunr'
import is from '../util/is'

export default class SearchableLunr {
  #array
  #id
  #isArrayOfStrings
  #documents
  #keys
  #positionIsIncluded
  #itemIsIncluded
  #dependency
  #lunrInstance

  constructor (array, options = {}) {
    this.#array = array
    this.#isArrayOfStrings = array.every(item => is.string(item))

    options = {
      positionIsIncluded: false,
      itemIsIncluded: false,
      ...options
    }
    this.#id = this.#getId(options.id)
    this.#keys = this.#getKeys(options.keys)
    this.#documents = this.#getDocuments()
    this.#positionIsIncluded = options.positionIsIncluded
    this.#itemIsIncluded = options.itemIsIncluded

    this.#dependency = lunr
    this.#lunrInstance = this.#getLunrInstance()
  }

  get index () {
    return this.#lunrInstance
  }

  /* Public methods */
  search () {
    return this.#itemIsIncluded
      ? this.#lunrInstance.search(...arguments).map(match => this.#includeItem(match))
      : this.#lunrInstance.search(...arguments)
  }

  /* Private methods */
  #getLunrInstance = function() {
    return this.#dependency(builder => {
      builder.ref(this.#id)
      this.#keys.forEach(key => {
        if (is.string(key)) {
          builder.field(key)
        } else {
          builder.field(key.name, key.attributes)
        }
      })
      if (this.#positionIsIncluded) {
        builder.metadataWhitelist = ['position']
      }

      this.#documents.forEach(function(item) {
        builder.add(item)
      })
    })
  }
  #getId = function(id) {
    return this.#isArrayOfStrings
      ? 'id'
      : id
  }
  #getKeys = function(keys) {
    return is.array(keys) ? keys : [this.#id]
  }
  #getDocuments = function() {
    return this.#isArrayOfStrings
      ? this.#array.map(string => Object.defineProperty({}, this.#id, { value: string }))
      : this.#array
  }
  #includeItem = function(match) {
    return Object.defineProperty(match, 'item', { value: this.#findItem(match) })
  }
  #findItem = function(match) {
    return this.#isArrayOfStrings
      ? this.#array.find(string => string === match.ref)
      : this.#array.find(object => object[this.#id] === match.ref)
  }
}
