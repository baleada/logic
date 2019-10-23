/* Utils */
import is from '../util/is'
import withDirectionCondition from '../util/withDirectionCondition'

/* Dictionaries */
import directions from './directions'

/* recognize */
function toDirection (angle, unit = 'degrees') {
  return Object.keys(directions).find(direction => directions[direction][unit](angle))
}

const listenerApi = {
  toDirection
}

function recognize (recognized, listener) {
  if (recognized) {
    listener(event, listenerApi)
  }
}

/* handle */
function getPolarCoordinates ({ xA, xB, yA, yB }) {
  const distance = Math.hypot(xB - xA, yB - yA),
        angle = Math.atan2((yA - yB), (xB - xA)),
        radians = angle >= 0
          ? angle
          : 2 * Math.PI + angle,
        degrees = radians * 180 / Math.PI

  return {
    distance,
    angle: { radians, degrees }
  }
}

const handlerApi = {
  getPolarCoordinates
}

function handle (requiredHandler, optionalHandler, event, store) {
  requiredHandler(event, handlerApi)
  if (is.function(optionalHandler)) {
    optionalHandler(event, store, handlerApi)
  }
}

function getMouseEquivalents (touchListeners) {
  return touchListeners
    .map(([eventType, listener]) => [mouseEquivalents[eventType], listener])
    .filter(([eventType]) => !!eventType)
}

const mouseEquivalents = {
  touchstart: 'mousedown',
  touchend: 'mouseup',
  touchmove: 'mousemove',
}

/* Listener getters */

// Pan
function pan (listener, store, options) {
  options = {
    threshold: 0,
    includesMouseEquivalents: false,
    conditions: [],
    ...options
  }

  const { threshold, includesMouseEquivalents, conditions, onStart, onMove, onCancel, onEnd } = options,
        recognizer = (event, { getPolarCoordinates }) => {
          const { x: xA, y: yA } = store.start,
                { clientX: xB, clientY: yB } = event.touches[0],
                { distance, angle } = getPolarCoordinates({ xA, xB, yA, yB }),
                end = { x: xB, y: yB }

          store.end = end
          store.distance = distance
          store.angle = angle

          return [() => distance > threshold, ...conditions].every(condition => condition(event, store, listenerApi))
        },
        panStart = event => (store.start = { x: event.touches[0].clientX, y: event.touches[0].clientY }),
        panMove = event => recognize(recognizer(event), listener),
        panCancel = () => ['start', 'end', 'distance', 'angle'].forEach(datum => (store[datum] = undefined)),
        panEnd = () => { /* do nothing */ },
        touchListeners = [
          ['touchstart', event => handle(panStart, onStart, event, store)],
          ['touchmove', event => handle(panMove, onMove, event, store)],
          ['touchcancel', event => handle(panCancel, onCancel, event, store)],
          ['touchend', event => handle(panEnd, onEnd, event, store)],
        ]

  if (includesMouseEquivalents) {
    return [
      ...touchListeners,
      ...getMouseEquivalents(touchListeners),
    ]
  } else {
    return touchListeners
  }
}
function panLeft (listener, store, options) {
  options = withDirectionCondition('left', options)
  pan(listener, store, options)
}
function panRight (listener, store, options) {
  options = withDirectionCondition('right', options)
  pan(listener, store, options)
}
function panUp (listener, store, options) {
  options = withDirectionCondition('up', options)
  pan(listener, store, options)
}
function panDown (listener, store, options) {
  options = withDirectionCondition('down', options)
  pan(listener, store, options)
}

// Pinch
function pinch (listener, store, options) {

}
function pinchIn (listener, store, options) {

}
function pinchOut (listener, store, options) {

}

// Press
function press (listener, store, options) {

}
function pressup (listener, store, options) {

}

// Rotate
function rotate (listener, store, options) {

}

// Swipe
function swipe (listener, store, options) {

}
function swipeLeft (listener, store, options) {

}
function swipeRight (listener, store, options) {

}
function swipeUp (listener, store, options) {

}
function swipeDown (listener, store, options) {

}

// Tap
function tap (listener, store, options) {

}

export default {
  pan,
  panUp,
  panRight,
  panDown,
  panLeft,
  pinch,
  press,
  pressup,
  rotate,
  swipe,
  tap,
}
