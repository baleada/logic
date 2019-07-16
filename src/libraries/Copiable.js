/*
 * Copiable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// Utils
import assignEnumerables from '../utils/assignEnumerables'

class Copiable {
  /* Private properties */

  constructor(state, {
    
  }) {
    /* Options */

    /* Public properties */
    state = state

    assignEnumerables(this, {
      state,
    }, 'property')

    /* Public getters */

    assignEnumerables(this, {

    }, 'getter')

    /* Public methods */
    function setState(state) {
      this.state = state
      return this
    }

    assignEnumerables(this, {
      setState,
    }, 'method')
  }

  /* Private methods */

}

export default Copiable
