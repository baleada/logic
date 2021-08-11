import createDOMPurify, { DOMPurifyI, Config } from 'dompurify'
import { domIsAvailable } from '../extracted'

export type SanitizeableOptions = Config

export type SanitizeableStatus = 'ready' | 'sanitized'

export class Sanitizeable {
  private domPurifyConfig: Config
  constructor (html: string, options?: Config) {
    this.computedHtml = html
    this.domPurifyConfig = options
    this.ready()
  }
  private computedDompurify: DOMPurifyI
  private computedStatus: SanitizeableStatus
  private ready () {
    if (domIsAvailable()) {
      this.computedDompurify = createDOMPurify()
      this.computedDompurify.setConfig(this.domPurifyConfig)
    }

    this.computedStatus = 'ready'
  }

  get html () {
    return this.computedHtml
  }
  set html (html) {
    this.setHtml(html)
  }
  get dompurify () {
    if (!this.computedDompurify && domIsAvailable()) {
      this.computedDompurify = createDOMPurify()
      this.computedDompurify.setConfig(this.domPurifyConfig)
    }

    return this.computedDompurify
  }
  get status () {
    return this.computedStatus
  }

  private computedHtml: string
  setHtml (html: string) {
    this.computedHtml = html
    return this
  }

  sanitize () {
    this.setHtml(this.dompurify.sanitize(this.html))
    this.sanitized()
    return this
  }
  private sanitized () {
    this.computedStatus = 'sanitized'
  }
}

