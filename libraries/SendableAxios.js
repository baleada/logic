import axios from 'axios'

class SendableDependency {
  #request
  #dependency

  constructor (request, options) {
    this.#request = request
    this.#dependency = axios
  }

  send () {
    return this.#dependency.request(this.#request)
  }
}

export default SendableDependency
