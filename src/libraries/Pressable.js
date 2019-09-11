// /*
//  * Pressable.js
//  * (c) 2019 Alex Vipond
//  * Released under the MIT license
//  */
//
// /* Dependencies */
// import Dependency from '../wrappers/PressablePressure'
//
// /* Utils */
// import toNodeList from '../utils/toNodeList'
//
// export default class Pressable {
//   constructor (elements, options = {}) {
//     /* Options */
//
//     /* Public properties */
//     this.elements = elements
//
//     /* Private properties */
//
//     /* Dependency */
//     this.#dependencyOptions = this.#getDependencyOptions(options)
//     this.#dependency = new Dependency(this.elements, this.#dependencyOptions)
//   }
//
//   /* Public getters */
//   get manager () {
//     return this.#dependency.manager
//   }
//
//   /* Public methods */
//   setElements (elements) {
//     this.elements = toNodeList(elements)
//     return this
//   }
//
//   /* Private methods */
// }
