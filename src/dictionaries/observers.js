// closures allow for server-side rendering
export default {
  intersect: () => IntersectionObserver,
  mutate: () => MutationObserver,
  resize: () => ResizeObserver,
}
