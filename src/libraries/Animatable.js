/*
 * Animatable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// Utils
import assignEnumerables from '../utils/assignEnumerables'

class Animatable {
  /* Private properties */

  constructor(element, {
    
  }) {
    /* Options */

    /* Public properties */
    element = element

    assignEnumerables(this, {
      element,
    }, 'property')

    /* Public getters */

    assignEnumerables(this, {

    }, 'getter')

    /* Public methods */
    function setElement(element) {
      this.element = element
      return this
    }

    assignEnumerables(this, {
      setElement,
    }, 'method')
  }

  /* Private methods */

}

export default Animatable
