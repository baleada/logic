import createDOMPurify from 'dompurify'
import { domIsAvailable } from '../util.js'

export default class Sanitizeable {
  /**
   * 
   * @param {string} html
   * @param {createDOMPurify.Config} [options] 
   */
  constructor (html, options) {
    this._computedHtml = html
    this._domPurifyConfig = options
    this._ready()
  }
  _ready () {
    if (domIsAvailable()) {
      this._computedDompurify = createDOMPurify()
      this._computedDompurify.setConfig(this._domPurifyConfig)
    }

    /**
     * @type {'ready' | 'sanitized'}
     */
    this._computedStatus = 'ready'
  }

  get html () {
    return this._computedHtml
  }
  set html (html) {
    this.setHtml(html)
  }
  get dompurify () {
    if (!this._computedDompurify && domIsAvailable()) {
      this._computedDompurify = createDOMPurify()
      this._computedDompurify.setConfig(this._domPurifyConfig)
    }

    return this._computedDompurify
  }
  get status () {
    return this._computedStatus
  }

  /**
   * @param {string} html
   */
  setHtml (html) {
    this._computedHtml = html
    return this
  }

  sanitize () {
    this.setHtml(this.dompurify.sanitize(this.html))
    this._sanitized()
    return this
  }
  _sanitized () {
    this._computedStatus = 'sanitized'
  }
}
