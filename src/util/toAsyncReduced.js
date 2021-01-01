export default async function toAsyncReduced ({ array, reducer, initialValue }) {
  return await array.reduce(async (...args) => {
    const reduced = await args[0]
    return reducer(reduced, ...args.slice(1))
  }, Promise.resolve(initialValue))
}
