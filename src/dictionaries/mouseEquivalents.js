const mouseEquivalents = {
  touchstart: 'mousedown',
  touchend: 'mouseup',
  touchmove: 'mousemove',
  touchcancel: 'mouseout',
}

export function toMouseEquivalents (touchListeners) {
  return touchListeners
    .map(([eventType, listener]) => [mouseEquivalents[eventType], listener])
    .filter(([eventType]) => !!eventType)
}

export default mouseEquivalents
