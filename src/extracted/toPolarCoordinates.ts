export type PolarCoordinates = {
  distance: number,
  angle: { radians: number, degrees: number }
}

export function toPolarCoordinates ({ xA, xB, yA, yB }: { xA: number, xB: number, yA: number, yB: number }): PolarCoordinates {
  const distance = Math.hypot(xB - xA, yB - yA),
        angle = Math.atan2((yA - yB), (xB - xA)),
        radians = angle >= 0
          ? angle
          : 2 * Math.PI + angle,
        degrees = radians * 180 / Math.PI

  return {
    distance,
    angle: { radians, degrees },
  }
}
