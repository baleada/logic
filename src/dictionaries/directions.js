export default {
  up: {
    degrees: degrees => (degrees >= 45 && degrees <= 135),
    radians: radians => (radians >= 0.25 * Math.PI && radians <= 0.75 * Math.PI),
  },
  left: {
    degrees: degrees => (degrees > 135 && degrees < 225),
    radians: radians => (radians > 0.75 * Math.PI && radians < 1.25 * Math.PI),
  },
  down: {
    degrees: degrees => (degrees >= 225 && degrees <= 315),
    radians: radians => (radians >= 1.25 * Math.PI && radians <= 1.75 * Math.PI),
  },
  right: {
    degrees: degrees => ((degrees > 315 && degrees <= 360) || (degrees < 45 && degrees >= 0)),
    radians: radians => ((radians > 1.75 * Math.PI && radians <= 2 * Math.PI) || (radians < 0.25 * Math.PI && radians >= 0)),
  }
}
