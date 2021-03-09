import DOMPurify from 'dompurify'

export default class Sanitizeable {
  constructor (html, options) {
    this._computedDompurify = new DOMPurify()
  }

  get dompurify () {
    return this._computedDompurify
  }

  sanitize () {
    
  }
}
