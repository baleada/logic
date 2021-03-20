import { toEvent, toCombo } from '../util.js'

export class Dispatchable {
  /**
   * 
   * @param {string} type
   * @param {{}} [options]
   */
  constructor (type, options = {}) {
    this.setType(type)
    this._ready()
  }
  _ready () {
    /**
     * @type {'ready' | 'dispatched'}
     */
    this._computedStatus = 'ready'
  }

  get type () {
    return this._computedType
  }
  set type (type) {
    this.setType(type)
  }
  get cancelled () {
    return this._computedCancelled
  }
  get status () {
    return this._computedStatus
  }

  /**
   * @param {string} type 
   */
  setType (type) {
    this._computedType = type
    return this
  }

  /**
   * @param {{ target?: Window | Element, keyDirection?: 'up' | 'down', init?: EventInit }} [options]
   */
  dispatch (options = {}) {
    const { target = window, keyDirection = 'down', init = {} } = options,
          event = toEvent(toCombo(this.type), { keyDirection: keyDirection, init })

    this._computedCancelled = !target.dispatchEvent(event)
    this._dispatched()

    return this
  }
  _dispatched () {
    this._computedStatus = 'dispatched'
  }
}
