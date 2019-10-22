/* Utils, dictionaries, and default options */
const directions = {
  up: {
    degrees: degrees => (degrees > 45 && degrees < 135),
    radians: radians => (radians > 0.25 * Math.PI && radians < 0.75 * Math.PI),
  },
  left: {
    degrees: degrees => (degrees > 135 && degrees < 225),
    radians: radians => (radians > 0.75 * Math.PI && radians < 1.25 * Math.PI),
  },
  down: {
    degrees: degrees => (degrees > 225 && degrees < 315),
    radians: radians => (radians > 1.25 * Math.PI && radians < 1.75 * Math.PI),
  },
  right: {
    degrees: degrees => ((degrees > 315 && degrees <= 360) || (degrees < 45 && degrees >= 0)),
    radians: radians => ((radians > 1.75 * Math.PI && radians <= 2 * Math.PI) || (radians < 0.25 * Math.PI && radians >= 0)),
  }
}

function toDirection (angle, unit = 'degrees') {
  return Object.keys(directions).find(direction => directions[direction][unit](angle))
}

const api = {
  toDirection
}

function recognize (listener, recognizer, event, store) {
  if (recognizer(event, store)) {
    listener(event, api)
  }
}

function getPolarCoordinates ({ xA, xB, yA, yB }) {
  const distance = Math.hypot(xB - xA, yB - yA),
        angle = Math.atan2((yB - yA), (xB - xA)),
        radians = angle >= 0
          ? angle
          : 2 * Math.PI + angle,
        degrees = radians * 180 / Math.PI

  return {
    distance,
    angle: { radians, degrees }
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

/* Listeners */
function panListeners (listener, store, options) {
  options = {
    threshold: 1,
    includesMouseEquivalents: true,
    ...options
  }

  const { threshold, includesMouseEquivalents } = options,
        recognizer = (event, store) => {
          const { x: xA, y: yA } = store.start,
                { clientX: xB, clientY: yB } = event,
                { distance, angle } = getPolarCoordinates({ xA, xB, yA, yB }),
                end = { x: xB, y: yB }

          store = { ...store, end, distance, angle }

          return distance > threshold
        },
        storeTouchstartPoint = event => {
          store.start.x = event.clientX
          store.start.y = event.clientY
        },
        touchstart = event => storeTouchstartPoint(event),
        touchmove = event => recognize(listener, recognizer, event, store),
        touchcancel = event => event,
        touchListeners = [
          ['touchstart', touchstart],
          ['touchmove', touchmove],
          ['touchcancel', touchcancel],
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
function panstartListeners (listener, store, options) {

}
function panmoveListeners (listener, store, options) {

}
function panendListeners (listener, store, options) {

}
function pancancelListeners (listener, store, options) {

}
function panleftListeners (listener, store, options) {

}
function panrightListeners (listener, store, options) {

}
function panupListeners (listener, store, options) {

}
function pandownListeners (listener, store, options) {

}
function pinchListeners (listener, store, options) {

}
function pinchstartListeners (listener, store, options) {

}
function pinchmoveListeners (listener, store, options) {

}
function pinchendListeners (listener, store, options) {

}
function pinchcancelListeners (listener, store, options) {

}
function pinchinListeners (listener, store, options) {

}
function pinchoutListeners (listener, store, options) {

}
function pressListeners (listener, store, options) {

}
function pressupListeners (listener, store, options) {

}
function rotateListeners (listener, store, options) {

}
function rotatestartListeners (listener, store, options) {

}
function rotatemoveListeners (listener, store, options) {

}
function rotateendListeners (listener, store, options) {

}
function rotatecancelListeners (listener, store, options) {

}
function swipeListeners (listener, store, options) {

}
function swipeleftListeners (listener, store, options) {

}
function swiperightListeners (listener, store, options) {

}
function swipeupListeners (listener, store, options) {

}
function swipedownListeners (listener, store, options) {

}
function tapListeners (listener, store, options) {

}

export default {
  panListeners,
  panstartListeners,
  panmoveListeners,
  panendListeners,
  pancancelListeners,
  panleftListeners,
  panrightListeners,
  panupListeners,
  pandownListeners,
  pinchListeners,
  pinchstartListeners,
  pinchmoveListeners,
  pinchendListeners,
  pinchcancelListeners,
  pinchinListeners,
  pinchoutListeners,
  pressListeners,
  pressupListeners,
  rotateListeners,
  rotatestartListeners,
  rotatemoveListeners,
  rotateendListeners,
  rotatecancelListeners,
  swipeListeners,
  swipeleftListeners,
  swiperightListeners,
  swipeupListeners,
  swipedownListeners,
  tapListeners,
}
