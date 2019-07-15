/*
 * DragDropReorderable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// Libraries
import { Sortable } from '@shopify/draggable'

// Utils
import is from '../utils/is'
import toNodeList from './to-node-list.js'
import capitalize from './capitalize.js'

export default class DragDropReorderable {
  #eventNameDictionary
  #onDrag
  #onDrop
  #onReorder
  #onCross
  #dependencyOptions
  #dependency

  constructor (elements, options) {
    this.elements = elements

    options = {
      sortableOptions: {},
      ...options
    }

    this.#eventNameDictionary = {
      drag: 'start',
      drop: 'sort',
      cross: 'sorted',
      reorder: 'stop',
    }

    this.#onDrag = options.onDrag
    this.#onDrop = options.onDrop
    this.#onCross = options.onCross
    this.#onReorder = options.onReorder
    this.#dependencyOptions = this.#getDependencyOptions(options)
    // this.#dependencyOptions = options.sortableOptions

    this.#dependency = this.#constructDependency()
  }

  #getDependencyOptions = ({ onDrag, onDrop, onCross, onReorder, ...rest }) => rest

  #constructDependency = function () {
    const dependency = new Sortable(this.elements, this.#dependencyOptions),
          eventNames = ['drag', 'drop', 'cross', 'reorder'],
          eventHandlers = [this.#onDrag, this.#onDrop, this.#onCross, this.#onReorder]

    eventNames.forEach((eventName, i) => {
      const handler = eventHandlers[i],
            dependencyEventName = this.#eventNameDictionary[eventName]
      console.log(dependencyEventName)
      if (is.function(handler)) dependency.on(`sortable:${dependencyEventName}`, evt => handler(evt))
    })

    return dependency
  }

  destroy () {
    this.#dependency.destroy(...arguments)
  }
}
