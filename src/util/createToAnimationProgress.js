import BezierEasing from 'bezier-easing'

export default function createToAnimationProgress (points) {
  const { 0: { x: point1x, y: point1y }, 1: { x: point2x, y: point2y } } = points
  return BezierEasing(point1x, point1y, point2x, point2y)
}
