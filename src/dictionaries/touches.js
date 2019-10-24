/* Utils */
import is from '../util/is'
import withDirectionCondition from '../util/withDirectionCondition'
import toPolarCoordinates from '../util/toPolarCoordinates'

/* Dictionaries */
import { toDirection } from './directions'
import { toMouseEquivalents } from './mouseEquivalents'

/* recognize */
const listenerApi = {
  toDirection
}

function recognize (recognized, listener) {
  if (recognized) {
    listener(event, listenerApi)
  }
}

/* handle */
const handlerApi = {
  toPolarCoordinates
}

function handle (requiredHandler, optionalHandler, event, eventMetadata) {
  requiredHandler(event, handlerApi)
  if (is.function(optionalHandler)) {
    optionalHandler(event, eventMetadata, handlerApi)
  }
}

/* Listener getters */

/*
 * Pan is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 */
function pan (listener, eventMetadata, options) {
  options = {
    minDistance: 0,
    conditions: [],
    includesMouseEquivalents: false,
    ...options
  }

  const { minDistance, conditions, includesMouseEquivalents, onStart, onMove, onCancel, onEnd } = options,
        recognizer = (event, { toPolarCoordinates }) => {
          const { x: xA, y: yA } = eventMetadata.startPoint,
                { clientX: xB, clientY: yB } = event.touches.item(0),
                { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
                endPoint = { x: xB, y: yB }

          eventMetadata.endPoint = endPoint
          eventMetadata.distance = distance
          eventMetadata.angle = angle

          return [
            () => eventMetadata.distance > minDistance,
            ...conditions
          ].every(condition => condition(event, eventMetadata, listenerApi))
        },
        panStart = event => (eventMetadata.startPoint = { x: event.touches.item(0).clientX, y: event.touches.item(0).clientY }),
        panMove = (event, { toPolarCoordinates }) => recognize(recognizer(event, { toPolarCoordinates }), listener),
        panCancel = () => ['startPoint', 'endPoint', 'distance', 'angle'].forEach(datum => (eventMetadata[datum] = undefined)),
        panEnd = () => { /* do nothing */ },
        touchListeners = [
          ['touchstart', event => handle(panStart, onStart, event, eventMetadata)],
          ['touchmove', event => handle(panMove, onMove, event, eventMetadata)],
          ['touchcancel', event => handle(panCancel, onCancel, event, eventMetadata)],
          ['touchend', event => handle(panEnd, onEnd, event, eventMetadata)],
        ],
        mouseEquivalents = includesMouseEquivalents ? toMouseEquivalents(touchListeners) : []

  return [
    ...touchListeners,
    ...mouseEquivalents
  ]
}
function panUp (listener, eventMetadata, options) {
  options = withDirectionCondition('up', options)
  return pan(listener, eventMetadata, options)
}
function panUpRight (listener, eventMetadata, options) {
  options = withDirectionCondition('upRight', options)
  return pan(listener, eventMetadata, options)
}
function panRight (listener, eventMetadata, options) {
  options = withDirectionCondition('right', options)
  return pan(listener, eventMetadata, options)
}
function panDownRight (listener, eventMetadata, options) {
  options = withDirectionCondition('downRight', options)
  return pan(listener, eventMetadata, options)
}
function panDown (listener, eventMetadata, options) {
  options = withDirectionCondition('down', options)
  return pan(listener, eventMetadata, options)
}
function panDownLeft (listener, eventMetadata, options) {
  options = withDirectionCondition('downLeft', options)
  return pan(listener, eventMetadata, options)
}
function panLeft (listener, eventMetadata, options) {
  options = withDirectionCondition('left', options)
  return pan(listener, eventMetadata, options)
}
function panUpLeft (listener, eventMetadata, options) {
  options = withDirectionCondition('upLeft', options)
  return pan(listener, eventMetadata, options)
}

/*
 * Swipe is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - ends
 */
function swipe (listener, eventMetadata, options) {
  options = {
    minDistance: 0,
    minVelocity: 0,
    conditions: [],
    includesMouseEquivalents: false,
    ...options
  }

  const { minDistance, minVelocity, conditions, includesMouseEquivalents, onStart, onMove, onCancel, onEnd } = options,
        storeEventData = (event, { toPolarCoordinates }) => {
          const { x: xA, y: yA } = eventMetadata.startPoint,
                { clientX: xB, clientY: yB } = event.touches.item(0),
                { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
                endPoint = { x: xB, y: yB },
                endTime = event.timeStamp

          eventMetadata.endPoint = endPoint
          eventMetadata.endTime = endTime
          eventMetadata.distance = distance
          eventMetadata.angle = angle
          eventMetadata.velocity = distance / (eventMetadata.endTime - eventMetadata.startTime)
        },
        recognizer = event => [
          () => eventMetadata.distance > minDistance,
          () => eventMetadata.velocity > minVelocity,
          ...conditions
        ].every(condition => condition(event, eventMetadata, listenerApi)),
        swipeStart = event => {
          eventMetadata.startTime = event.timeStamp
          eventMetadata.startPoint = { x: event.touches.item(0).clientX, y: event.touches.item(0).clientY }
        },
        swipeMove = (event, { toPolarCoordinates }) => storeEventData(event, { toPolarCoordinates }),
        swipeCancel = () => ['startPoint', 'endPoint', 'startTime', 'endTime', 'distance', 'angle', 'velocity'].forEach(datum => (eventMetadata[datum] = undefined)),
        swipeEnd = (event, { toPolarCoordinates }) => recognize(recognizer(event, { toPolarCoordinates }), listener),
        touchListeners = [
          ['touchstart', event => handle(swipeStart, onStart, event, eventMetadata)],
          ['touchmove', event => handle(swipeMove, onMove, event, eventMetadata)],
          ['touchcancel', event => handle(swipeCancel, onCancel, event, eventMetadata)],
          ['touchend', event => handle(swipeEnd, onEnd, event, eventMetadata)],
        ],
        mouseEquivalents = includesMouseEquivalents ? toMouseEquivalents(touchListeners) : []

  return [
    ...touchListeners,
    ...mouseEquivalents
  ]
}
function swipeUp (listener, eventMetadata, options) {
  options = withDirectionCondition('up', options)
  return swipe(listener, eventMetadata, options)
}
function swipeUpRight (listener, eventMetadata, options) {
  options = withDirectionCondition('upRight', options)
  return swipe(listener, eventMetadata, options)
}
function swipeRight (listener, eventMetadata, options) {
  options = withDirectionCondition('right', options)
  return swipe(listener, eventMetadata, options)
}
function swipeDownRight (listener, eventMetadata, options) {
  options = withDirectionCondition('downRight', options)
  return swipe(listener, eventMetadata, options)
}
function swipeDown (listener, eventMetadata, options) {
  options = withDirectionCondition('down', options)
  return swipe(listener, eventMetadata, options)
}
function swipeDownLeft (listener, eventMetadata, options) {
  options = withDirectionCondition('downLeft', options)
  return swipe(listener, eventMetadata, options)
}
function swipeLeft (listener, eventMetadata, options) {
  options = withDirectionCondition('left', options)
  return swipe(listener, eventMetadata, options)
}
function swipeUpLeft (listener, eventMetadata, options) {
  options = withDirectionCondition('upLeft', options)
  return swipe(listener, eventMetadata, options)
}

/*
 * Pinch is defined as two touches that:
 * - each start at a given point, a given distance from each other
 * - change their starting distance by more than 0px (or a minimum distance of your choice)
 */
function pinch (listener, eventMetadata, options) {

}
function pinchIn (listener, eventMetadata, options) {

}
function pinchOut (listener, eventMetadata, options) {

}

// Press
function press (listener, eventMetadata, options) {

}
function pressup (listener, eventMetadata, options) {

}

/*
 * Rotate is defined as two touches that:
 * - each start at a given point, forming a line with a given angle
 * - change their starting angle by more than 0 degrees (or a minimum rotation of your choice)
 */
function rotate (listener, eventMetadata, options) {

}

/*
 * Tap is defined as a single touch that:
 * - starts at given point
 * - does not travel
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each tap ocurring less than or equal to 500ms (or a maximum interval of your choice) after the previous tap
 */
function tap (listener, eventMetadata, options) {
  options = {
    minTaps: 1,
    maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
    conditions: [],
    includesMouseEquivalents: false,
    ...options
  }

  let didNotTravel = true,
      recognized = false

  function reset () {
    didNotTravel = true
    recognized = false
    eventMetadata.taps = 0
    eventMetadata.endTimes = []
    eventMetadata.points = []
  }

  reset()

  const { minTaps, maxInterval, conditions, includesMouseEquivalents, onStart, onMove, onEnd } = options,
        recognizer = event => {
          const lastTapTime = eventMetadata.endTimes.reverse()[0],
                secondToLastTapTime = eventMetadata.endTimes.reverse()[1]

          switch (true) {
          case !didNotTravel: // Guard against travelling taps
            reset()
            break
          case minTaps === 1: // Shortcut for single taps
            recognized = conditions.every(condition => condition(event, eventMetadata, listenerApi))
            break
          case lastTapTime - secondToLastTapTime > maxInterval: // Guard against taps with intervals that are too large
            const lastPoint = eventMetadata.points.reverse()[0]
            reset()
            eventMetadata.taps += 1
            eventMetadata.endTimes.push(lastTapTime)
            eventMetadata.points.push(lastPoint)
            break
          default:
            recognized = [
              () => eventMetadata.taps >= minTaps,
              () => eventMetadata.endTimes.every((endTime, index, array) => index === 0 || endTime - array[index - 1] <= maxInterval),
              ...conditions
            ].every(condition => condition(event, eventMetadata, listenerApi))
            break
          }

          return recognized
        },
        tapStart = () => {
          if (recognized) {
            reset()
          }
        },
        tapMove = () => (didNotTravel = false),
        tapEnd = event => {
          eventMetadata.taps += 1
          eventMetadata.endTimes.push(event.timeStamp)
          eventMetadata.points.push({ x: event.changedTouches.item(0).clientX, y: event.changedTouches.item(0).clientY })
          recognize(recognizer(event), listener)
        },
        touchListeners = [
          ['touchstart', event => handle(tapStart, onStart, event, eventMetadata)],
          ['touchmove', event => handle(tapMove, onMove, event, eventMetadata)],
          ['touchend', event => handle(tapEnd, onEnd, event, eventMetadata)],
        ],
        mouseEquivalents = includesMouseEquivalents ? toMouseEquivalents(touchListeners) : []

  return [
    ...touchListeners,
    ...mouseEquivalents
  ]
}

export default {
  pan,
  panUp,
  panUpRight,
  panRight,
  panDownRight,
  panDown,
  panDownLeft,
  panLeft,
  panUpLeft,
  pinch,
  press,
  pressup,
  rotate,
  swipe,
  swipeUp,
  swipeUpRight,
  swipeRight,
  swipeDownRight,
  swipeDown,
  swipeDownLeft,
  swipeLeft,
  swipeUpLeft,
  tap,
}
