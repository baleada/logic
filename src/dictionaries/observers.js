// closures allow for server-side rendering
export default {
  intersect: (listener, options) => new IntersectionObserver(listener, options),
  mutate: (listener, options) => new MutationObserver(listener, options),
  resize: (listener, options) => new ResizeObserver(listener, options),
}
