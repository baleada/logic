/*
 * DragDroppable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

export default class DragDroppable {
  /* Private properties */

  constructor(element, options = {}) {
    /* Options */

    /* Public properties */
    this.element = element
  }

  /* Public getters */

  /* Public methods */
  setElement(element) {
    this.element = element
    return this
  }

  /* Private methods */

}
