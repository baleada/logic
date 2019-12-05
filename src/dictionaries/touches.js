// TODO: figure out if touch action CSS stuff is necessary

/* Utils */
import { is, withDirectionCondition, toPolarCoordinates, toDirection, toMouseEquivalents } from '../util'
import directions from './directions'

/* recognize */
const listenerApi = {
  toDirection
}

function recognize ({ recognized, listener, event }) {
  if (recognized) {
    console.log({ recognized })
    listener(event, listenerApi)
  }
}

/* handle */
const handlerApi = {
  toPolarCoordinates
}

function handle (requiredHandler, optionalHandler, event, store) {
  console.log({ handle: event })
  requiredHandler(event, handlerApi)
  if (is.function(optionalHandler)) {
    optionalHandler(event, store, handlerApi)
  }
}

/* Listener getters */

/*
 * Pan is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 */
function pan (required, options) {
  const { listener, setStore, getStore } = required

  options = {
    minDistance: 0,
    conditions: [],
    includesMouseEquivalents: false,
    ...options
  }

  if (directions.hasOwnProperty(options.direction)) {
    options = withDirectionCondition(options.direction, options)
  }

  const state = {
    isSingleTouch: true
  }
  function reset () {
    [
      'startPoint',
      'endPoint',
      'startTime',
      'endTime',
      'distance',
      'angle',
      'velocity'
    ].forEach(datum => (setStore(datum, undefined)))
    state.isSingleTouch = true
  }

  const { minDistance, conditions, includesMouseEquivalents, onStart, onMove, onCancel, onEnd } = options,
        recognizer = (event, { toPolarCoordinates }) => {
          let recognized
          switch (true) {
          case !state.isSingleTouch: // Guard against multiple touches
            reset()
            recognized = false
            break
          default:
            const { x: xA, y: yA } = getStore('startPoint'),
                  { clientX: xB, clientY: yB } = event.touches.item(0),
                  { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
                  endPoint = { x: xB, y: yB }

            setStore('endPoint', endPoint)
            setStore('distance', distance)
            setStore('angle', angle)

            recognized = [
              () => getStore('distance') > minDistance,
              ...conditions
            ].every(condition => condition(event, getStore(), listenerApi))
            break
          }

          return recognized
        },
        panStart = event => {
          state.isSingleTouch = event.touches.length === 1
          setStore('startPoint', { x: event.touches.item(0).clientX, y: event.touches.item(0).clientY })
        },
        panMove = (event, { toPolarCoordinates }) => recognize({ recognized: recognizer(event, { toPolarCoordinates }), listener, event }),
        panCancel = () => reset(),
        panEnd = () => { /* do nothing */ },
        touchListeners = [
          ['touchstart', event => handle(panStart, onStart, event, getStore())],
          ['touchmove', event => handle(panMove, onMove, event, getStore())],
          ['touchcancel', event => handle(panCancel, onCancel, event, getStore())],
          ['touchend', event => handle(panEnd, onEnd, event, getStore())],
        ],
        mouseEquivalents = includesMouseEquivalents ? toMouseEquivalents(touchListeners) : []

  return [
    ...touchListeners,
    ...mouseEquivalents
  ]
}

/*
 * Swipe is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - ends
 */
function swipe (required, options) {
  const { listener, setStore, getStore } = required

  options = {
    minDistance: 0,
    minVelocity: 0,
    conditions: [],
    includesMouseEquivalents: false,
    ...options
  }

  if (directions.hasOwnProperty(options.direction)) {
    options = withDirectionCondition(options.direction, options)
  }

  const state = {
    isSingleTouch: true
  }
  function reset () {
    [
      'startPoint',
      'endPoint',
      'startTime',
      'endTime',
      'distance',
      'angle',
      'velocity'
    ].forEach(datum => (setStore(datum, undefined)))
    state.isSingleTouch = true
  }

  const { minDistance, minVelocity, conditions, includesMouseEquivalents, onStart, onMove, onCancel, onEnd } = options,
        storeEventMetadata = (event, { toPolarCoordinates }) => {
          const { x: xA, y: yA } = getStore('startPoint'),
                { clientX: xB, clientY: yB } = event.touches.item(0),
                { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
                endPoint = { x: xB, y: yB },
                endTime = event.timeStamp

          setStore('endPoint', endPoint)
          setStore('endTime', endTime)
          setStore('distance', distance)
          setStore('angle', angle)
          setStore('velocity', distance / (getStore('endTime') - getStore('startTime')))
        },
        recognizer = event => {
          let recognized
          switch (true) {
          case !state.isSingleTouch: // Guard against multiple touches
            reset()
            recognized = false
            break
          default:
            recognized = [
              () => getStore('distance') > minDistance,
              () => getStore('velocity') > minVelocity,
              ...conditions
            ].every(condition => condition(event, getStore(), listenerApi))
            break
          }

          return recognized
        },
        swipeStart = event => {
          state.isSingleTouch = event.touches.length === 1
          setStore('startTime', event.timeStamp)
          setStore('startPoint', { x: event.touches.item(0).clientX, y: event.touches.item(0).clientY })
        },
        swipeMove = (event, { toPolarCoordinates }) => {
          if (state.isSingleTouch) {
            storeEventMetadata(event, { toPolarCoordinates })
          }
        },
        swipeCancel = () => reset(),
        swipeEnd = (event, { toPolarCoordinates }) => recognize({ recognized: recognizer(event, { toPolarCoordinates }), listener, event }),
        touchListeners = [
          ['touchstart', event => handle(swipeStart, onStart, event, getStore())],
          ['touchmove', event => handle(swipeMove, onMove, event, getStore())],
          ['touchcancel', event => handle(swipeCancel, onCancel, event, getStore())],
          ['touchend', event => handle(swipeEnd, onEnd, event, getStore())],
        ],
        mouseEquivalents = includesMouseEquivalents ? toMouseEquivalents(touchListeners) : []

  return [
    ...touchListeners,
    ...mouseEquivalents
  ]
}

/*
 * Pinch is defined as two touches that:
 * - each start at a given point, a given distance from each other
 * - change their starting distance by more than 0px (or a minimum distance of your choice)
 */
function pinch (required, options) {
  // const { listener, setStore, getStore } = required
}
// function pinchIn (required, options) {
//   const { listener, setStore, getStore } = required
// }
// function pinchOut (required, options) {
//   const { listener, setStore, getStore } = required
// }

// Press
function press (required, options) {
  // const { listener, setStore, getStore } = required
}
function pressup (required, options) {
  // const { listener, setStore, getStore } = required
}

/*
 * Rotate is defined as two touches that:
 * - each start at a given point, forming a line with a given angle
 * - change their starting angle by more than 0 degrees (or a minimum rotation of your choice)
 */
function rotate (required, options) {
  // const { listener, setStore, getStore } = required
}

/*
 * Tap is defined as a single touch that:
 * - starts at given point
 * - does not travel
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each tap ocurring less than or equal to 500ms (or a maximum interval of your choice) after the previous tap
 */
function tap (required, options) {
  const { listener, setStore, getStore } = required

  options = {
    minTaps: 1,
    maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
    conditions: [],
    includesMouseEquivalents: false,
    ...options
  }

  const state = {
    didNotTravel: true,
    isSingleTouch: true,
    recognized: false,
  }
  function reset () {
    state.didNotTravel = true
    state.isSingleTouch = true
    state.recognized = false
    setStore('taps', 0)
    setStore('endTimes', [])
    setStore('points', [])
  }

  reset()

  const { minTaps, maxInterval, conditions, includesMouseEquivalents, onStart, onMove, onEnd } = options,
        recognizer = event => {
          const lastTapTime = getStore('endTimes').reverse()[0],
                secondToLastTapTime = getStore('endTimes').reverse()[1]

          switch (true) {
          case !state.didNotTravel || !state.isSingleTouch: // Guard against travelling taps and multiple touches
            reset()
            break
          case minTaps === 1: // Shortcut for single taps
            state.recognized = conditions.every(condition => condition(event, getStore(), listenerApi))
            break
          case lastTapTime - secondToLastTapTime > maxInterval: // Guard against taps with intervals that are too large
            const lastPoint = getStore('points').reverse()[0]
            reset()
            setStore('taps', 1)
            setStore('endTimes', [...getStore('endTimes'), lastTapTime])
            setStore('points', [...getStore('points'), lastPoint])
            break
          default:
            state.recognized = [
              () => getStore('taps') >= minTaps,
              () => getStore('endTimes').every((endTime, index, array) => index === 0 || endTime - array[index - 1] <= maxInterval),
              ...conditions
            ].every(condition => condition(event, getStore(), listenerApi))
            break
          }

          return state.recognized
        },
        tapStart = event => {
          if (state.recognized) {
            reset()
          }
          state.isSingleTouch = event.touches.length === 1
        },
        tapMove = () => (state.didNotTravel = false),
        tapEnd = event => {
          setStore('taps', 1)
          setStore('endTimes', [...getStore('endTimes'), event.timeStamp])
          setStore('points', [...getStore('points'), { x: event.changedTouches.item(0).clientX, y: event.changedTouches.item(0).clientY }])
          recognize({ recognized: recognizer(event), listener, event })
        },
        touchListeners = [
          ['touchstart', event => handle(tapStart, onStart, event, getStore())],
          ['touchmove', event => handle(tapMove, onMove, event, getStore())],
          ['touchend', event => handle(tapEnd, onEnd, event, getStore())],
        ],
        mouseEquivalents = includesMouseEquivalents ? toMouseEquivalents(touchListeners) : []

  return [
    ...touchListeners,
    ...mouseEquivalents
  ]
}

export default {
  pan,
  pinch,
  press,
  pressup,
  rotate,
  swipe,
  tap,
}
