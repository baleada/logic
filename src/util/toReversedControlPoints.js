export default function toReversedControlPoints (points) {
  return Array.from(points).reverse() // Reverse without mutating
    .map(({ x, y }) => ({ x: 1 - x, y: 1 - y })) // This easy reversal is why the control point objects are preferable
}