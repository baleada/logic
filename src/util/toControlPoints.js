export default function toControlPoints(timing) {
  const { 0: point1x, 1: point1y, 2: point2x, 3: point2y } = timing
  
  return [
    { x: point1x, y: point1y },
    { x: point2x, y: point2y },
  ]
}