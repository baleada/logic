export default function withDirectionCondition (direction, options) {
  const conditions = options.conditions || []

  return {
    ...options,
    conditions: [
      (event, store, { toDirection }) => toDirection(store.angle.degrees) === direction,
      ...conditions
    ],
  }
}
