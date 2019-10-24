const directions = {
  up: {
    degrees: degrees => (degrees >= 67.5 && degrees <= 112.5),
    radians: radians => (radians >= 0.375 * Math.PI && radians <= 0.625 * Math.PI),
  },
  upRight: {
    degrees: degrees => (degrees >= 22.5 && degrees < 67.5),
    radians: radians => (radians >= 0.125 * Math.PI && radians < 0.375 * Math.PI),
  },
  right: {
    degrees: degrees => ((degrees > 337.5 && degrees <= 360) || (degrees < 22.5 && degrees >= 0)),
    radians: radians => ((radians > 1.875 * Math.PI && radians <= 2 * Math.PI) || (radians < 0.125 * Math.PI && radians >= 0)),
  },
  downRight: {
    degrees: degrees => (degrees > 292.5 && degrees <= 337.5),
    radians: radians => (radians > 1.625 * Math.PI && radians <= 1.875 * Math.PI),
  },
  down: {
    degrees: degrees => (degrees >= 247.5 && degrees <= 292.5),
    radians: radians => (radians >= 1.375 * Math.PI && radians <= 1.625 * Math.PI),
  },
  downLeft: {
    degrees: degrees => (degrees >= 202.5 && degrees < 247.5),
    radians: radians => (radians >= 1.125 * Math.PI && radians < 1.375 * Math.PI),
  },
  left: {
    degrees: degrees => (degrees > 157.5 && degrees < 202.5),
    radians: radians => (radians > 0.875 * Math.PI && radians < 1.125 * Math.PI),
  },
  upLeft: {
    degrees: degrees => (degrees > 112.5 && degrees <= 157.5),
    radians: radians => (radians > 0.625 * Math.PI && radians <= 0.875 * Math.PI),
  },
}

export function toDirection (angle, unit = 'degrees') {
  return Object.keys(directions).find(direction => directions[direction][unit](angle))
}

export default directions
