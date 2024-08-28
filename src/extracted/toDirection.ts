export type Direction =  'up' | 'upRight' | 'right' | 'downRight' | 'down' | 'downLeft' | 'left' | 'upLeft' | 'none'
type Unit = 'degrees' | 'radians'

type PredicatesByUnit = Record<Unit, (descriptor: { angle: number, distance: number }) => boolean>

export function toDirection ({ angle, distance, unit = 'degrees' }: { angle: number, distance: number, unit?: Unit }): Direction {
  return (Object.keys(directions) as Direction[]).find(direction => directions[direction][unit]({ angle, distance }))
}

const directions: Record<Direction, PredicatesByUnit> = {
  none: {
    degrees: ({ distance }) => !distance,
    radians: ({ distance }) => !distance,
  },
  up: {
    degrees: ({ angle: degrees }) => (degrees >= 67.5 && degrees <= 112.5),
    radians: ({ angle: radians }) => (radians >= 0.375 * Math.PI && radians <= 0.625 * Math.PI),
  },
  upRight: {
    degrees: ({ angle: degrees }) => (degrees >= 22.5 && degrees < 67.5),
    radians: ({ angle: radians }) => (radians >= 0.125 * Math.PI && radians < 0.375 * Math.PI),
  },
  right: {
    degrees: ({ angle: degrees }) => ((degrees > 337.5 && degrees <= 360) || (degrees < 22.5 && degrees >= 0)),
    radians: ({ angle: radians }) => ((radians > 1.875 * Math.PI && radians <= 2 * Math.PI) || (radians < 0.125 * Math.PI && radians >= 0)),
  },
  downRight: {
    degrees: ({ angle: degrees }) => (degrees > 292.5 && degrees <= 337.5),
    radians: ({ angle: radians }) => (radians > 1.625 * Math.PI && radians <= 1.875 * Math.PI),
  },
  down: {
    degrees: ({ angle: degrees }) => (degrees >= 247.5 && degrees <= 292.5),
    radians: ({ angle: radians }) => (radians >= 1.375 * Math.PI && radians <= 1.625 * Math.PI),
  },
  downLeft: {
    degrees: ({ angle: degrees }) => (degrees >= 202.5 && degrees < 247.5),
    radians: ({ angle: radians }) => (radians >= 1.125 * Math.PI && radians < 1.375 * Math.PI),
  },
  left: {
    degrees: ({ angle: degrees }) => (degrees > 157.5 && degrees < 202.5),
    radians: ({ angle: radians }) => (radians > 0.875 * Math.PI && radians < 1.125 * Math.PI),
  },
  upLeft: {
    degrees: ({ angle: degrees }) => (degrees > 112.5 && degrees <= 157.5),
    radians: ({ angle: radians }) => (radians > 0.625 * Math.PI && radians <= 0.875 * Math.PI),
  },
}
