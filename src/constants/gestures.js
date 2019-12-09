import Clicks from './Clicks'
import Drag from './Drag'
import DragDrop from './DragDrop'
import Pan from './Pan'
import Pinch from './Pinch'
import Press from './Press'
import Rotate from './Rotate'
import Swipe from './Swipe'
import Tap from './Tap'

export default [
  {
    name: 'clicks',
    constructor: Clicks,
    events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
    handle: 'handle',
  },
  {
    name: 'drag',
    constructor: Drag,
    events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
    handle: 'handle',
  },
  {
    name: 'dragdrop',
    constructor: DragDrop,
    events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
    handle: 'handle',
  },
  {
    name: 'pan',
    constructor: Pan,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    handle: 'handle',
  },
  {
    name: 'pinch',
    constructor: Pinch,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    handle: 'handle',
  },
  {
    name: 'press',
    constructor: Press,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    handle: 'handle',
  },
  {
    name: 'rotate',
    constructor: Rotate,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    handle: 'handle',
  },
  {
    name: 'swipe',
    constructor: Swipe,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    handle: 'handle',
  },
  {
    name: 'tap',
    constructor: Tap,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    handle: 'handle',
  },
]
