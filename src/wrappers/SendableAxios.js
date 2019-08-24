import axios from 'axios'

export default class SendableAxios {
  #request
  #axios

  constructor (request) {
    this.#request = request
    this.#axios = axios
  }

  send () {
    return this.#axios.request(this.#request)
  }
}
