/*
 * Pan is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 */
export default function(listener, options) {
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
