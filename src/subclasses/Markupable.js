/*
 * Markupable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import MarkdownIt from 'markdown-it'

export default class Markupable extends String {
  #markdownitOptions
  #markdownit

  constructor (string, options = {}) {
    super(string)

    this.#markdownitOptions = options.markdownit
    this.#markdownit = new MarkdownIt(this.#markdownitOptions)
  }
  
  markup () {
    return this.#markdownit.render(this)
  }
}
