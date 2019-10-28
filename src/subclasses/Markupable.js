/*
 * Markupable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import MarkdownIt from 'markdown-it'

export default class Markupable extends String {
  // _markdownitOptions
  // _markdownit

  constructor (markdown, options = {}) {
    super(markdown)

    this._markdownitOptions = options.markdownit
    this._markdownit = new MarkdownIt(this._markdownitOptions)
  }

  invoke () {
    return new Markupable(this._markdownit.render(`${this}`), { markdownit: this._markdownitOptions })
  }
}
