import createDOMPurify, { DOMPurifyI, Config } from 'dompurify'
import { domIsAvailable } from '../util'

export type SanitizeableOptions = Config

export class Sanitizeable {
  _domPurifyConfig: Config
  constructor (html: string, options?: Config) {
    this._computedHtml = html
    this._domPurifyConfig = options
    this._ready()
  }
  _computedDompurify: DOMPurifyI
  _computedStatus: 'ready' | 'sanitized'
  _ready () {
    if (domIsAvailable()) {
      this._computedDompurify = createDOMPurify()
      this._computedDompurify.setConfig(this._domPurifyConfig)
    }

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

  _computedHtml: string
  setHtml (html: string) {
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

